const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { validateUserRegistration, validateUserLogin } = require('../middleware/validation');
const crypto = require('crypto');
const emailService = require('../utils/emailService');

const router = express.Router();

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d'
  });
};

// @desc    Register user
// @route   POST /api/auth/signup
// @access  Public
router.post('/signup', validateUserRegistration, async (req, res, next) => {
  try {
    const { name, email, password, role, organization } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role,
      organization: (role === 'institution' || role === 'verifier') ? organization : undefined
    });

    // Generate token
    const token = generateToken(user._id);

    // Remove password from response
    user.password = undefined;

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        organization: user.organization,
        isActive: user.isActive,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
router.post('/login', validateUserLogin, async (req, res, next) => {
  try {
    const { email, password } = req.body;

    console.log(`🔐 Login attempt for: ${email}`);

    // Check for user and include password
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      console.log(`❌ User not found: ${email}`);
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    console.log(`👤 User found: ${user.name} (${user.role})`);

    // Check if account is locked
    if (user.isLocked) {
      console.log(`🔒 Account locked: ${email}`);
      return res.status(401).json({
        success: false,
        message: 'Account is temporarily locked due to too many failed login attempts'
      });
    }

    // Check if account is active
    if (!user.isActive) {
      console.log(`⛔ Account inactive: ${email}`);
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated. Please contact administrator.'
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    console.log(`🔑 Password match for ${email}: ${isMatch ? 'YES' : 'NO'}`);

    if (!isMatch) {
      // Increment login attempts
      await user.incLoginAttempts();
      console.log(`❌ Login failed for: ${email}`);

      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Reset login attempts on successful login
    if (user.loginAttempts > 0) {
      await user.resetLoginAttempts();
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    console.log(`✅ Login successful for: ${email}`);

    // Generate token
    const token = generateToken(user._id);

    // Remove password from response
    user.password = undefined;

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        organization: user.organization,
        isActive: user.isActive,
        isVerified: user.isVerified,
        lastLogin: user.lastLogin
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
router.get('/me', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        organization: user.organization,
        walletAddress: user.walletAddress,
        isActive: user.isActive,
        isVerified: user.isVerified,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
router.put('/profile', protect, async (req, res, next) => {
  try {
    const { name, organization, walletAddress } = req.body;

    const fieldsToUpdate = {};
    if (name) fieldsToUpdate.name = name;
    if (organization && (req.user.role === 'institution' || req.user.role === 'verifier')) {
      fieldsToUpdate.organization = organization;
    }
    if (walletAddress) {
      // Validate Ethereum address format
      if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid wallet address format'
        });
      }
      fieldsToUpdate.walletAddress = walletAddress;
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      fieldsToUpdate,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        organization: user.organization,
        walletAddress: user.walletAddress,
        isActive: user.isActive,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
router.put('/change-password', protect, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide current password and new password'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long'
      });
    }

    // Get user with password
    const user = await User.findById(req.user.id).select('+password');

    // Check current password
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Logout user (client-side token removal)
// @route   POST /api/auth/logout
// @access  Private
router.post('/logout', protect, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
});

// @desc    Get user stats (for admin)
// @route   GET /api/auth/stats
// @access  Private (Admin only)
router.get('/stats', protect, async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }

    const stats = await User.getStats();

    res.status(200).json({
      success: true,
      stats
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Forgot Password - Request OTP
// @route   POST /api/auth/forgot-password
// @access  Public
router.post('/forgot-password', async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'There is no user with that email'
      });
    }

    // Generate 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Hash OTP
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(otp, salt, 1000, 64, 'sha512').toString('hex');

    // Store hashed OTP = salt:hash
    const otpToStore = `${salt}:${hash}`;

    // Set expiration (10 minutes)
    user.otp = otpToStore;
    user.otpExpire = Date.now() + 10 * 60 * 1000;
    user.otpAttempts = 0;

    await user.save({ validateBeforeSave: false });

    // Send Email
    try {
      await emailService.sendOTP(user.email, otp);

      res.status(200).json({
        success: true,
        message: 'OTP sent to email'
      });
    } catch (err) {
      user.otp = undefined;
      user.otpExpire = undefined;
      user.otpAttempts = undefined;
      await user.save({ validateBeforeSave: false });

      return res.status(500).json({
        success: false,
        message: 'Email could not be sent'
      });
    }
  } catch (error) {
    next(error);
  }
});

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
// @access  Public
router.post('/verify-otp', async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    // Get user with OTP field
    const user = await User.findOne({ email }).select('+otp');

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email'
      });
    }

    // Validate OTP exists and not expired
    if (!user.otp || user.otpExpire < Date.now()) {
      return res.status(400).json({
        success: false,
        message: 'OTP is invalid or has expired'
      });
    }

    // Check attempts
    if (user.otpAttempts >= 3) {
      // Clear OTP to force new request
      user.otp = undefined;
      user.otpExpire = undefined;
      await user.save({ validateBeforeSave: false });

      return res.status(400).json({
        success: false,
        message: 'Too many failed attempts. Please request a new OTP.'
      });
    }

    // Verify Hash
    const [salt, storedHash] = user.otp.split(':');
    const inputHash = crypto.pbkdf2Sync(otp, salt, 1000, 64, 'sha512').toString('hex');

    if (inputHash !== storedHash) {
      user.otpAttempts += 1;
      await user.save({ validateBeforeSave: false });

      return res.status(400).json({
        success: false,
        message: 'Invalid OTP'
      });
    }

    // OTP Verified
    // We can issue a temporary token valid for 5 minutes just for resetting password
    const resetToken = jwt.sign({ id: user._id, type: 'reset' }, process.env.JWT_SECRET, {
      expiresIn: '5m'
    });

    res.status(200).json({
      success: true,
      message: 'OTP Verified',
      resetToken
    });

  } catch (error) {
    next(error);
  }
});

// @desc    Reset Password
// @route   POST /api/auth/reset-password
// @access  Public
router.post('/reset-password', async (req, res, next) => {
  try {
    const { resetToken, password } = req.body;

    if (!resetToken) {
      return res.status(400).json({ success: false, message: 'Missing reset token' });
    }

    // Verify token
    try {
      const decoded = jwt.verify(resetToken, process.env.JWT_SECRET);

      if (decoded.type !== 'reset') {
        return res.status(400).json({ success: false, message: 'Invalid token type' });
      }

      const user = await User.findById(decoded.id);

      if (!user) {
        return res.status(400).json({ success: false, message: 'User not found' });
      }

      // Set new password
      user.password = password;

      // Clear OTP fields
      user.otp = undefined;
      user.otpExpire = undefined;
      user.otpAttempts = undefined;

      await user.save();

      // Send Success Email
      await emailService.sendPasswordResetSuccess(user.email);

      res.status(200).json({
        success: true,
        message: 'Password updated successfully'
      });

    } catch (err) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }

  } catch (error) {
    next(error);
  }
});

module.exports = router;