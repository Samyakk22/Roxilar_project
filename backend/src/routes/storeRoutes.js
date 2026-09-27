const router = require('express').Router();
const controller = require('../controllers/storeController');
const { authenticate, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const rules = require('../validators/rules');
const asyncHandler = require('../utils/asyncHandler');
const ROLES = require('../utils/roles');

router.use(authenticate, authorize(ROLES.USER));

router.get('/', asyncHandler(controller.listStores));
router.put('/:storeId/rating', rules.rating, validate, asyncHandler(controller.rateStore));

module.exports = router;
