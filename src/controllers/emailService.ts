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
        from: `"Medical System" <${process.env.EMAIL}>`, // FIXED: Use EMAIL instead of EMAIL_USER
        to: email,
        subject: 'Verify Your Email Address',
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
                        background-color: #4CAF50;
                        color: white;
                        padding: 20px;
                        border-radius: 10px 10px 0 0;
                        margin: -30px -30px 20px -30px;
                    }
                    .code {
                        font-size: 32px;
                        font-weight: bold;
                        color: #4CAF50;
                        background-color: #fff;
                        padding: 15px;
                        border-radius: 5px;
                        letter-spacing: 5px;
                        margin: 20px 0;
                        border: 2px dashed #4CAF50;
                        font-family: monospace;
                    }
                    .footer {
                        margin-top: 30px;
                        font-size: 12px;
                        color: #777;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Email Verification</h1>
                    </div>
                    <h2>Hello ${firstname}!</h2>
                    <p>Thank you for registering with our Medical System. Please use the verification code below to complete your registration:</p>
                    <div class="code">${code}</div>
                    <p>This code will expire in <strong>10 minutes</strong>.</p>
                    <p>If you didn't request this, please ignore this email.</p>
                    <div class="footer">
                        <p>This is an automated message, please do not reply to this email.</p>
                        <p>&copy; ${new Date().getFullYear()} Medical System. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
        `,
        text: `Your verification code is: ${code}\n\nThis code will expire in 10 minutes.\n\nThank you for registering with our Medical System.`
    };

    await transporter.sendMail(mailOptions);
};

// Test email configuration
export const testEmailConfig = async (): Promise<boolean> => {
    try {
        await transporter.verify();
        console.log('✅ Email service configured successfully');
        return true;
    } catch (error) {
        console.error('❌ Email configuration error:', error);
        return false;
    }
};