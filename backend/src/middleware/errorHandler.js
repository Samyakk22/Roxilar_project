const ApiError = require('../utils/ApiError');

const notFound = (req, res, next) => next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  if (err.code === 'ER_DUP_ENTRY') {
    const field = /email/i.test(err.message) ? 'email' : 'owner';
    const message = field === 'email' ? 'Email is already in use' : 'This owner already has a store';
    return res.status(409).json({ message, errors: { [field === 'owner' ? 'ownerId' : 'email']: message } });
  }

  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'Malformed JSON body' });
  }

  const status = err instanceof ApiError ? err.status : 500;
  if (status === 500) console.error(err);

  res.status(status).json({
    message: status === 500 ? 'Internal server error' : err.message,
    ...(err.details && { errors: err.details }),
  });
};

module.exports = { notFound, errorHandler };
