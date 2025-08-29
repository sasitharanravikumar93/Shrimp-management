/**
 * Authentication Controller
 * Handles user registration, login, logout, and profile management
 */

const crypto = require('crypto');
const User = require('../models/User');
const { logger } = require('../utils/logger');
const {
  asyncHandler,
  sendSuccessResponse,
  ValidationError,
  UnauthorizedError,
  ConflictError,
  NotFoundError
} = require('../utils/errorHandler');

/**
 * Register a new user
 */
exports.register = asyncHandler(async (req, res) => {
  const { username, email, password, firstName, lastName, role, language } = req.body;

  logger.info('User registration attempt', { username, email, role });

  // Check if user already exists
  const existingUser = await User.findOne({
    $or: [{ username }, { email }]
  });

  if (existingUser) {
    if (existingUser.username === username) {
      throw new ConflictError('Username already exists');
    }
    if (existingUser.email === email) {
      throw new ConflictError('Email already exists');
    }
  }

  // Create new user
  const user = new User({
    username,
    email,
    password,
    firstName,
    lastName,
    role: role || 'viewer', // Default role
    language: language || 'en'
  });

  await user.save();

  // Generate token
  const token = user.generateAuthToken();

  logger.info('User registered successfully', {
    userId: user._id,
    username: user.username,
    role: user.role
  });

  sendSuccessResponse(res, {
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: user.fullName,
      role: user.role,
      language: user.language,
      permissions: user.permissions
    },
    token
  }, 'User registered successfully', 201);
});

/**
 * User login
 */
exports.login = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  logger.info('User login attempt', { username, ip: req.ip });

  // Find user and include password field
  const user = await User.findOne({
    $or: [{ username }, { email: username }]
  }).select('+password');

  if (!user) {
    throw new UnauthorizedError('Invalid username or password');
  }

  // Check if account is locked
  if (user.isLocked) {
    logger.warn('Login attempt on locked account', {
      username,
      userId: user._id,
      lockUntil: user.lockUntil
    });
    throw new UnauthorizedError('Account is locked due to too many failed login attempts');
  }

  // Check if account is active
  if (!user.isActive) {
    throw new UnauthorizedError('Account is deactivated');
  }

  // Verify password
  const isPasswordValid = await user.comparePassword(password);

  if (!isPasswordValid) {
    // Increment login attempts
    await user.incLoginAttempts();

    logger.warn('Failed login attempt', {
      username,
      userId: user._id,
      loginAttempts: user.loginAttempts + 1
    });

    throw new UnauthorizedError('Invalid username or password');
  }

  // Reset login attempts on successful login
  await user.resetLoginAttempts();

  // Generate token
  const token = user.generateAuthToken();

  logger.info('User logged in successfully', {
    userId: user._id,
    username: user.username,
    role: user.role
  });

  sendSuccessResponse(res, {
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: user.fullName,
      role: user.role,
      language: user.language,
      permissions: user.permissions,
      lastLogin: user.lastLogin
    },
    token
  }, 'Login successful');
});

/**
 * User logout
 */
exports.logout = asyncHandler((req, res) => {
  logger.info('User logout', { userId: req.user._id, username: req.user.username });

  // In a real implementation, you might want to blacklist the token
  // For now, we'll just send a success response

  sendSuccessResponse(res, null, 'Logout successful');
});

/**
 * Get current user profile
 */
exports.getProfile = asyncHandler((req, res) => {
  const user = req.user;

  sendSuccessResponse(res, {
    id: user._id,
    username: user.username,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    fullName: user.fullName,
    role: user.role,
    language: user.language,
    permissions: user.permissions,
    lastLogin: user.lastLogin,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  }, 'Profile retrieved successfully');
});

/**
 * Update user profile
 */
exports.updateProfile = asyncHandler(async (req, res) => {
  const { firstName, lastName, language, email } = req.body;
  const user = req.user;

  logger.info('User profile update', { userId: user._id, username: user.username });

  // Check if email is already taken by another user
  if (email && email !== user.email) {
    const existingUser = await User.findOne({
      email,
      _id: { $ne: user._id }
    });

    if (existingUser) {
      throw new ConflictError('Email already exists');
    }
  }

  // Update allowed fields
  const updateData = {};
  if (firstName) { updateData.firstName = firstName; }
  if (lastName) { updateData.lastName = lastName; }
  if (language) { updateData.language = language; }
  if (email) { updateData.email = email; }

  const updatedUser = await User.findByIdAndUpdate(
    user._id,
    updateData,
    { new: true, runValidators: true }
  );

  sendSuccessResponse(res, {
    id: updatedUser._id,
    username: updatedUser.username,
    email: updatedUser.email,
    firstName: updatedUser.firstName,
    lastName: updatedUser.lastName,
    fullName: updatedUser.fullName,
    role: updatedUser.role,
    language: updatedUser.language,
    permissions: updatedUser.permissions
  }, 'Profile updated successfully');
});

/**
 * Change password
 */
exports.changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select('+password');

  logger.info('Password change attempt', { userId: user._id, username: user.username });

  // Verify current password
  const isCurrentPasswordValid = await user.comparePassword(currentPassword);

  if (!isCurrentPasswordValid) {
    throw new UnauthorizedError('Current password is incorrect');
  }

  // Update password
  user.password = newPassword;
  await user.save();

  logger.info('Password changed successfully', { userId: user._id, username: user.username });

  sendSuccessResponse(res, null, 'Password changed successfully');
});

/**
 * Get all users (admin only)
 */
