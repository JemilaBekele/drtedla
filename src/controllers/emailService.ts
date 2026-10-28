import nodemailer from 'nodemailer';
import crypto from 'crypto';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const CLINIC_NAME = 'Dr. Tedla Specialized Dental Clinic';
const CLINIC_PHONE = '091 333 2731 | 011 827 5888';
const CLINIC_ADDRESS = 'Lideta sub-city Wereda 08, AIA Building H.No-new/216, Addis Ababa, Ethiopia';

// SMTP settings. Defaults to Gmail; set SMTP_HOST/SMTP_PORT/SMTP_USER/SMTP_PASS to use a
// transactional provider (Brevo, Mailgun, SES, Zoho...) with your own domain for best inbox placement.
const SMTP_USER = process.env.SMTP_USER || process.env.EMAIL;
const SMTP_PASS = process.env.SMTP_PASS || process.env.EMAIL_PASSWORD;
const SMTP_PORT = Number(process.env.SMTP_PORT || process.env.EMAIL_PORT || 465);
const FROM_EMAIL = process.env.EMAIL_FROM || process.env.EMAIL;
const REPLY_TO = process.env.EMAIL_REPLY_TO || FROM_EMAIL;

// Configure email transporter
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    pool: true,
    auth: {
        user: SMTP_USER,
        pass: SMTP_PASS
    }
});

// Generate random verification code
export const generateVerificationCode = (): string => {
    return crypto.randomInt(100000, 999999).toString(); // 6-digit code
};

/**
 * Simple, table-based layout with inline styles only. Spam filters penalise <style> blocks,
 * heavy CSS (gradients), emoji-heavy markup and "no-reply" wording, so keep templates plain.
 */
const renderLayout = (title: string, bodyHtml: string): string => `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title}</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f4;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f4f4f4;">
<tr><td align="center" style="padding:24px 12px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;background-color:#ffffff;border-radius:8px;font-family:Arial,Helvetica,sans-serif;color:#333333;font-size:15px;line-height:1.6;">
<tr><td style="background-color:#1e5799;color:#ffffff;padding:20px 24px;border-radius:8px 8px 0 0;font-size:18px;font-weight:bold;">${CLINIC_NAME}</td></tr>
<tr><td style="padding:24px;">
${bodyHtml}
</td></tr>
<tr><td style="padding:16px 24px;border-top:1px solid #eeeeee;font-size:12px;color:#777777;">
${CLINIC_NAME}<br>
${CLINIC_ADDRESS}<br>
Phone: ${CLINIC_PHONE}<br>
You received this email because an account action was requested with this address at ${CLINIC_NAME}.
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;

const renderCode = (code: string): string =>
    `<p style="margin:24px 0;text-align:center;"><span style="display:inline-block;font-size:28px;font-weight:bold;letter-spacing:6px;color:#1e5799;padding:12px 20px;border:1px solid #cccccc;border-radius:6px;font-family:'Courier New',monospace;">${code}</span></p>`;

const textFooter = `\n\n--\n${CLINIC_NAME}\n${CLINIC_ADDRESS}\nPhone: ${CLINIC_PHONE}`;

const sendMail = async (to: string, subject: string, html: string, text: string): Promise<void> => {
    await transporter.sendMail({
        from: { name: CLINIC_NAME, address: FROM_EMAIL as string },
        replyTo: REPLY_TO,
        to,
        subject,
        html,
        text,
        headers: {
            // Unique per message so Gmail doesn't thread/collapse repeated code emails
            'X-Entity-Ref-ID': crypto.randomUUID()
        }
    });
};

// Send verification email
export const sendVerificationEmail = async (email: string, code: string, firstname: string): Promise<void> => {
    const subject = `Your ${CLINIC_NAME} verification code`;
    const html = renderLayout(subject, `
<p style="margin:0 0 16px;">Hello ${firstname},</p>
<p style="margin:0 0 16px;">Thank you for registering with ${CLINIC_NAME}. Enter the code below to confirm your email address:</p>
${renderCode(code)}
<p style="margin:0 0 16px;">This code expires in 10 minutes.</p>
<p style="margin:0;">If you did not create an account, you can safely ignore this email.</p>`);
    const text = `Hello ${firstname},\n\nThank you for registering with ${CLINIC_NAME}.\n\nYour verification code is: ${code}\n\nThis code expires in 10 minutes.\n\nIf you did not create an account, you can safely ignore this email.${textFooter}`;

    await sendMail(email, subject, html, text);
};

// Send password reset email
export const sendPasswordResetEmail = async (email: string, code: string, firstname: string): Promise<void> => {
    const subject = `Your ${CLINIC_NAME} password reset code`;
    const html = renderLayout(subject, `
<p style="margin:0 0 16px;">Hello ${firstname},</p>
<p style="margin:0 0 16px;">We received a request to reset the password for your ${CLINIC_NAME} account. Use this code to continue:</p>
${renderCode(code)}
<p style="margin:0 0 16px;">This code expires in 15 minutes. Never share it with anyone.</p>
<p style="margin:0;">If you did not request a password reset, ignore this email and your password will stay the same.</p>`);
    const text = `Hello ${firstname},\n\nWe received a request to reset the password for your ${CLINIC_NAME} account.\n\nYour reset code is: ${code}\n\nThis code expires in 15 minutes. Never share it with anyone.\n\nIf you did not request a password reset, ignore this email and your password will stay the same.${textFooter}`;

    await sendMail(email, subject, html, text);
};

// Send password reset success email
export const sendPasswordResetSuccessEmail = async (email: string, firstname: string): Promise<void> => {
    const subject = `Your ${CLINIC_NAME} password was changed`;
    const html = renderLayout(subject, `
<p style="margin:0 0 16px;">Hello ${firstname},</p>
<p style="margin:0 0 16px;">The password for your ${CLINIC_NAME} account was changed successfully. You can now sign in with your new password.</p>
<p style="margin:0;">If you did not make this change, please call us right away at ${CLINIC_PHONE}.</p>`);
    const text = `Hello ${firstname},\n\nThe password for your ${CLINIC_NAME} account was changed successfully. You can now sign in with your new password.\n\nIf you did not make this change, please call us right away at ${CLINIC_PHONE}.${textFooter}`;

    await sendMail(email, subject, html, text);
};

// Test email configuration
export const testEmailConfig = async (): Promise<boolean> => {
    try {
        await transporter.verify();
        console.log('✅ Dr. Tedla Specialized Dental Clinic - Email service configured successfully');
        return true;
    } catch (error) {
        console.error('❌ Email configuration error:', error);
        return false;
    }
};
