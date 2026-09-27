const jwt = require('jsonwebtoken');
const { jwt: jwtConfig } = require('../config/env');

const signToken = (user) =>
  jwt.sign({ id: user.id, role: user.role }, jwtConfig.secret, { expiresIn: jwtConfig.expiresIn });

const verifyToken = (token) => jwt.verify(token, jwtConfig.secret);

module.exports = { signToken, verifyToken };