exports.getAllUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, role, isActive } = req.query;

  // Build filter
  const filter = {};
  if (role) { filter.role = role; }
  if (isActive !== undefined) { filter.isActive = isActive === 'true'; }

  // Calculate pagination
  const skip = (page - 1) * limit;

  // Get users
  const users = await User.find(filter)
    .select('-password -resetPasswordToken -resetPasswordExpires')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit, 10));

  // Get total count for pagination
  const total = await User.countDocuments(filter);

  sendSuccessResponse(res, users, 'Users retrieved successfully', 200, {
    pagination: {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

/**
 * Create user (admin only)
 */
exports.createUser = asyncHandler(async (req, res) => {
  const { username, email, password, firstName, lastName, role, language, permissions } = req.body;

  logger.info('Admin creating new user', {
    adminId: req.user._id,
    newUsername: username,
    newRole: role
  });

  // Check if user already exists
  const existingUser = await User.findOne({
    $or: [{ username }, { email }]
  });

  if (existingUser) {
    if (existingUser.username === username) {
      throw new ConflictError('Username already exists');
    }
    if (existingUser.email === email) {
      throw new ConflictError('Email already exists');
    }
  }

  // Create new user
  const user = new User({
    username,
    email,
    password,
    firstName,
    lastName,
    role: role || 'viewer',
    language: language || 'en',
    permissions: permissions || User.getDefaultPermissions(role || 'viewer')
  });

  await user.save();

  logger.info('User created by admin', {
    adminId: req.user._id,
    newUserId: user._id,
    newUsername: user.username,
    newRole: user.role
  });

  sendSuccessResponse(res, {
    id: user._id,
    username: user.username,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    fullName: user.fullName,
    role: user.role,
    language: user.language,
    permissions: user.permissions,
    isActive: user.isActive
  }, 'User created successfully', 201);
});

/**
 * Update user (admin only)
 */
exports.updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { firstName, lastName, role, language, permissions, isActive } = req.body;

  logger.info('Admin updating user', {
    adminId: req.user._id,
    targetUserId: id
  });

  const user = await User.findById(id);

  if (!user) {
    throw new NotFoundError('User');
  }

  // Prepare update data
  const updateData = {};
  if (firstName !== undefined) { updateData.firstName = firstName; }
  if (lastName !== undefined) { updateData.lastName = lastName; }
  if (role !== undefined) {
    updateData.role = role;
    // Update permissions based on new role if permissions not explicitly provided
    if (permissions === undefined) {
      updateData.permissions = User.getDefaultPermissions(role);
    }
  }
  if (language !== undefined) { updateData.language = language; }
  if (permissions !== undefined) { updateData.permissions = permissions; }
  if (isActive !== undefined) { updateData.isActive = isActive; }

  const updatedUser = await User.findByIdAndUpdate(
    id,
    updateData,
    { new: true, runValidators: true }
  );

  sendSuccessResponse(res, {
    id: updatedUser._id,
    username: updatedUser.username,
    email: updatedUser.email,
    firstName: updatedUser.firstName,
    lastName: updatedUser.lastName,
    fullName: updatedUser.fullName,
    role: updatedUser.role,
    language: updatedUser.language,
    permissions: updatedUser.permissions,
    isActive: updatedUser.isActive
  }, 'User updated successfully');
});

/**
 * Delete user (admin only)
 */
exports.deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  logger.info('Admin deleting user', {
    adminId: req.user._id,
    targetUserId: id
  });

  // Prevent admin from deleting themselves
  if (id === req.user._id.toString()) {
    throw new ValidationError('You cannot delete your own account');
  }

  const user = await User.findByIdAndDelete(id);

  if (!user) {
    throw new NotFoundError('User');
  }

  logger.info('User deleted by admin', {
    adminId: req.user._id,
    deletedUserId: user._id,
    deletedUsername: user.username
  });

  sendSuccessResponse(res, null, 'User deleted successfully');
});

/**
 * Reset password request
 */
exports.forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    // Don't reveal if email exists or not
    sendSuccessResponse(res, null, 'If the email exists, a password reset link will be sent');
    return;
  }

  // Generate reset token
  const resetToken = crypto.randomBytes(32).toString('hex');
  user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  user.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

  await user.save({ validateBeforeSave: false });

  // In a real implementation, you would send an email with the reset link
  // For now, we'll just log it (remove in production)
  logger.info('Password reset token generated', {
    userId: user._id,
    resetToken: resetToken // Remove this in production
  });

  sendSuccessResponse(res, null, 'If the email exists, a password reset link will be sent');
});

/**
 * Reset password
 */
exports.resetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;

  // Hash the token
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  // Find user by token and check if token is still valid
  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() }
  });

  if (!user) {
    throw new ValidationError('Token is invalid or has expired');
  }

  // Set new password
  user.password = newPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  user.loginAttempts = 0;
  user.lockUntil = undefined;

  await user.save();

  logger.info('Password reset successfully', { userId: user._id, username: user.username });

  sendSuccessResponse(res, null, 'Password reset successfully');
});

module.exports = {
  register: exports.register,
  login: exports.login,
  logout: exports.logout,
  getProfile: exports.getProfile,
  updateProfile: exports.updateProfile,
  changePassword: exports.changePassword,
  getAllUsers: exports.getAllUsers,
  createUser: exports.createUser,
  updateUser: exports.updateUser,
  deleteUser: exports.deleteUser,
  forgotPassword: exports.forgotPassword,
  resetPassword: exports.resetPassword
};