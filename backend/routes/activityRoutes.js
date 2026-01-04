const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activityController');
const auth = require('../middleware/auth');

router.use(auth);

router.get('/', activityController.getActivities);
router.get('/recent', activityController.getRecentActivities);
router.get('/:id', activityController.getActivity);

module.exports = router;
