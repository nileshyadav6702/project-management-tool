const Team = require('../models/Team');
const Project = require('../models/Project');
const Budget = require('../models/Budget');
const Activity = require('../models/Activity');

// Get all teams
exports.getTeams = async (req, res) => {
    try {
        const { status, search } = req.query;
        let query = { organizationId: req.organizationId };

        // If member, only show teams they are part of
        if (req.role === 'member') {
            query.members = req.userId;
        }

        if (status) query.status = status;
        if (search) query.name = { $regex: search, $options: 'i' };

        const teams = await Team.find(query)
            .populate('members', 'name email avatar')
            .populate('managerId', 'name email avatar')
            .sort({ createdAt: -1 });

        res.json(teams);
    } catch (error) {
        console.error('Get teams error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Get single team
exports.getTeam = async (req, res) => {
    try {
        const team = await Team.findOne({ 
            _id: req.params.id, 
            organizationId: req.organizationId 
        })
            .populate('members', 'name email avatar role')
            .populate('managerId', 'name email avatar');

        if (!team) {
            return res.status(404).json({ error: 'Team not found' });
        }

        // If member, check if they are part of the team
        if (req.role === 'member' && !team.members.some(m => m._id.toString() === req.userId)) {
            return res.status(403).json({ error: 'Access denied' });
        }

        // Get team's projects
        const projects = await Project.find({ teamId: team._id });

        // Get team's budget
        const budgets = await Budget.find({ teamId: team._id });
        const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0);

        res.json({
            ...team.toObject(),
            projects,
            totalBudget,
            projectCount: projects.length
        });
    } catch (error) {
        console.error('Get team error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Create team
exports.createTeam = async (req, res) => {
    try {
        const team = new Team({
            ...req.body,
            createdBy: req.userId,
            organizationId: req.organizationId
        });
        await team.save();

        // Log activity
        await Activity.create({
            type: 'team_updated',
            userId: req.userId,
            userName: req.user.name,
            userAvatar: req.user.avatar,
            description: `Created team "${team.name}"`,
            teamId: team._id,
            organizationId: req.organizationId
        });

        res.status(201).json(team);
    } catch (error) {
        console.error('Create team error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Update team
exports.updateTeam = async (req, res) => {
    try {
        const team = await Team.findOneAndUpdate(
            { _id: req.params.id, organizationId: req.organizationId },
            req.body,
            { new: true }
        ).populate('members managerId');

        if (!team) {
            return res.status(404).json({ error: 'Team not found' });
        }

        // Log activity
        await Activity.create({
            type: 'team_updated',
            userId: req.userId,
            userName: req.user.name,
            userAvatar: req.user.avatar,
            description: `Updated team "${team.name}"`,
            teamId: team._id,
            organizationId: req.organizationId
        });

        res.json(team);
    } catch (error) {
        console.error('Update team error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Delete team
exports.deleteTeam = async (req, res) => {
    try {
        const team = await Team.findOneAndDelete({ 
            _id: req.params.id, 
            organizationId: req.organizationId 
        });

        if (!team) {
            return res.status(404).json({ error: 'Team not found' });
        }

        res.json({ message: 'Team deleted successfully' });
    } catch (error) {
        console.error('Delete team error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};
