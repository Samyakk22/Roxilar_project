const { validationResult } = require('express-validator');
const ApiError = require('../utils/ApiError');

// Runs after express-validator chains; responds 400 with field-level errors.
module.exports = (req, res, next) => {
  const result = validationResult(req);
  if (result.isEmpty()) return next();

  const errors = {};
  for (const err of result.array()) {
    if (!errors[err.path]) errors[err.path] = err.msg;
  }
  next(new ApiError(400, 'Validation failed', errors));
};
