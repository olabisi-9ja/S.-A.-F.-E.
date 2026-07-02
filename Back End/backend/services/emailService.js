import nodemailer from 'nodemailer';
import logger from '../utils/logger.js';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.ethereal.email',
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: parseInt(process.env.SMTP_PORT) === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendVerificationEmail = async (to, token) => {
  const verificationUrl = `http://localhost:5173/auth/verify?token=${token}`;
  
  const mailOptions = {
    from: process.env.EMAIL_FROM || '"S.A.F.E. System" <noreply@safe.kwasu.edu.ng>',
    to,
    subject: 'Verify your S.A.F.E. Account',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome to S.A.F.E. KWASU!</h2>
        <p>Please verify your email address by clicking the link below:</p>
        <div style="margin: 30px 0;">
          <a href="${verificationUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
            Verify Email Address
          </a>
        </div>
        <p>If the button doesn't work, copy and paste this link into your browser:</p>
        <p><a href="${verificationUrl}">${verificationUrl}</a></p>
        <p style="color: #666; font-size: 14px; margin-top: 40px;">If you didn't request this, you can safely ignore this email.</p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    logger.info(`Verification email sent to ${to}`, { messageId: info.messageId });
    return true;
  } catch (error) {
    logger.error(`Failed to send verification email to ${to}:`, error);
    return false;
  }
};
