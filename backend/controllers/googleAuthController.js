const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const Organization = require('../models/Organization');
const Invitation = require('../models/Invitation');
const jwt = require('jsonwebtoken');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

exports.googleAuth = async (req, res) => {
    try {
        const { credential, invitationToken } = req.body;
        
        // Verify Google Token
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID
        });
        
        const payload = ticket.getPayload();
        const { sub: googleId, email, name, picture: avatar } = payload;

        // If accepting an invitation
        let invitation = null;
        if (invitationToken) {
            invitation = await Invitation.findOne({ 
                token: invitationToken,
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

            // ENFORCE: Google email MUST match invited email
            if (invitation.email.toLowerCase() !== email.toLowerCase()) {
                return res.status(403).json({ 
                    error: `Access denied. This invitation was sent to ${invitation.email}, but you are signed in as ${email}.` 
                });
            }
        }

        // Check if user exists
        let user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            // Create new user
            user = new User({
                name,
                email: email.toLowerCase(),
                avatar,
                googleId,
                role: invitation ? invitation.role : 'admin',
                organizationId: invitation ? invitation.organizationId : null
            });
            await user.save();

            // If not an invitation, create a new organization
            if (!invitation) {
                const organizationName = `${name}'s Organization`;
                const slug = organizationName.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
                
                const organization = new Organization({
                    name: organizationName,
                    slug,
                    owner: user._id
                });
                await organization.save();

                user.organizationId = organization._id;
                await user.save();
            }
        } else {
            // If user exists but doesn't have googleId, link it
            if (!user.googleId) {
                user.googleId = googleId;
                if (!user.avatar) user.avatar = avatar;
                await user.save();
            }
            
            // If accepting invitation, ensure they join the inviter's organization
            if (invitation) {
                user.organizationId = invitation.organizationId;
                user.role = invitation.role;
                await user.save();
            }
        }

        // If invitation was used, mark it as accepted
        if (invitation) {
            invitation.status = 'accepted';
            await invitation.save();
        }

        // Generate JWT
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
        console.error('Google Auth Error:', error);
        res.status(500).json({ error: 'Google authentication failed' });
    }
};
