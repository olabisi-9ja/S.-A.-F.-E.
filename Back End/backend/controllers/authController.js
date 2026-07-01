import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';
import validator from 'validator';

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

export const register = async (req, res) => {
  try {
    const { full_name, institutional_email, password, phone, matric_or_staff_id } = req.body;

    // Validation
    if (!full_name || !institutional_email || !password) {
      return res.status(400).json({ 
        success: false, 
        error: 'Full name, email, and password are required.' 
      });
    }

    // Check if email is institutional
    if (!institutional_email.endsWith('@kwasu.edu.ng')) {
      return res.status(400).json({ 
        success: false, 
        error: 'Only @kwasu.edu.ng email addresses are accepted.' 
      });
    }

    // Check password strength
    if (password.length < 6) {
      return res.status(400).json({ 
        success: false, 
        error: 'Password must be at least 6 characters.' 
      });
    }

    // Check if user exists
    const existingUser = await User.findOne({ where: { institutional_email } });
    if (existingUser) {
      return res.status(409).json({ 
        success: false, 
        error: 'Email already registered.' 
      });
    }

    // Create user
    const user = await User.create({
      full_name,
      institutional_email,
      password_hash: password,
      phone: phone || null,
      matric_or_staff_id: matric_or_staff_id || null,
      role: 'standard_user',
    });

    // Generate token
    const token = generateToken(user.id);

    res.status(201).json({
      success: true,
      message: 'Registration successful.',
      data: {
        user,
        token,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Registration failed. Please try again.' 
    });
  }
};

export const login = async (req, res) => {
  try {
    const { institutional_email, password } = req.body;

    if (!institutional_email || !password) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email and password are required.' 
      });
    }

    const user = await User.findOne({ where: { institutional_email } });
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid credentials.' 
      });
    }

    if (!user.is_active) {
      return res.status(403).json({ 
        success: false, 
        error: 'Account is deactivated. Contact security admin.' 
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid credentials.' 
      });
    }

    // Update last login
    user.last_login = new Date();
    await user.save();

    const token = generateToken(user.id);

    res.json({
      success: true,
      message: 'Login successful.',
      data: {
        user,
        token,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Login failed. Please try again.' 
    });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.userId, {
      attributes: { exclude: ['password_hash'] },
      include: [
        { association: 'reportedIncidents', limit: 5, order: [['created_at', 'DESC']] },
        { association: 'alerts', limit: 5, order: [['created_at', 'DESC']] },
      ],
    });

    res.json({
      success: true,
      data: { user },
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch profile.' 
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { full_name, phone } = req.body;
    const user = await User.findByPk(req.userId);

    if (full_name) user.full_name = full_name;
    if (phone) user.phone = phone;

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully.',
      data: { user },
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to update profile.' 
    });
  }
};
