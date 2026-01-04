const express = require('express');
const router = express.Router();
const budgetController = require('../controllers/budgetController');
const auth = require('../middleware/auth');

router.use(auth);

router.get('/', budgetController.getBudgets);
router.get('/:id', budgetController.getBudget);
router.post('/', budgetController.createBudget);
router.put('/:id', budgetController.updateBudget);
router.delete('/:id', budgetController.deleteBudget);
router.get('/team/:teamId/summary', budgetController.getTeamBudgetSummary);

module.exports = router;
