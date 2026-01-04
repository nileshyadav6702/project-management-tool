const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    amount: {
        type: Number,
        required: true
    },
    taskId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task',
        required: true
    },
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true
    },
    paidTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    paidBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    paymentMode: {
        type: String,
        enum: ['cash', 'bank_transfer', 'upi', 'paypal', 'credit_card', 'cheque', 'other'],
        default: 'bank_transfer'
    },
    paymentDate: {
        type: Date,
        default: Date.now
    },
    notes: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'completed'
    },
    organizationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization',
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Payment', paymentSchema);
