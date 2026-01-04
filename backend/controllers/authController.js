const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const Organization = require('../models/Organization');

// Register new user
exports.register = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, email, password, organizationName } = req.body;

        // Check if user exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ error: 'User already exists' });
        }

        // Create user first (without organizationId)
        user = new User({ 
            name, 
            email, 
            password, 
            role: 'admin' // New registrations are always admins
        });
        await user.save();

        // Create organization
        const slug = organizationName.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
        const organization = new Organization({
            name: organizationName,
            slug: slug,
            owner: user._id
        });
        await organization.save();

        // Generate token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '7d' }
        );

        // Update user with organizationId and session token
        user.organizationId = organization._id;
        user.currentSessionToken = token;
        await user.save();

        res.status(201).json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar,
                organizationId: {
                    _id: organization._id,
                    name: organization.name
                }
            }
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Login user
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        // Verify password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        // Generate token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '7d' }
        );

        // Populate organization and update session token
        user.currentSessionToken = token;
        await user.save();
        await user.populate('organizationId', 'name');

        res.json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar,
                organizationId: user.organizationId
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Get current user
exports.getMe = async (req, res) => {
    try {
        res.json(req.user);
    } catch (error) {
        console.error('GetMe error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Logout user
exports.logout = async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (user) {
            user.currentSessionToken = null;
            await user.save();
        }
        res.json({ message: 'Logged out successfully' });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

