import { User } from '../models/index.js';
import logger from '../utils/logger.js';

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'full_name', 'institutional_email', 'matric_or_staff_id', 'role', 'created_at', 'updated_at'],
      order: [['created_at', 'DESC']],
    });
    res.json({ success: true, data: { users } });
  } catch (error) {
    logger.error('Error fetching users:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch users' });
  }
};

export const createUser = async (req, res) => {
  try {
    const { full_name, institutional_email, matric_or_staff_id, role, password } = req.body;

    if (!full_name || !institutional_email || !matric_or_staff_id || !role || !password) {
      return res.status(400).json({ success: false, error: 'All fields are required' });
    }

    const existingUser = await User.findOne({ where: { institutional_email } });
    if (existingUser) {
      return res.status(400).json({ success: false, error: 'Email already exists' });
    }

    const newUser = await User.create({
      full_name,
      institutional_email,
      matric_or_staff_id,
      role,
      password_hash: password,
      email_verified: true, // Admin-created users are pre-verified
    });

    const userResponse = newUser.toJSON();
    delete userResponse.password_hash;

    res.status(201).json({ success: true, data: { user: userResponse } });
  } catch (error) {
    logger.error('Error creating user:', error);
    res.status(500).json({ success: false, error: 'Failed to create user' });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { full_name, institutional_email, matric_or_staff_id, role, password } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const updateData = { full_name, institutional_email, matric_or_staff_id, role };

    if (password) {
      updateData.password_hash = password;
    }

    await user.update(updateData);

    const userResponse = user.toJSON();
    delete userResponse.password_hash;

    res.json({ success: true, data: { user: userResponse } });
  } catch (error) {
    logger.error('Error updating user:', error);
    res.status(500).json({ success: false, error: 'Failed to update user' });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    if (user.id === req.userId) {
      return res.status(400).json({ success: false, error: 'You cannot delete your own account' });
    }

    await user.destroy();
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    logger.error('Error deleting user:', error);
    res.status(500).json({ success: false, error: 'Failed to delete user' });
  }
};
