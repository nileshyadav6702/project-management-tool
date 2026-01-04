const Task = require('../models/Task');
const User = require('../models/User');
const Activity = require('../models/Activity');

// Get all tasks
exports.getTasks = async (req, res) => {
    try {
        const { projectId, status, priority, assignedTo, search } = req.query;
        let query = { organizationId: req.organizationId };

        // If member and no specific projectId is requested, only show their tasks
        if (req.role === 'member' && !projectId) {
            query.assignedTo = req.userId;
        }

        if (projectId) query.projectId = projectId;
        if (status) query.status = status;
        if (priority) query.priority = priority;
        if (assignedTo) query.assignedTo = assignedTo;
        if (search) query.title = { $regex: search, $options: 'i' };

        const tasks = await Task.find(query)
            .populate('projectId', 'name')
            .populate('assignedTo', 'name email avatar')
            .populate('createdBy', 'name')
            .sort({ createdAt: -1 });

        res.json(tasks);
    } catch (error) {
        console.error('Get tasks error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Get single task
exports.getTask = async (req, res) => {
    try {
        const task = await Task.findOne({ 
            _id: req.params.id, 
            organizationId: req.organizationId 
        })
            .populate('projectId', 'name teamId')
            .populate('assignedTo', 'name email avatar')
            .populate('createdBy', 'name email');

        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }

        res.json(task);
    } catch (error) {
        console.error('Get task error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Create task
exports.createTask = async (req, res) => {
    try {
        if (req.role === 'member') {
            return res.status(403).json({ error: 'Access denied. Members cannot create tasks.' });
        }
        // Get assigned user's name if assignedTo is provided
        let assignedToName = '';
        if (req.body.assignedTo) {
            const assignedUser = await User.findById(req.body.assignedTo);
            if (assignedUser) {
                assignedToName = assignedUser.name;
            }
        }

        const task = new Task({
            ...req.body,
            assignedToName,
            createdBy: req.userId,
            organizationId: req.organizationId
        });
        await task.save();

        // Log activity
        await Activity.create({
            type: req.body.assignedTo ? 'task_assigned' : 'task_updated',
            userId: req.userId,
            userName: req.user.name,
            userAvatar: req.user.avatar,
            description: `Created task "${task.title}"${assignedToName ? ` and assigned to ${assignedToName}` : ''}`,
            projectId: task.projectId,
            taskId: task._id,
            organizationId: req.organizationId
        });

        res.status(201).json(task);
    } catch (error) {
        console.error('Create task error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Update task
exports.updateTask = async (req, res) => {
    try {
        const oldTask = await Task.findById(req.params.id);
        if (!oldTask) {
            return res.status(404).json({ error: 'Task not found' });
        }

        // RBAC: Members can only update status of tasks assigned to them
        if (req.role === 'member') {
            if (oldTask.assignedTo?.toString() !== req.userId) {
                return res.status(403).json({ error: 'Access denied. You can only update tasks assigned to you.' });
            }
            
            // Only allow status updates
            const allowedUpdates = ['status'];
            const updates = Object.keys(req.body);
            const isValidOperation = updates.every((update) => allowedUpdates.includes(update));
            
            if (!isValidOperation) {
                return res.status(403).json({ error: 'Access denied. Members can only update task status.' });
            }
        }

        // Get assigned user's name if assignedTo is provided
        if (req.body.assignedTo && req.body.assignedTo !== oldTask.assignedTo?.toString()) {
            const assignedUser = await User.findById(req.body.assignedTo);
            if (assignedUser) {
                req.body.assignedToName = assignedUser.name;
            }
        }

        const task = await Task.findOneAndUpdate(
            { _id: req.params.id, organizationId: req.organizationId },
            req.body,
            { new: true }
        ).populate('projectId assignedTo createdBy');

        // Determine activity type
        let activityType = 'task_updated';
        let description = `Updated task "${task.title}"`;

        if (req.body.status === 'done' && oldTask.status !== 'done') {
            activityType = 'task_completed';
            description = `Completed task "${task.title}"`;
        } else if (req.body.assignedTo && req.body.assignedTo !== oldTask.assignedTo?.toString()) {
            activityType = 'task_assigned';
            description = `Assigned task "${task.title}" to ${task.assignedToName}`;
        }

        // Log activity
        await Activity.create({
            type: activityType,
            userId: req.userId,
            userName: req.user.name,
            userAvatar: req.user.avatar,
            description,
            projectId: task.projectId,
            taskId: task._id,
            organizationId: req.organizationId
        });

        res.json(task);
    } catch (error) {
        console.error('Update task error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Delete task
exports.deleteTask = async (req, res) => {
    try {
        if (req.role === 'member') {
            return res.status(403).json({ error: 'Access denied. Members cannot delete tasks.' });
        }
        const task = await Task.findOneAndDelete({ 
            _id: req.params.id, 
            organizationId: req.organizationId 
        });

        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }

        res.json({ message: 'Task deleted successfully' });
    } catch (error) {
        console.error('Delete task error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};
