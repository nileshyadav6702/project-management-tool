const nodemailer = require('nodemailer');

// Create transporter using Gmail
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Send invitation email
const sendInvitationEmail = async (to, name, inviterName, token, role) => {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const acceptUrl = `${frontendUrl}/accept-invite?token=${token}`;

    const mailOptions = {
        from: `"ProjectHub" <${process.env.EMAIL_USER}>`,
        to: to,
        subject: `You've been invited to join ProjectHub`,
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: #2563eb; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
                    .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
                    .button { display: inline-block; background: #2563eb; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
                    .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
                    .role-badge { display: inline-block; background: #dbeafe; color: #1d4ed8; padding: 4px 12px; border-radius: 20px; font-size: 14px; font-weight: 500; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1 style="margin: 0; font-size: 24px;">Welcome to ProjectHub</h1>
                    </div>
                    <div class="content">
                        <h2 style="margin-top: 0;">Hi ${name}! 👋</h2>
                        <p><strong>${inviterName}</strong> has invited you to join their team on ProjectHub as a <span class="role-badge">${role}</span>.</p>
                        <p>ProjectHub is a powerful project management tool that helps teams collaborate, track progress, and manage tasks efficiently.</p>
                        <p style="text-align: center;">
                            <a href="${acceptUrl}" class="button">Accept Invitation</a>
                        </p>
                        <p style="color: #6b7280; font-size: 14px;">This invitation will expire in 7 days. If you didn't expect this invitation, you can safely ignore this email.</p>
                        <p style="color: #6b7280; font-size: 14px;">If the button doesn't work, copy and paste this link in your browser:</p>
                        <p style="word-break: break-all; color: #2563eb; font-size: 14px;">${acceptUrl}</p>
                    </div>
                    <div class="footer">
                        <p>© ${new Date().getFullYear()} ProjectHub. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        return { success: true };
    } catch (error) {
        console.error('Email send error details:', {
            code: error.code,
            command: error.command,
            response: error.response,
            responseCode: error.responseCode
        });
        return { success: false, error: error.message };
    }
};

module.exports = { sendInvitationEmail, transporter };
