const { body, param } = require('express-validator');
const ROLES = require('../utils/roles');

// Shared validation rules (mirrored on the frontend in src/utils/validation.js).
const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,16}$/;

const name = (field = 'name') =>
  body(field)
    .isString().withMessage('Name is required')
    .trim()
    .isLength({ min: 20, max: 60 }).withMessage('Name must be between 20 and 60 characters');

const email = (field = 'email') =>
  body(field)
    .isString().withMessage('Email is required')
    .trim()
    .isEmail().withMessage('Enter a valid email address')
    .isLength({ max: 255 }).withMessage('Email is too long')
    .normalizeEmail({ gmail_remove_dots: false, gmail_remove_subaddress: false });

const address = (field = 'address') =>
  body(field)
    .isString().withMessage('Address is required')
    .trim()
    .notEmpty().withMessage('Address is required')
    .isLength({ max: 400 }).withMessage('Address must be at most 400 characters');

const password = (field = 'password') =>
  body(field)
    .isString().withMessage('Password is required')
    .matches(PASSWORD_REGEX)
    .withMessage('Password must be 8-16 characters and include an uppercase letter and a special character');

const role = () =>
  body('role')
    .isIn(Object.values(ROLES)).withMessage(`Role must be one of ${Object.values(ROLES).join(', ')}`);

const idParam = (field = 'id') => param(field).isInt({ min: 1 }).withMessage('Invalid id').toInt();

module.exports = {
  register: [name(), email(), address(), password()],
  login: [
    body('email').isString().trim().notEmpty().withMessage('Email is required')
      .normalizeEmail({ gmail_remove_dots: false, gmail_remove_subaddress: false }),
    body('password').isString().notEmpty().withMessage('Password is required'),
  ],
  changePassword: [
    body('currentPassword').isString().notEmpty().withMessage('Current password is required'),
    password('newPassword'),
  ],
  createUser: [name(), email(), address(), password(), role()],
  createStore: [
    name(),
    email(),
    address(),
    body('ownerId')
      .optional({ values: 'falsy' })
      .isInt({ min: 1 }).withMessage('Invalid owner')
      .toInt(),
  ],
  rating: [
    idParam('storeId'),
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be an integer between 1 and 5').toInt(),
  ],
  idParam: [idParam()],
};
