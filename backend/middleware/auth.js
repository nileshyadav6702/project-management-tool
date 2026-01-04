const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({ error: 'Access denied. No token provided.' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        const user = await User.findById(decoded.userId)
            .select('-password')
            .populate('organizationId', 'name');

        if (!user) {
            return res.status(401).json({ error: 'User not found.' });
        }

        // Check if the token matches the current active session
        if (user.currentSessionToken !== token) {
            return res.status(401).json({ error: 'Session expired. You have been logged in from another device.' });
        }

        req.user = user;
        req.userId = decoded.userId;
        req.organizationId = user.organizationId;
        req.role = user.role;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Invalid token.' });
    }
};

module.exports = auth;
