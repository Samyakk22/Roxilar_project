const router = require('express').Router();
const controller = require('../controllers/adminController');
const { authenticate, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const rules = require('../validators/rules');
const asyncHandler = require('../utils/asyncHandler');
const ROLES = require('../utils/roles');

router.use(authenticate, authorize(ROLES.ADMIN));

router.get('/dashboard', asyncHandler(controller.dashboard));
router.get('/users', asyncHandler(controller.listUsers));
router.post('/users', rules.createUser, validate, asyncHandler(controller.createUser));
router.get('/users/:id', rules.idParam, validate, asyncHandler(controller.getUser));
router.get('/stores', asyncHandler(controller.listStores));
router.post('/stores', rules.createStore, validate, asyncHandler(controller.createStore));
router.get('/owners/available', asyncHandler(controller.availableOwners));

module.exports = router;
