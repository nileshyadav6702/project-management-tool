const Invitation = require('../models/Invitation');
const User = require('../models/User');
const { sendInvitationEmail } = require('../services/emailService');
const bcrypt = require('bcryptjs');

// Get all invitations
exports.getInvitations = async (req, res) => {
    try {
        const invitations = await Invitation.find()
            .populate('invitedBy', 'name email')
            .sort({ createdAt: -1 });
        res.json(invitations);
    } catch (error) {
        console.error('Get invitations error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Create and send invitation
exports.createInvitation = async (req, res) => {
    try {
        const { email, name, role } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({ error: 'A user with this email already exists' });
        }

        // Check if invitation already exists and is pending
        const existingInvitation = await Invitation.findOne({ 
            email: email.toLowerCase(), 
            status: 'pending',
            expiresAt: { $gt: new Date() }
        });
        if (existingInvitation) {
            return res.status(400).json({ error: 'An invitation has already been sent to this email' });
        }

        // Create invitation
        const invitation = new Invitation({
            email: email.toLowerCase(),
            name,
            role: role || 'member',
            invitedBy: req.userId,
            organizationId: req.organizationId // Use inviter's organization
        });
        await invitation.save();

        // Get inviter name
        const inviter = await User.findById(req.userId);
        const inviterName = inviter?.name || 'A team member';

        // Send invitation email
        const emailResult = await sendInvitationEmail(
            invitation.email,
            invitation.name,
            inviterName,
            invitation.token,
            invitation.role
        );

        if (!emailResult.success) {
            // If email fails, delete the invitation
            await Invitation.findByIdAndDelete(invitation._id);
            return res.status(500).json({ 
                error: 'Failed to send invitation email. Please check email configuration.',
                details: emailResult.error
            });
        }

        res.status(201).json({
            message: 'Invitation sent successfully',
            invitation: {
                _id: invitation._id,
                email: invitation.email,
                name: invitation.name,
                role: invitation.role,
                status: invitation.status,
                createdAt: invitation.createdAt
            }
        });
    } catch (error) {
        console.error('Create invitation error:', error);
        res.status(500).json({ error: error.message || 'Server error' });
    }
};

// Get invitation by token (public route)
exports.getInvitationByToken = async (req, res) => {
    try {
        const { token } = req.params;

        const invitation = await Invitation.findOne({ 
            token,
            status: 'pending'
        });

        if (!invitation) {
            return res.status(404).json({ error: 'Invitation not found or already used' });
        }

        if (invitation.expiresAt < new Date()) {
            invitation.status = 'expired';
            await invitation.save();
            return res.status(400).json({ error: 'Invitation has expired' });
        }

        res.json({
            email: invitation.email,
            name: invitation.name,
            role: invitation.role
        });
    } catch (error) {
        console.error('Get invitation by token error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Accept invitation and create user
exports.acceptInvitation = async (req, res) => {
    try {
        const { token, password } = req.body;

        const invitation = await Invitation.findOne({ 
            token,
            status: 'pending'
        });

        if (!invitation) {
            return res.status(404).json({ error: 'Invitation not found or already used' });
        }

        if (invitation.expiresAt < new Date()) {
            invitation.status = 'expired';
            await invitation.save();
            return res.status(400).json({ error: 'Invitation has expired' });
        }

        // Check if user already exists
        let user = await User.findOne({ email: invitation.email });
        
        if (user) {
            // Update existing user to join the organization
            user.organizationId = invitation.organizationId;
            user.role = invitation.role;
            await user.save();
        } else {
            // Create new user
            user = new User({
                email: invitation.email,
                name: invitation.name,
                password: password,
                role: invitation.role,
                organizationId: invitation.organizationId // Join the organization
            });
            await user.save();
        }

        // Update invitation status
        invitation.status = 'accepted';
        await invitation.save();

        res.status(201).json({
            message: 'Account created successfully. You can now login.',
            user: {
                email: user.email,
                name: user.name,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Accept invitation error:', error);
        res.status(500).json({ error: error.message || 'Server error' });
    }
};

// Resend invitation
exports.resendInvitation = async (req, res) => {
    try {
        const { id } = req.params;

        const invitation = await Invitation.findById(id);
        if (!invitation) {
            return res.status(404).json({ error: 'Invitation not found' });
        }

        if (invitation.status === 'accepted') {
            return res.status(400).json({ error: 'Invitation has already been accepted' });
        }

        // Reset token and expiry
        invitation.token = require('crypto').randomBytes(32).toString('hex');
        invitation.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        invitation.status = 'pending';
        await invitation.save();

        // Get inviter name
        const inviter = await User.findById(req.userId);
        const inviterName = inviter?.name || 'A team member';

        // Send invitation email
        const emailResult = await sendInvitationEmail(
            invitation.email,
            invitation.name,
            inviterName,
            invitation.token,
            invitation.role
        );

        if (!emailResult.success) {
            return res.status(500).json({ error: 'Failed to send invitation email' });
        }

        res.json({ message: 'Invitation resent successfully' });
    } catch (error) {
        console.error('Resend invitation error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Delete invitation
exports.deleteInvitation = async (req, res) => {
    try {
        const { id } = req.params;

        const invitation = await Invitation.findByIdAndDelete(id);
        if (!invitation) {
            return res.status(404).json({ error: 'Invitation not found' });
        }

        res.json({ message: 'Invitation deleted successfully' });
    } catch (error) {
        console.error('Delete invitation error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};
