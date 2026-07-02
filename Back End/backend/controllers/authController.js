import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { User } from '../models/index.js';
import validator from 'validator';
import logger from '../utils/logger.js';
import { sendVerificationEmail } from '../services/emailService.js';

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
  });
};

const generateRefreshToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET || 'dev_refresh_secret', {
    expiresIn: '7d',
  });
};

export const register = async (req, res) => {
  try {
    const { full_name, institutional_email, password, phone, matric_or_staff_id } = req.body;

    if (!full_name || !institutional_email || !password) {
      return res.status(400).json({ success: false, error: 'Full name, email, and password are required.' });
    }

    if (!validator.isEmail(institutional_email)) {
      return res.status(400).json({ success: false, error: 'A valid email address is required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters.' });
    }

    const existingUser = await User.findOne({ where: { institutional_email } });
    if (existingUser) {
      return res.status(409).json({ success: false, error: 'Email already registered.' });
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');

    const user = await User.create({
      full_name,
      institutional_email,
      password_hash: password,
      phone: phone || null,
      matric_or_staff_id: matric_or_staff_id || null,
      role: 'standard_user',
      verification_token: verificationToken,
      email_verified: false,
    });

    await sendVerificationEmail(institutional_email, verificationToken);

    res.status(201).json({
      success: true,
      message: 'Registration successful. Please check your email to verify your account.',
      data: { user },
    });
  } catch (error) {
    logger.error('Registration error:', error);
    res.status(500).json({ success: false, error: 'Registration failed. Please try again.' });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) {
      return res.status(400).json({ success: false, error: 'Verification token is required.' });
    }

    const user = await User.findOne({ where: { verification_token: token } });
    if (!user) {
      return res.status(400).json({ success: false, error: 'Invalid or expired verification token.' });
    }

    user.email_verified = true;
    user.verification_token = null;
    await user.save();

    res.json({ success: true, message: 'Email verified successfully. You can now log in.' });
  } catch (error) {
    logger.error('Verification error:', error);
    res.status(500).json({ success: false, error: 'Verification failed.' });
  }
};

export const login = async (req, res) => {
  try {
    const { institutional_email, password } = req.body;

    if (!institutional_email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required.' });
    }

    const user = await User.findOne({ where: { institutional_email } });
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid credentials.' });
    }

    if (!user.is_active) {
      return res.status(403).json({ success: false, error: 'Account is deactivated. Contact security admin.' });
    }

    // Temporarily disabled for MVP until SMTP is configured
    // if (!user.email_verified && user.role === 'standard_user') {
    //   return res.status(403).json({ success: false, error: 'Please verify your email before logging in.' });
    // }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid credentials.' });
    }

    user.last_login = new Date();
    const refreshToken = generateRefreshToken(user.id);
    user.refresh_token = refreshToken;
    await user.save();

    const token = generateToken(user.id);

    res.json({
      success: true,
      message: 'Login successful.',
      data: { user, token, refreshToken },
    });
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({ success: false, error: 'Login failed. Please try again.' });
  }
};

export const refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(401).json({ success: false, error: 'Refresh token is required.' });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'dev_refresh_secret');
    const user = await User.findByPk(decoded.userId);

    if (!user || user.refresh_token !== refreshToken) {
      return res.status(403).json({ success: false, error: 'Invalid refresh token.' });
    }

    const newToken = generateToken(user.id);
    res.json({
      success: true,
      data: { token: newToken },
    });
  } catch (error) {
    logger.error('Refresh token error:', error);
    return res.status(403).json({ success: false, error: 'Invalid or expired refresh token.' });
  }
};

export const logout = async (req, res) => {
  try {
    const user = await User.findByPk(req.userId);
    if (user) {
      user.refresh_token = null;
      await user.save();
    }
    res.json({ success: true, message: 'Logged out successfully.' });
  } catch (error) {
    logger.error('Logout error:', error);
    res.status(500).json({ success: false, error: 'Logout failed.' });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.userId, {
      attributes: { exclude: ['password_hash', 'refresh_token', 'verification_token'] },
      include: [
        { association: 'reportedIncidents', limit: 5, order: [['created_at', 'DESC']] },
        { association: 'alerts', limit: 5, order: [['created_at', 'DESC']] },
      ],
    });

    res.json({ success: true, data: { user } });
  } catch (error) {
    logger.error('Profile fetch error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch profile.' });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { full_name, phone } = req.body;
    const user = await User.findByPk(req.userId);

    if (full_name) user.full_name = full_name;
    if (phone) user.phone = phone;

    await user.save();
    res.json({ success: true, message: 'Profile updated successfully.', data: { user } });
  } catch (error) {
    logger.error('Profile update error:', error);
    res.status(500).json({ success: false, error: 'Failed to update profile.' });
  }
};
