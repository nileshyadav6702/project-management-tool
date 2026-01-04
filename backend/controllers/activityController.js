const Activity = require('../models/Activity');

// Get all activities
exports.getActivities = async (req, res) => {
    try {
        const { teamId, projectId, userId, type, limit = 50 } = req.query;
        let query = {};

        if (teamId) query.teamId = teamId;
        if (projectId) query.projectId = projectId;
        if (userId) query.userId = userId;
        if (type) query.type = type;

        const activities = await Activity.find(query)
            .populate('userId', 'name avatar')
            .populate('projectId', 'name')
            .populate('taskId', 'title')
            .populate('teamId', 'name')
            .sort({ createdAt: -1 })
            .limit(parseInt(limit));

        res.json(activities);
    } catch (error) {
        console.error('Get activities error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Get recent activities
exports.getRecentActivities = async (req, res) => {
    try {
        const { teamId, limit = 10 } = req.query;
        let query = {};

        if (teamId) query.teamId = teamId;

        const activities = await Activity.find(query)
            .populate('userId', 'name avatar')
            .populate('projectId', 'name')
            .populate('taskId', 'title')
            .sort({ createdAt: -1 })
            .limit(parseInt(limit));

        res.json(activities);
    } catch (error) {
        console.error('Get recent activities error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Get single activity
exports.getActivity = async (req, res) => {
    try {
        const activity = await Activity.findById(req.params.id)
            .populate('userId', 'name email avatar')
            .populate('projectId', 'name')
            .populate('taskId', 'title')
            .populate('teamId', 'name');

        if (!activity) {
            return res.status(404).json({ error: 'Activity not found' });
        }

        res.json(activity);
    } catch (error) {
        console.error('Get activity error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};
