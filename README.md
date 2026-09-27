# Store Rating Platform

Full-stack web application where users submit 1–5 ratings for stores registered on the platform, built for the FullStack Intern Coding Challenge.

| Layer    | Tech                                                  |
|----------|-------------------------------------------------------|
| Frontend | React 19, React Router, Axios, Vite                   |
| Backend  | Node.js, Express 5, express-validator, JWT, bcryptjs  |
| Database | MySQL 8 (MariaDB 10.4+ also works)                    |

## Features

A single login is shared by all users. After login, each user is routed to the screens for their role.

### System Administrator
- Dashboard with the total number of users, stores and submitted ratings
- Add users of any role (Admin, Normal User, Store Owner) with name, email, password and address
- Add stores (name, email, address), optionally assigned to a Store Owner
- Store list with Name, Email, Address and Rating (plus the owner)
- User list with Name, Email, Address and Role
- Filters on every list: Name, Email, Address and Role
- User details page. For Store Owners it also shows their store's rating
- Change password, log out

### Normal User
- Sign up (Name, Email, Address, Password) and log in
- List of all stores, searchable by name and address
- Each store shows Store Name, Address, Overall Rating, the user's own rating, and a control to submit or modify that rating (1–5)
- Change password, log out

### Store Owner
- Log in
- Dashboard with the store's average rating, the total number of ratings, and the list of users who rated the store (name, email, address, rating, date)
- Change password, log out

### Cross-cutting
- **Sorting:** every table sorts ascending/descending on its key columns. Click a column header to sort. Sorting runs on the server, with column whitelists.
- **Validation:** the same rules are enforced on the client (`frontend/src/utils/validation.js`) and on the server (`backend/src/validators/rules.js`):
  - Name: 20–60 characters (applied to user and store names)
  - Address: required, at most 400 characters
  - Password: 8–16 characters, with at least one uppercase letter and one special character
  - Email: standard email format, unique
- **Security:** bcrypt password hashing, JWT auth, role-based route guards on the API and in the UI, parameterised SQL, Helmet and CORS

## Project structure

```
backend/
  src/
    config/        env + MySQL connection pool
    controllers/   auth, admin, store (normal user), owner
    db/            schema.sql, init.js (create DB + admin), seed.js (demo data)
    middleware/    authenticate/authorize, validation, error handling
    routes/        Express routers per area
    utils/         list filtering/sorting builder, JWT helpers, errors
    validators/    express-validator rules
frontend/
  src/
    api/           Axios client with auth interceptor
    components/    DataTable (sortable), FilterBar, StarRating, Modal, Navbar, route guards…
    context/       AuthContext
    hooks/         useListQuery (filter + sort + fetch), useForm, useDebounce
    pages/         Login, Signup, ChangePassword, admin/*, user/*, owner/*
```

## Database schema

```
users    (id PK, name VARCHAR(60), email UNIQUE, password_hash, address VARCHAR(400),
          role ENUM('ADMIN','USER','OWNER'), created_at, updated_at)
stores   (id PK, name VARCHAR(60), email UNIQUE, address VARCHAR(400),
          owner_id FK -> users.id UNIQUE NULL ON DELETE SET NULL, created_at, updated_at)
ratings  (id PK, user_id FK -> users.id ON DELETE CASCADE, store_id FK -> stores.id ON DELETE CASCADE,
          rating TINYINT CHECK (1..5), created_at, updated_at, UNIQUE(user_id, store_id))
```

- A user can rate a store only once: `UNIQUE(user_id, store_id)`. Modifying a rating updates that row.
- Average ratings are computed with aggregate queries rather than stored, so they never go stale.
- Columns that are filtered or joined on are indexed.

The full DDL is in [`backend/src/db/schema.sql`](backend/src/db/schema.sql).

## Getting started

### Prerequisites
- Node.js 18+
- A running MySQL 8 server (or MariaDB 10.4+)

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env        # then edit DB_USER / DB_PASSWORD / JWT_SECRET
npm run db:init             # creates the database, tables and the admin account
# or: npm run db:seed       # same as above, plus demo owners, users, stores and ratings
npm run dev                 # http://localhost:5000
```

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env        # VITE_API_URL=http://localhost:5000/api
npm run dev                 # http://localhost:5173
```

### Default accounts

| Role        | Email                                        | Password     |
|-------------|----------------------------------------------|--------------|
| Admin       | `admin@example.com` (set in `.env`)          | `Admin@123`  |
| Store Owner | `owner1@example.com` … `owner3@example.com`  | `Password@1` |
| Normal User | `user1@example.com` … `user3@example.com`    | `Password@1` |

Only the admin account exists after `npm run db:init`. The owner and user accounts are created by `npm run db:seed`.

## API reference

All endpoints are prefixed with `/api`. Authenticated endpoints expect `Authorization: Bearer <token>`.

| Method | Endpoint                     | Role   | Description |
|--------|------------------------------|--------|-------------|
| POST   | `/auth/register`             | public | Normal-user sign-up |
| POST   | `/auth/login`                | public | Login for every role |
| GET    | `/auth/me`                   | any    | Current user |
| PUT    | `/auth/password`             | any    | Change password (`currentPassword`, `newPassword`) |
| GET    | `/admin/dashboard`           | ADMIN  | Totals for users, stores and ratings |
| GET    | `/admin/users`               | ADMIN  | List users. Query: `name, email, address, role, sortBy, order` |
| POST   | `/admin/users`               | ADMIN  | Create a user of any role |
| GET    | `/admin/users/:id`           | ADMIN  | User details (with rating for store owners) |
| GET    | `/admin/stores`              | ADMIN  | List stores. Query: `name, email, address, sortBy, order` |
| POST   | `/admin/stores`              | ADMIN  | Create a store (`ownerId` optional) |
| GET    | `/admin/owners/available`    | ADMIN  | Store owners who do not have a store yet |
| GET    | `/stores`                    | USER   | Stores with the overall rating and your rating. Query: `name, address, sortBy, order` |
| PUT    | `/stores/:storeId/rating`    | USER   | Submit or modify your rating (`rating`: 1–5) |
| GET    | `/owner/dashboard`           | OWNER  | Store, average rating and the users who rated it. Query: `sortBy, order` |

`order` is `asc` or `desc`. Validation errors return `400` in the form `{ message, errors: { field: message } }`.
