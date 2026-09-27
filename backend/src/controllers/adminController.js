const bcrypt = require('bcryptjs');
const pool = require('../config/db');
const ApiError = require('../utils/ApiError');
const ROLES = require('../utils/roles');
const { buildListQuery } = require('../utils/listQuery');
const { SALT_ROUNDS } = require('./authController');

// Average rating per store, reused by several queries.
const STORE_RATING_JOIN = `
  LEFT JOIN (
    SELECT store_id, ROUND(AVG(rating), 2) AS avg_rating, COUNT(*) AS rating_count
    FROM ratings GROUP BY store_id
  ) r ON r.store_id = s.id`;

// GET /api/admin/dashboard
exports.dashboard = async (req, res) => {
  const [[counts]] = await pool.query(`
    SELECT
      (SELECT COUNT(*) FROM users)   AS totalUsers,
      (SELECT COUNT(*) FROM stores)  AS totalStores,
      (SELECT COUNT(*) FROM ratings) AS totalRatings`);
  res.json(counts);
};

// GET /api/admin/users?name=&email=&address=&role=&sortBy=&order=
exports.listUsers = async (req, res) => {
  const { where, params, orderBy } = buildListQuery(
    req.query,
    {
      name: { column: 'u.name' },
      email: { column: 'u.email' },
      address: { column: 'u.address' },
      role: { column: 'u.role', exact: true },
    },
    { name: 'u.name', email: 'u.email', address: 'u.address', role: 'u.role', createdAt: 'u.created_at' },
    'name',
  );

  const [rows] = await pool.query(
    `SELECT u.id, u.name, u.email, u.address, u.role, u.created_at AS createdAt
     FROM users u ${where} ${orderBy}, u.id ASC`,
    params,
  );
  res.json(rows);
};

// GET /api/admin/users/:id — includes store rating when the user is a store owner.
exports.getUser = async (req, res) => {
  const [rows] = await pool.query(
    `SELECT u.id, u.name, u.email, u.address, u.role, u.created_at AS createdAt,
            s.id AS storeId, s.name AS storeName, r.avg_rating AS rating, COALESCE(r.rating_count, 0) AS ratingCount
     FROM users u
     LEFT JOIN stores s ON s.owner_id = u.id
     ${STORE_RATING_JOIN}
     WHERE u.id = ?`,
    [req.params.id],
  );
  if (!rows.length) throw new ApiError(404, 'User not found');

  const { storeId, storeName, rating, ratingCount, ...user } = rows[0];
  if (user.role === ROLES.OWNER) {
    user.store = storeId ? { id: storeId, name: storeName } : null;
    user.rating = rating;
    user.ratingCount = ratingCount;
  }
  res.json(user);
};

// POST /api/admin/users — admin can create users of any role.
exports.createUser = async (req, res) => {
  const { name, email, address, password, role } = req.body;
  const hash = await bcrypt.hash(password, SALT_ROUNDS);
  const [result] = await pool.query(
    'INSERT INTO users (name, email, address, password_hash, role) VALUES (?, ?, ?, ?, ?)',
    [name, email, address, hash, role],
  );
  res.status(201).json({ id: result.insertId, name, email, address, role });
};

// GET /api/admin/stores?name=&email=&address=&sortBy=&order=
exports.listStores = async (req, res) => {
  const { where, params, orderBy } = buildListQuery(
    req.query,
    {
      name: { column: 's.name' },
      email: { column: 's.email' },
      address: { column: 's.address' },
    },
    { name: 's.name', email: 's.email', address: 's.address', rating: 'r.avg_rating', createdAt: 's.created_at' },
    'name',
  );

  const [rows] = await pool.query(
    `SELECT s.id, s.name, s.email, s.address, r.avg_rating AS rating,
            COALESCE(r.rating_count, 0) AS ratingCount, o.id AS ownerId, o.name AS ownerName
     FROM stores s
     ${STORE_RATING_JOIN}
     LEFT JOIN users o ON o.id = s.owner_id
     ${where} ${orderBy}, s.id ASC`,
    params,
  );
  res.json(rows);
};

// POST /api/admin/stores
exports.createStore = async (req, res) => {
  const { name, email, address } = req.body;
  const ownerId = req.body.ownerId || null;

  if (ownerId) {
    const [owners] = await pool.query('SELECT role FROM users WHERE id = ?', [ownerId]);
    if (!owners.length || owners[0].role !== ROLES.OWNER) {
      throw new ApiError(400, 'Selected owner must be a user with the Store Owner role', {
        ownerId: 'Selected owner must be a user with the Store Owner role',
      });
    }
  }

  const [result] = await pool.query(
    'INSERT INTO stores (name, email, address, owner_id) VALUES (?, ?, ?, ?)',
    [name, email, address, ownerId],
  );
  res.status(201).json({ id: result.insertId, name, email, address, ownerId });
};

// GET /api/admin/owners/available — store owners without a store (for the "add store" form).
exports.availableOwners = async (req, res) => {
  const [rows] = await pool.query(
    `SELECT u.id, u.name, u.email FROM users u
     LEFT JOIN stores s ON s.owner_id = u.id
     WHERE u.role = ? AND s.id IS NULL
     ORDER BY u.name`,
    [ROLES.OWNER],
  );
  res.json(rows);
};
