const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        enum: ['planning', 'in-progress', 'on-hold', 'completed', 'cancelled'],
        default: 'planning'
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    },
    startDate: {
        type: Date
    },
    endDate: {
        type: Date
    },
    deadline: {
        type: Date
    },
    teamId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Team'
    },
    teamMembers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    budget: {
        type: Number,
        default: 0
    },
    tags: [{
        type: String
    }],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    organizationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization',
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Project', projectSchema);
