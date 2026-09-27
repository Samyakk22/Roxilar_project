const router = require('express').Router();
const controller = require('../controllers/ownerController');
const { authenticate, authorize } = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');
const ROLES = require('../utils/roles');

router.use(authenticate, authorize(ROLES.OWNER));

router.get('/dashboard', asyncHandler(controller.dashboard));

module.exports = router;
