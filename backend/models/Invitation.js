const mongoose = require('mongoose');
const crypto = require('crypto');

const invitationSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    role: {
        type: String,
        enum: ['admin', 'manager', 'member', 'viewer'],
        default: 'member'
    },
    token: {
        type: String,
        required: true,
        unique: true
    },
    invitedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    organizationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization',
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'expired'],
        default: 'pending'
    },
    expiresAt: {
        type: Date,
        required: true
    }
}, {
    timestamps: true
});

// Generate unique token before validation
invitationSchema.pre('validate', function(next) {
    if (!this.token) {
        this.token = crypto.randomBytes(32).toString('hex');
    }
    if (!this.expiresAt) {
        // Token expires in 7 days
        this.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    }
    next();
});

module.exports = mongoose.model('Invitation', invitationSchema);
