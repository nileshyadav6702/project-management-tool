const mongoose = require('mongoose');

const organizationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    description: {
        type: String,
        default: ''
    },
    logo: {
        type: String,
        default: ''
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    settings: {
        currency: { type: String, default: 'USD' },
        timezone: { type: String, default: 'UTC' }
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Organization', organizationSchema);
