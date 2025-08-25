const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getConfig } = require('../config');

const config = getConfig();

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30,
    match: /^[a-zA-Z0-9_]+$/
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    select: false // Don't include password in queries by default
  },
  firstName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  role: {
    type: String,
    enum: ['admin', 'manager', 'operator', 'viewer'],
    default: 'viewer'
  },
  language: {
    type: String,
    default: 'en',
    enum: ['en', 'hi', 'ta', 'kn', 'te', 'th', 'vi']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: {
    type: Date
  },
  resetPasswordToken: {
    type: String
  },
  resetPasswordExpires: {
    type: Date
  },
  permissions: [{
    type: String,
    enum: [
      'read:ponds', 'write:ponds', 'delete:ponds',
      'read:seasons', 'write:seasons', 'delete:seasons',
      'read:feedInputs', 'write:feedInputs', 'delete:feedInputs',
      'read:waterQuality', 'write:waterQuality', 'delete:waterQuality',
      'read:growthSampling', 'write:growthSampling', 'delete:growthSampling',
      'read:inventory', 'write:inventory', 'delete:inventory',
      'read:events', 'write:events', 'delete:events',
      'read:employees', 'write:employees', 'delete:employees',
      'read:expenses', 'write:expenses', 'delete:expenses',
      'read:reports', 'write:reports',
      'manage:users', 'manage:system'
    ]
  }]
}, {
  timestamps: true,
  toJSON: {
    transform: function (doc, ret) {
      delete ret.password;
      delete ret.resetPasswordToken;
      delete ret.resetPasswordExpires;
      delete ret.loginAttempts;
      delete ret.lockUntil;
      return ret;
    }
  }
});

// Virtual for full name
userSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for account lock status
userSchema.virtual('isLocked').get(function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Index for better query performance
userSchema.index({ username: 1 });
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });

// Hash password before saving
userSchema.pre('save', async function (next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();

  try {
    // Hash password with cost of 12
    const salt = await bcrypt.genSalt(config.security.bcryptSaltRounds);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to check password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Instance method to generate JWT token
userSchema.methods.generateAuthToken = function () {
  return jwt.sign(
    {
      userId: this._id,
      username: this.username,
      email: this.email,
      role: this.role,
      permissions: this.permissions
    },
    config.security.jwtSecret,
    {
      expiresIn: config.security.jwtExpiresIn,
      issuer: 'shrimpfarm-api',
      audience: 'shrimpfarm-client'
    }
  );
};

// Instance method to increment login attempts
userSchema.methods.incLoginAttempts = function () {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 }
    });
  }

  const updates = { $inc: { loginAttempts: 1 } };

  // If we've reached max attempts and it's not locked already, lock the account
  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + (2 * 60 * 60 * 1000) }; // Lock for 2 hours
  }

  return this.updateOne(updates);
};

// Instance method to reset login attempts
userSchema.methods.resetLoginAttempts = function () {
  return this.updateOne({
    $unset: { loginAttempts: 1, lockUntil: 1 },
    $set: { lastLogin: new Date() }
  });
};

// Static method to set default permissions based on role
userSchema.statics.getDefaultPermissions = function (role) {
  const permissionsByRole = {
    admin: [
      'read:ponds', 'write:ponds', 'delete:ponds',
      'read:seasons', 'write:seasons', 'delete:seasons',
      'read:feedInputs', 'write:feedInputs', 'delete:feedInputs',
      'read:waterQuality', 'write:waterQuality', 'delete:waterQuality',
      'read:growthSampling', 'write:growthSampling', 'delete:growthSampling',
      'read:inventory', 'write:inventory', 'delete:inventory',
      'read:events', 'write:events', 'delete:events',
      'read:employees', 'write:employees', 'delete:employees',
      'read:expenses', 'write:expenses', 'delete:expenses',
      'read:reports', 'write:reports',
      'manage:users', 'manage:system'
    ],
    manager: [
      'read:ponds', 'write:ponds',
      'read:seasons', 'write:seasons',
      'read:feedInputs', 'write:feedInputs',
      'read:waterQuality', 'write:waterQuality',
      'read:growthSampling', 'write:growthSampling',
      'read:inventory', 'write:inventory',
      'read:events', 'write:events',
      'read:employees', 'write:employees',
      'read:expenses', 'write:expenses',
      'read:reports', 'write:reports'
    ],
    operator: [
      'read:ponds',
      'read:seasons',
      'read:feedInputs', 'write:feedInputs',
      'read:waterQuality', 'write:waterQuality',
      'read:growthSampling', 'write:growthSampling',
      'read:inventory',
      'read:events', 'write:events',
      'read:reports'
    ],
    viewer: [
      'read:ponds',
      'read:seasons',
      'read:feedInputs',
      'read:waterQuality',
      'read:growthSampling',
      'read:inventory',
      'read:events',
      'read:reports'
    ]
  };

  return permissionsByRole[role] || permissionsByRole.viewer;
};

// Set default permissions before saving new users
userSchema.pre('save', function (next) {
  if (this.isNew && (!this.permissions || this.permissions.length === 0)) {
    this.permissions = this.constructor.getDefaultPermissions(this.role);
  }
  next();
});

module.exports = mongoose.model('User', userSchema);
