import nodemailer from 'nodemailer';
import crypto from 'crypto';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Configure email transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL, // Your Gmail address (matches your .env)
        pass: process.env.EMAIL_PASSWORD // Gmail App Password (matches your .env)
    }
});

// Generate random verification code
export const generateVerificationCode = (): string => {
    return crypto.randomInt(100000, 999999).toString(); // 6-digit code
};

// Send verification email
export const sendVerificationEmail = async (email: string, code: string, firstname: string): Promise<void> => {
    const mailOptions = {
        from: `"Dr. Tedla Specialized Dental Clinic" <${process.env.EMAIL}>`,
        to: email,
        subject: 'Verify Your Email Address - Dr. Tedla Dental Clinic',
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        line-height: 1.6;
                        color: #333;
                        max-width: 600px;
                        margin: 0 auto;
                        padding: 20px;
                    }
                    .container {
                        background-color: #f9f9f9;
                        border-radius: 10px;
                        padding: 30px;
                        text-align: center;
                    }
                    .header {
                        background: linear-gradient(135deg, #1e5799 0%, #2b7b9c 100%);
                        color: white;
                        padding: 20px;
                        border-radius: 10px 10px 0 0;
                        margin: -30px -30px 20px -30px;
                    }
                    .logo {
                        font-size: 24px;
                        font-weight: bold;
                        margin-bottom: 5px;
                    }
                    .subtitle {
                        font-size: 14px;
                        opacity: 0.9;
                    }
                    .code {
                        font-size: 32px;
                        font-weight: bold;
                        color: #1e5799;
                        background-color: #fff;
                        padding: 15px;
                        border-radius: 5px;
                        letter-spacing: 5px;
                        margin: 20px 0;
                        border: 2px dashed #1e5799;
                        font-family: monospace;
                    }
                    .clinic-info {
                        background-color: #e8f4f8;
                        padding: 15px;
                        border-radius: 8px;
                        margin: 20px 0;
                        font-size: 12px;
                        text-align: center;
                    }
                    .clinic-info p {
                        margin: 5px 0;
                    }
                    .footer {
                        margin-top: 30px;
                        font-size: 11px;
                        color: #777;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <div class="logo">🦷 Dr. Tedla Specialized Dental Clinic</div>
                        <div class="subtitle">Excellence in Dental Care</div>
                    </div>
                    <h2>Hello ${firstname}!</h2>
                    <p>Thank you for choosing <strong>Dr. Tedla Specialized Dental Clinic</strong>. Please use the verification code below to complete your registration:</p>
                    <div class="code">${code}</div>
                    <p>This code will expire in <strong>10 minutes</strong>.</p>
                    
                    <div class="clinic-info">
                        <p>📞 <strong>Contact Us:</strong> 091 333 2731 | 011 827 5888</p>
                        <p>📍 <strong>Address:</strong> Lideta sub-city Wereda 08, AIA Building H.No-new/216</p>
                        <p>🏠 Addis Ababa, Ethiopia</p>
                    </div>
                    
                    <p>If you didn't request this, please ignore this email.</p>
                    
                    <div class="footer">
                        <p>This is an automated message, please do not reply to this email.</p>
                        <p>&copy; ${new Date().getFullYear()} Dr. Tedla Specialized Dental Clinic. All rights reserved.</p>
                        <p>Thank you for trusting us with your dental care!</p>
                    </div>
                </div>
            </body>
            </html>
        `,
        text: `Welcome to Dr. Tedla Specialized Dental Clinic, ${firstname}!\n\nYour verification code is: ${code}\n\nThis code will expire in 10 minutes.\n\n--- Clinic Information ---\nContact: 091 333 2731 | 011 827 5888\nAddress: Lideta sub-city Wereda 08, AIA Building H.No-new/216, Addis Ababa, Ethiopia\n\nIf you didn't request this, please ignore this email.\n\nThank you for choosing Dr. Tedla Specialized Dental Clinic!`
    };

    await transporter.sendMail(mailOptions);
};

// Send password reset email
export const sendPasswordResetEmail = async (email: string, code: string, firstname: string): Promise<void> => {
    const mailOptions = {
        from: `"Dr. Tedla Specialized Dental Clinic" <${process.env.EMAIL}>`,
        to: email,
        subject: 'Password Reset Request - Dr. Tedla Dental Clinic',
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        line-height: 1.6;
                        color: #333;
                        max-width: 600px;
                        margin: 0 auto;
                        padding: 20px;
                    }
                    .container {
                        background-color: #f9f9f9;
                        border-radius: 10px;
                        padding: 30px;
                        text-align: center;
                    }
                    .header {
                        background: linear-gradient(135deg, #1e5799 0%, #2b7b9c 100%);
                        color: white;
                        padding: 20px;
                        border-radius: 10px 10px 0 0;
                        margin: -30px -30px 20px -30px;
                    }
                    .logo {
                        font-size: 24px;
                        font-weight: bold;
                        margin-bottom: 5px;
                    }
                    .code {
                        font-size: 32px;
                        font-weight: bold;
                        color: #ff6b6b;
                        background-color: #fff;
                        padding: 15px;
                        border-radius: 5px;
                        letter-spacing: 5px;
                        margin: 20px 0;
                        border: 2px dashed #ff6b6b;
                        font-family: monospace;
                    }
                    .warning {
                        background-color: #fff3cd;
                        border-left: 4px solid #ffc107;
                        padding: 15px;
                        margin: 20px 0;
                        text-align: left;
                        font-size: 13px;
                    }
                    .clinic-info {
                        background-color: #e8f4f8;
                        padding: 15px;
                        border-radius: 8px;
                        margin: 20px 0;
                        font-size: 12px;
                        text-align: center;
                    }
                    .footer {
                        margin-top: 30px;
                        font-size: 11px;
                        color: #777;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <div class="logo">🦷 Dr. Tedla Specialized Dental Clinic</div>
                        <div class="subtitle">Password Reset Request</div>
                    </div>
                    <h2>Hello ${firstname}!</h2>
                    <p>We received a request to reset your password for your account at <strong>Dr. Tedla Specialized Dental Clinic</strong>.</p>
                    <div class="code">${code}</div>
                    <p>This code will expire in <strong>15 minutes</strong>.</p>
                    
                    <div class="warning">
                        <strong>⚠️ Security Notice:</strong><br>
                        If you didn't request this password reset, please ignore this email. Your password will remain unchanged.
                        Never share this code with anyone.
                    </div>
                    
                    <div class="clinic-info">
                        <p>📞 <strong>Contact Us:</strong> 091 333 2731 | 011 827 5888</p>
                        <p>📍 <strong>Address:</strong> Lideta sub-city Wereda 08, AIA Building H.No-new/216, Addis Ababa, Ethiopia</p>
                    </div>
                    
                    <div class="footer">
                        <p>This is an automated message, please do not reply to this email.</p>
                        <p>&copy; ${new Date().getFullYear()} Dr. Tedla Specialized Dental Clinic. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
        `,
        text: `Dr. Tedla Specialized Dental Clinic - Password Reset\n\nHello ${firstname}!,\n\nWe received a request to reset your password.\n\nYour reset code is: ${code}\n\nThis code will expire in 15 minutes.\n\nIf you didn't request this, please ignore this email and your password will remain unchanged.\n\nNever share this code with anyone.\n\n--- Clinic Information ---\nContact: 091 333 2731 | 011 827 5888\nAddress: Lideta sub-city Wereda 08, AIA Building H.No-new/216, Addis Ababa, Ethiopia\n\nThank you,\nDr. Tedla Specialized Dental Clinic Team`
    };

    await transporter.sendMail(mailOptions);
};

// Send password reset success email
export const sendPasswordResetSuccessEmail = async (email: string, firstname: string): Promise<void> => {
    const mailOptions = {
        from: `"Dr. Tedla Specialized Dental Clinic" <${process.env.EMAIL}>`,
        to: email,
        subject: 'Password Reset Successful - Dr. Tedla Dental Clinic',
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        line-height: 1.6;
                        color: #333;
                        max-width: 600px;
                        margin: 0 auto;
                        padding: 20px;
                    }
                    .container {
                        background-color: #f9f9f9;
                        border-radius: 10px;
                        padding: 30px;
                        text-align: center;
                    }
                    .header {
                        background: linear-gradient(135deg, #1e5799 0%, #2b7b9c 100%);
                        color: white;
                        padding: 20px;
                        border-radius: 10px 10px 0 0;
                        margin: -30px -30px 20px -30px;
                    }
                    .success-icon {
                        font-size: 60px;
                        color: #4CAF50;
                        margin: 20px 0;
                    }
                    .clinic-info {
                        background-color: #e8f4f8;
                        padding: 15px;
                        border-radius: 8px;
                        margin: 20px 0;
                        font-size: 12px;
                        text-align: center;
                    }
                    .footer {
                        margin-top: 30px;
                        font-size: 11px;
                        color: #777;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <div class="logo">🦷 Dr. Tedla Specialized Dental Clinic</div>
                    </div>
                    <div class="success-icon">✅</div>
                    <h2>Password Reset Successful!</h2>
                    <p>Hello ${firstname},</p>
                    <p>Your password has been successfully changed for your account at <strong>Dr. Tedla Specialized Dental Clinic</strong>.</p>
                    <p>You can now log in with your new password.</p>
                    
                    <div class="clinic-info">
                        <p>📞 <strong>Need Help?</strong> Contact us at 091 333 2731 | 011 827 5888</p>
                        <p>📍 <strong>Visit Us:</strong> Lideta sub-city Wereda 08, AIA Building H.No-new/216, Addis Ababa, Ethiopia</p>
                    </div>
                    
                    <p>If you didn't make this change, please contact us immediately.</p>
                    
                    <div class="footer">
                        <p>Thank you for trusting Dr. Tedla Specialized Dental Clinic with your dental care!</p>
                        <p>&copy; ${new Date().getFullYear()} Dr. Tedla Specialized Dental Clinic. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
        `,
        text: `Dr. Tedla Specialized Dental Clinic\n\nHello ${firstname}!,\n\nYour password has been successfully reset.\n\nYou can now log in with your new password.\n\nIf you didn't make this change, please contact us immediately.\n\n--- Clinic Information ---\nContact: 091 333 2731 | 011 827 5888\nAddress: Lideta sub-city Wereda 08, AIA Building H.No-new/216, Addis Ababa, Ethiopia\n\nThank you for choosing Dr. Tedla Specialized Dental Clinic!`
    };

    await transporter.sendMail(mailOptions);
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