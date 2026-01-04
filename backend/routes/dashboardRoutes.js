const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const auth = require('../middleware/auth');

router.use(auth);

router.get('/stats', dashboardController.getDashboardStats);
router.get('/activities', dashboardController.getRecentActivities);
router.get('/deadlines', dashboardController.getUpcomingDeadlines);

module.exports = router;
