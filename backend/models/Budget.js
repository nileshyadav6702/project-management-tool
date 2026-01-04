const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
    teamId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Team',
        required: true
    },
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project'
    },
    amount: {
        type: Number,
        required: true
    },
    category: {
        type: String,
        enum: ['project', 'team', 'general', 'payment'],
        default: 'general'
    },
    description: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        enum: ['allocated', 'spent', 'pending', 'approved'],
        default: 'pending'
    },
    paymentDate: {
        type: Date
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Budget', budgetSchema);
