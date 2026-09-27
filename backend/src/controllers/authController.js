const bcrypt = require('bcryptjs');
const pool = require('../config/db');
const ApiError = require('../utils/ApiError');
const ROLES = require('../utils/roles');
const { signToken } = require('../utils/token');

const SALT_ROUNDS = 10;

const publicUser = ({ id, name, email, address, role }) => ({ id, name, email, address, role });

// POST /api/auth/register — self sign-up, always creates a normal user.
exports.register = async (req, res) => {
  const { name, email, address, password } = req.body;
  const hash = await bcrypt.hash(password, SALT_ROUNDS);

  const [result] = await pool.query(
    'INSERT INTO users (name, email, address, password_hash, role) VALUES (?, ?, ?, ?, ?)',
    [name, email, address, hash, ROLES.USER],
  );

  const user = { id: result.insertId, name, email, address, role: ROLES.USER };
  res.status(201).json({ token: signToken(user), user });
};

// POST /api/auth/login — single login for every role.
exports.login = async (req, res) => {
  const { email, password } = req.body;
  const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
  const user = rows[0];

  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    throw new ApiError(401, 'Invalid email or password');
  }

  res.json({ token: signToken(user), user: publicUser(user) });
};

// GET /api/auth/me
exports.me = (req, res) => {
  res.json({ user: req.user });
};

// PUT /api/auth/password
exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const [rows] = await pool.query('SELECT password_hash FROM users WHERE id = ?', [req.user.id]);

  if (!(await bcrypt.compare(currentPassword, rows[0].password_hash))) {
    throw new ApiError(400, 'Current password is incorrect', { currentPassword: 'Current password is incorrect' });
  }
  if (currentPassword === newPassword) {
    throw new ApiError(400, 'New password must differ from the current password', {
      newPassword: 'New password must differ from the current password',
    });
  }

  const hash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await pool.query('UPDATE users SET password_hash = ? WHERE id = ?', [hash, req.user.id]);
  res.json({ message: 'Password updated successfully' });
};

exports.SALT_ROUNDS = SALT_ROUNDS;
