const router = require('express').Router();
const controller = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');
const rules = require('../validators/rules');
const asyncHandler = require('../utils/asyncHandler');

router.post('/register', rules.register, validate, asyncHandler(controller.register));
router.post('/login', rules.login, validate, asyncHandler(controller.login));
router.get('/me', authenticate, controller.me);
router.put('/password', authenticate, rules.changePassword, validate, asyncHandler(controller.changePassword));

module.exports = router;
