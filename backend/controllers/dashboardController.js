const Project = require('../models/Project');
const Task = require('../models/Task');
const Team = require('../models/Team');
const Activity = require('../models/Activity');
const Budget = require('../models/Budget');

// Get dashboard stats
exports.getDashboardStats = async (req, res) => {
    try {
        const [projects, tasks, teams, budgets] = await Promise.all([
            Project.find({ organizationId: req.organizationId }),
            Task.find({ organizationId: req.organizationId }),
            Team.find({ organizationId: req.organizationId }),
            Budget.find({ organizationId: req.organizationId })
        ]);

        const stats = {
            totalProjects: projects.length,
            activeProjects: projects.filter(p => p.status === 'in-progress').length,
            completedProjects: projects.filter(p => p.status === 'completed').length,
            totalTasks: tasks.length,
            completedTasks: tasks.filter(t => t.status === 'done').length,
            inProgressTasks: tasks.filter(t => t.status === 'in-progress').length,
            todoTasks: tasks.filter(t => t.status === 'todo').length,
            reviewTasks: tasks.filter(t => t.status === 'review').length,
            totalTeams: teams.length,
            activeTeams: teams.filter(t => t.status === 'active').length,
            totalBudget: budgets.reduce((sum, b) => sum + b.amount, 0),
            spentBudget: budgets.filter(b => b.status === 'spent').reduce((sum, b) => sum + b.amount, 0)
        };

        // Calculate project distribution by status
        stats.projectsByStatus = {
            planning: projects.filter(p => p.status === 'planning').length,
            'in-progress': projects.filter(p => p.status === 'in-progress').length,
            'on-hold': projects.filter(p => p.status === 'on-hold').length,
            completed: projects.filter(p => p.status === 'completed').length,
            cancelled: projects.filter(p => p.status === 'cancelled').length
        };

        // Calculate task distribution by priority
        stats.tasksByPriority = {
            low: tasks.filter(t => t.priority === 'low').length,
            medium: tasks.filter(t => t.priority === 'medium').length,
            high: tasks.filter(t => t.priority === 'high').length,
            urgent: tasks.filter(t => t.priority === 'urgent').length
        };

        res.json(stats);
    } catch (error) {
        console.error('Get dashboard stats error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Get recent activities for dashboard
exports.getRecentActivities = async (req, res) => {
    try {
        const activities = await Activity.find({ organizationId: req.organizationId })
            .populate('userId', 'name avatar')
            .populate('projectId', 'name')
            .sort({ createdAt: -1 })
            .limit(10);

        res.json(activities);
    } catch (error) {
        console.error('Get recent activities error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Get upcoming deadlines
exports.getUpcomingDeadlines = async (req, res) => {
    try {
        const now = new Date();
        const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

        const projects = await Project.find({
            organizationId: req.organizationId,
            deadline: { $gte: now, $lte: thirtyDaysFromNow },
            status: { $ne: 'completed' }
        })
            .populate('teamId', 'name')
            .sort({ deadline: 1 })
            .limit(5);

        const tasks = await Task.find({
            organizationId: req.organizationId,
            dueDate: { $gte: now, $lte: thirtyDaysFromNow },
            status: { $ne: 'done' }
        })
            .populate('projectId', 'name')
            .populate('assignedTo', 'name avatar')
            .sort({ dueDate: 1 })
            .limit(5);

        res.json({ projects, tasks });
    } catch (error) {
        console.error('Get upcoming deadlines error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};
