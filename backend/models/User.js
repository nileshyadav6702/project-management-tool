const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: function() { return !this.googleId; },
        minlength: 6
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true
    },
    avatar: {
        type: String,
        default: ''
    },
    role: {
        type: String,
        enum: ['admin', 'manager', 'member'],
        default: 'member'
    },
    teamId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Team'
    },
    organizationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    currentSessionToken: {
        type: String,
        default: null
    }
}, {
    timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
