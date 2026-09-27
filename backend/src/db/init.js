// Creates the database (if needed), applies schema.sql and ensures an admin account exists.
// Usage: npm run db:init            (add --seed to load demo data)
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
const { db, admin } = require('../config/env');

async function main() {
  const conn = await mysql.createConnection({
    host: db.host,
    port: db.port,
    user: db.user,
    password: db.password,
    multipleStatements: true,
  });

  await conn.query(
    `CREATE DATABASE IF NOT EXISTS \`${db.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
  );
  await conn.query(`USE \`${db.database}\``);
  await conn.query(fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8'));
  console.log(`Schema applied to database "${db.database}"`);

  const [existing] = await conn.query('SELECT id FROM users WHERE email = ?', [admin.email]);
  if (!existing.length) {
    const hash = await bcrypt.hash(admin.password, 10);
    await conn.query(
      "INSERT INTO users (name, email, address, password_hash, role) VALUES (?, ?, ?, ?, 'ADMIN')",
      [admin.name, admin.email, admin.address, hash],
    );
    console.log(`Admin created: ${admin.email} / ${admin.password}`);
  } else {
    console.log(`Admin already exists: ${admin.email}`);
  }

  if (process.argv.includes('--seed')) await require('./seed')(conn);

  await conn.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
