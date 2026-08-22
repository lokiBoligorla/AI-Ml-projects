const nodemailer = require('nodemailer');

/**
 * Sends a confirmation email for a successful job application.
 * 
 * @param {string} to - Recipient email address
 * @param {object} applicationDetails - { title, company, link, matchScore }
 * @param {object} smtpConfig - { smtpHost, smtpPort, smtpUser, smtpPass }
 */
async function sendConfirmationEmail(to, applicationDetails, smtpConfig) {
    if (!smtpConfig || !smtpConfig.smtpHost || !smtpConfig.smtpUser || !smtpConfig.smtpPass) {
        console.warn('[EMAIL SERVICE] SMTP configuration incomplete. Email skipped.');
        return;
    }

    const transporter = nodemailer.createTransport({
        host: smtpConfig.smtpHost,
        port: smtpConfig.smtpPort || 587,
        secure: (smtpConfig.smtpPort == 465), // true for 465, false for other ports
        auth: {
            user: smtpConfig.smtpUser,
            pass: smtpConfig.smtpPass,
        },
    });

    const mailOptions = {
        from: `"Indeed AutoPilot" <${smtpConfig.smtpUser}>`,
        to: to,
        subject: `Application Sent: ${applicationDetails.title} at ${applicationDetails.company}`,
        text: `Hello,\n\nYour application for "${applicationDetails.title}" at "${applicationDetails.company}" has been successfully sent via Indeed AutoPilot.\n\nJob Details:\n- Role: ${applicationDetails.title}\n- Company: ${applicationDetails.company}\n- Match Score: ${applicationDetails.matchScore}%\n- Link: ${applicationDetails.link}\n\nGood luck!`,
        html: `
            <div style="font-family: Arial, sans-serif; color: #333;">
                <h2 style="color: #6366f1;">Application Successfully Sent!</h2>
                <p>Hello,</p>
                <p>Your application for <b>${applicationDetails.title}</b> at <b>${applicationDetails.company}</b> has been successfully sent via <b>Indeed AutoPilot</b>.</p>
                <div style="background: #f8fafc; padding: 1rem; border-radius: 8px; border: 1px solid #e2e8f0;">
                    <p><b>Match Score:</b> ${applicationDetails.matchScore}%</p>
                    <p><b>Job Link:</b> <a href="${applicationDetails.link}" style="color: #6366f1;">View on Indeed</a></p>
                </div>
                <p>Good luck with your job hunt!</p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 2rem 0;">
                <p style="font-size: 0.8rem; color: #94a3b8;">Sent via Indeed AutoPilot Bot.</p>
            </div>
        `
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`[EMAIL SERVICE] Confirmation email sent to ${to}: ${info.messageId}`);
    } catch (error) {
        console.error(`[EMAIL SERVICE ERROR] Failed to send email:`, error.message);
    }
}

module.exports = { sendConfirmationEmail };
