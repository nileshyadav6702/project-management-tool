const Payment = require('../models/Payment');
const Task = require('../models/Task');

// Get all payments
exports.getPayments = async (req, res) => {
    try {
        const { taskId, projectId, paidTo } = req.query;
        let query = { organizationId: req.organizationId };

        // If member, only show their payments
        if (req.role === 'member') {
            query.paidTo = req.userId;
        }

        if (taskId) query.taskId = taskId;
        if (projectId) query.projectId = projectId;
        if (paidTo) query.paidTo = paidTo;

        const payments = await Payment.find(query)
            .populate('taskId', 'title')
            .populate('projectId', 'name')
            .populate('paidTo', 'name email avatar')
            .populate('paidBy', 'name email')
            .sort({ paymentDate: -1 });

        res.json(payments);
    } catch (error) {
        console.error('Get payments error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Get single payment
exports.getPayment = async (req, res) => {
    try {
        const payment = await Payment.findOne({ 
            _id: req.params.id, 
            organizationId: req.organizationId 
        })
            .populate('taskId', 'title description')
            .populate('projectId', 'name')
            .populate('paidTo', 'name email avatar')
            .populate('paidBy', 'name email');

        if (!payment) {
            return res.status(404).json({ error: 'Payment not found' });
        }

        // If member, check if they are the recipient
        if (req.role === 'member' && payment.paidTo._id.toString() !== req.userId) {
            return res.status(403).json({ error: 'Access denied' });
        }

        res.json(payment);
    } catch (error) {
        console.error('Get payment error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Create payment
exports.createPayment = async (req, res) => {
    try {
        if (req.role === 'member') {
            return res.status(403).json({ error: 'Access denied. Members cannot create payments.' });
        }
        const { taskId, amount, paidTo, paymentMode, paymentDate, notes } = req.body;

        // Get task to find projectId
        const task = await Task.findById(taskId);
        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }

        const payment = new Payment({
            amount,
            taskId,
            projectId: task.projectId,
            paidTo,
            paidBy: req.userId,
            paymentMode: paymentMode || 'bank_transfer',
            paymentDate: paymentDate || new Date(),
            notes: notes || '',
            status: 'completed',
            organizationId: req.organizationId
        });

        await payment.save();

        // Populate the response
        const populatedPayment = await Payment.findById(payment._id)
            .populate('taskId', 'title')
            .populate('projectId', 'name')
            .populate('paidTo', 'name email avatar')
            .populate('paidBy', 'name email');

        res.status(201).json(populatedPayment);
    } catch (error) {
        console.error('Create payment error:', error);
        res.status(500).json({ error: error.message || 'Server error' });
    }
};

// Update payment
exports.updatePayment = async (req, res) => {
    try {
        if (req.role === 'member') {
            return res.status(403).json({ error: 'Access denied. Members cannot update payments.' });
        }
        const payment = await Payment.findOneAndUpdate(
            { _id: req.params.id, organizationId: req.organizationId },
            req.body,
            { new: true }
        )
            .populate('taskId', 'title')
            .populate('projectId', 'name')
            .populate('paidTo', 'name email avatar')
            .populate('paidBy', 'name email');

        if (!payment) {
            return res.status(404).json({ error: 'Payment not found' });
        }

        res.json(payment);
    } catch (error) {
        console.error('Update payment error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Delete payment
exports.deletePayment = async (req, res) => {
    try {
        if (req.role === 'member') {
            return res.status(403).json({ error: 'Access denied. Members cannot delete payments.' });
        }
        const payment = await Payment.findOneAndDelete({ 
            _id: req.params.id, 
            organizationId: req.organizationId 
        });

        if (!payment) {
            return res.status(404).json({ error: 'Payment not found' });
        }

        res.json({ message: 'Payment deleted successfully' });
    } catch (error) {
        console.error('Delete payment error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};
