const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['task_assigned', 'task_updated', 'task_completed', 'payment_updated', 'project_created', 'project_updated', 'team_updated', 'comment_added'],
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    userName: {
        type: String,
        required: true
    },
    userAvatar: {
        type: String
    },
    description: {
        type: String,
        required: true
    },
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project'
    },
    taskId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task'
    },
    teamId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Team'
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed
    },
    organizationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization',
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Activity', activitySchema);
