// Demo data: store owners with stores, normal users and ratings. Safe to re-run.
const bcrypt = require('bcryptjs');

const PASSWORD = 'Password@1';

const owners = [
  { name: 'Olivia Thompson Store Owner', email: 'owner1@example.com', address: '12 Market Street, Pune' },
  { name: 'Rahul Mehta Bakery Proprietor', email: 'owner2@example.com', address: '45 MG Road, Bengaluru' },
  { name: 'Sophia Martinez Electronics Owner', email: 'owner3@example.com', address: '9 Park Avenue, Mumbai' },
];

const stores = [
  { name: 'Green Valley Organic Grocery Mart', email: 'greenvalley@example.com', address: '12 Market Street, Pune', owner: 0 },
  { name: 'Sunrise Artisan Bakery and Cafe', email: 'sunrise@example.com', address: '45 MG Road, Bengaluru', owner: 1 },
  { name: 'TechHub Electronics and Gadgets Store', email: 'techhub@example.com', address: '9 Park Avenue, Mumbai', owner: 2 },
  { name: 'City Central Books and Stationery', email: 'citybooks@example.com', address: '77 Residency Road, Chennai', owner: null },
];

const users = [
  { name: 'Aarav Sharma Regular Customer', email: 'user1@example.com', address: '3 Lake View, Pune' },
  { name: 'Emily Johnson Frequent Shopper', email: 'user2@example.com', address: '18 Hill Road, Mumbai' },
  { name: 'Mohammed Khan Weekend Visitor', email: 'user3@example.com', address: '5 Brigade Road, Bengaluru' },
];

// [userIndex, storeIndex, rating]
const ratings = [
  [0, 0, 5], [0, 1, 4], [0, 2, 3],
  [1, 0, 4], [1, 2, 5], [1, 3, 2],
  [2, 1, 5], [2, 3, 4],
];

async function upsertUser(conn, user, role, hash) {
  await conn.query(
    `INSERT INTO users (name, email, address, password_hash, role) VALUES (?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE id = LAST_INSERT_ID(id)`,
    [user.name, user.email, user.address, hash, role],
  );
  const [[{ id }]] = await conn.query('SELECT LAST_INSERT_ID() AS id');
  return id;
}

module.exports = async function seed(conn) {
  const hash = await bcrypt.hash(PASSWORD, 10);

  const ownerIds = [];
  for (const o of owners) ownerIds.push(await upsertUser(conn, o, 'OWNER', hash));

  const userIds = [];
  for (const u of users) userIds.push(await upsertUser(conn, u, 'USER', hash));

  const storeIds = [];
  for (const s of stores) {
    await conn.query(
      `INSERT INTO stores (name, email, address, owner_id) VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE id = LAST_INSERT_ID(id)`,
      [s.name, s.email, s.address, s.owner === null ? null : ownerIds[s.owner]],
    );
    const [[{ id }]] = await conn.query('SELECT LAST_INSERT_ID() AS id');
    storeIds.push(id);
  }

  for (const [u, s, rating] of ratings) {
    await conn.query(
      `INSERT INTO ratings (user_id, store_id, rating) VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE rating = VALUES(rating)`,
      [userIds[u], storeIds[s], rating],
    );
  }

  console.log(`Demo data seeded (owners/users password: ${PASSWORD})`);
};
