const Budget = require('../models/Budget');
const Activity = require('../models/Activity');

// Get all budgets
exports.getBudgets = async (req, res) => {
    try {
        const { teamId, projectId, status, category } = req.query;
        let query = {};

        if (teamId) query.teamId = teamId;
        if (projectId) query.projectId = projectId;
        if (status) query.status = status;
        if (category) query.category = category;

        const budgets = await Budget.find(query)
            .populate('teamId', 'name')
            .populate('projectId', 'name')
            .populate('createdBy', 'name')
            .sort({ createdAt: -1 });

        res.json(budgets);
    } catch (error) {
        console.error('Get budgets error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Get single budget
exports.getBudget = async (req, res) => {
    try {
        const budget = await Budget.findById(req.params.id)
            .populate('teamId', 'name')
            .populate('projectId', 'name')
            .populate('createdBy', 'name email');

        if (!budget) {
            return res.status(404).json({ error: 'Budget not found' });
        }

        res.json(budget);
    } catch (error) {
        console.error('Get budget error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Create budget
exports.createBudget = async (req, res) => {
    try {
        const budget = new Budget({
            ...req.body,
            createdBy: req.userId
        });
        await budget.save();

        // Log activity
        await Activity.create({
            type: 'payment_updated',
            userId: req.userId,
            userName: req.user.name,
            userAvatar: req.user.avatar,
            description: `Created budget entry: $${budget.amount}`,
            teamId: budget.teamId,
            projectId: budget.projectId
        });

        res.status(201).json(budget);
    } catch (error) {
        console.error('Create budget error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Update budget
exports.updateBudget = async (req, res) => {
    try {
        const budget = await Budget.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        ).populate('teamId projectId createdBy');

        if (!budget) {
            return res.status(404).json({ error: 'Budget not found' });
        }

        // Log activity
        await Activity.create({
            type: 'payment_updated',
            userId: req.userId,
            userName: req.user.name,
            userAvatar: req.user.avatar,
            description: `Updated budget entry: $${budget.amount}`,
            teamId: budget.teamId,
            projectId: budget.projectId
        });

        res.json(budget);
    } catch (error) {
        console.error('Update budget error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Delete budget
exports.deleteBudget = async (req, res) => {
    try {
        const budget = await Budget.findByIdAndDelete(req.params.id);

        if (!budget) {
            return res.status(404).json({ error: 'Budget not found' });
        }

        res.json({ message: 'Budget deleted successfully' });
    } catch (error) {
        console.error('Delete budget error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Get team budget summary
exports.getTeamBudgetSummary = async (req, res) => {
    try {
        const { teamId } = req.params;

        const budgets = await Budget.find({ teamId });

        const summary = {
            total: budgets.reduce((sum, b) => sum + b.amount, 0),
            allocated: budgets.filter(b => b.status === 'allocated').reduce((sum, b) => sum + b.amount, 0),
            spent: budgets.filter(b => b.status === 'spent').reduce((sum, b) => sum + b.amount, 0),
            pending: budgets.filter(b => b.status === 'pending').reduce((sum, b) => sum + b.amount, 0),
            byCategory: {
                project: budgets.filter(b => b.category === 'project').reduce((sum, b) => sum + b.amount, 0),
                team: budgets.filter(b => b.category === 'team').reduce((sum, b) => sum + b.amount, 0),
                general: budgets.filter(b => b.category === 'general').reduce((sum, b) => sum + b.amount, 0),
                payment: budgets.filter(b => b.category === 'payment').reduce((sum, b) => sum + b.amount, 0)
            }
        };

        res.json(summary);
    } catch (error) {
        console.error('Get team budget summary error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};
