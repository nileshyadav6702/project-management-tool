const Project = require('../models/Project');
const Activity = require('../models/Activity');

// Get all projects
exports.getProjects = async (req, res) => {
    try {
        const { status, priority, search, teamId, memberId } = req.query;
        let query = { organizationId: req.organizationId };

        // If user is a member, only show projects they are part of
        if (req.role === 'member') {
            query.teamMembers = req.userId;
        } else if (memberId) {
            // If admin/manager and memberId is provided, filter projects by that member
            query.teamMembers = memberId;
        }

        if (status) query.status = status;
        if (priority) query.priority = priority;
        if (teamId) query.teamId = teamId;
        if (search) query.name = { $regex: search, $options: 'i' };

        const projects = await Project.find(query)
            .populate('teamId', 'name')
            .populate('teamMembers', 'name email avatar')
            .populate('createdBy', 'name')
            .sort({ createdAt: -1 });

        res.json(projects);
    } catch (error) {
        console.error('Get projects error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Get single project
exports.getProject = async (req, res) => {
    try {
        const project = await Project.findOne({ 
            _id: req.params.id, 
            organizationId: req.organizationId 
        })
            .populate('teamId', 'name members')
            .populate('teamMembers', 'name email avatar role')
            .populate('createdBy', 'name email');

        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        // If member, check if they are part of the project
        if (req.role === 'member' && !project.teamMembers.some(m => m._id.toString() === req.userId)) {
            return res.status(403).json({ error: 'Access denied' });
        }

        res.json(project);
    } catch (error) {
        console.error('Get project error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Create project
exports.createProject = async (req, res) => {
    try {
        if (req.role === 'member') {
            return res.status(403).json({ error: 'Access denied. Members cannot create projects.' });
        }
        const project = new Project({
            ...req.body,
            createdBy: req.userId,
            organizationId: req.organizationId
        });
        await project.save();

        // Log activity - use fallback values if user info is missing
        await Activity.create({
            type: 'project_created',
            userId: req.userId,
            userName: req.user?.name || req.user?.email || 'Unknown User',
            userAvatar: req.user?.avatar || '',
            description: `Created project "${project.name}"`,
            projectId: project._id,
            teamId: project.teamId,
            organizationId: req.organizationId
        });

        res.status(201).json(project);
    } catch (error) {
        console.error('Create project error:', error);
        res.status(500).json({ error: error.message || 'Server error' });
    }
};

// Update project
exports.updateProject = async (req, res) => {
    try {
        if (req.role === 'member') {
            return res.status(403).json({ error: 'Access denied. Members cannot update projects.' });
        }
        const project = await Project.findOneAndUpdate(
            { _id: req.params.id, organizationId: req.organizationId },
            req.body,
            { new: true }
        ).populate('teamId teamMembers createdBy');

        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        // Log activity - use fallback values if user info is missing
        await Activity.create({
            type: 'project_updated',
            userId: req.userId,
            userName: req.user?.name || req.user?.email || 'Unknown User',
            userAvatar: req.user?.avatar || '',
            description: `Updated project "${project.name}"`,
            projectId: project._id,
            teamId: project.teamId,
            organizationId: req.organizationId
        });

        res.json(project);
    } catch (error) {
        console.error('Update project error:', error);
        res.status(500).json({ error: error.message || 'Server error' });
    }
};

// Delete project
exports.deleteProject = async (req, res) => {
    try {
        if (req.role === 'member') {
            return res.status(403).json({ error: 'Access denied. Members cannot delete projects.' });
        }
        const project = await Project.findOneAndDelete({ 
            _id: req.params.id, 
            organizationId: req.organizationId 
        });

        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        res.json({ message: 'Project deleted successfully' });
    } catch (error) {
        console.error('Delete project error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};
