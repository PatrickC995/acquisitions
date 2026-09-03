import logger from '#config/logger.js';
import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} from '#services/users.services.js';
import {
  userIdSchema,
  updateUserSchema,
} from '#validations/users.validation.js';
import { formatvalidationError } from '#utils/format.js';

export const fetchAllUsers = async (req, res) => {
  try {
    logger.info('Getting users...');

    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admin users can fetch all users',
      });
    }

    const users = await getAllUsers();

    res.status(200).json({
      success: true,
      data: users,
    });
  } catch (e) {
    logger.error('Error fetching users', e);

    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
    });
  }
};

export const fetchUserById = async (req, res) => {
  try {
    logger.info('Getting user by ID...');

    const validationResult = userIdSchema.safeParse({ id: req.params.id });

    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        details: formatvalidationError(validationResult.error.issues),
      });
    }

    const userId = validationResult.data.id;

    if (req.user.id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You can only access your own information',
      });
    }

    const user = await getUserById(userId);

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (e) {
    logger.error('Error fetching user by ID', e);

    if (e.message === 'User not found') {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to fetch user',
    });
  }
};

export const updateUserById = async (req, res) => {
  try {
    logger.info('Updating user...');

    const idValidation = userIdSchema.safeParse({ id: req.params.id });

    if (!idValidation.success) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        details: formatvalidationError(idValidation.error.issues),
      });
    }

    const updateValidation = updateUserSchema.safeParse(req.body);

    if (!updateValidation.success) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        details: formatvalidationError(updateValidation.error.issues),
      });
    }

    const userId = idValidation.data.id;
    const updates = updateValidation.data;

    if (updates.role && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admin users can change user roles',
      });
    }

    if (req.user.id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own information',
      });
    }

    const updatedUser = await updateUser(userId, updates);

    res.status(200).json({
      success: true,
      message: 'Update successful',
      data: updatedUser,
    });
  } catch (e) {
    logger.error('Error updating user', e);

    if (e.message === 'User not found') {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update user',
    });
  }
};

export const deleteUserById = async (req, res) => {
  try {
    logger.info('Deleting user...');

    const validationResult = userIdSchema.safeParse({ id: req.params.id });

    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        details: formatvalidationError(validationResult.error.issues),
      });
    }

    const userId = validationResult.data.id;

    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admin users can delete users',
      });
    }

    await deleteUser(userId);

    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (e) {
    logger.error('Error deleting user', e);

    if (e.message === 'User not found') {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to delete user',
    });
  }
};
