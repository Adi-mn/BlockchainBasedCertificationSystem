const { body, param, query, validationResult } = require('express-validator');

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// User validation rules
const validateUserRegistration = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),

  body('email')
    .isEmail()
    .withMessage('Please provide a valid email'),

  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),

  body('role')
    .isIn(['admin', 'institution', 'student', 'verifier'])
    .withMessage('Invalid role'),

  body('organization')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Organization name must be between 2 and 200 characters'),

  handleValidationErrors
];

const validateUserLogin = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email'),

  body('password')
    .notEmpty()
    .withMessage('Password is required'),

  handleValidationErrors
];

// Certificate validation rules
const validateCertificateCreation = [
  body('studentName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Student name must be between 2 and 100 characters'),

  body('studentEmail')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid student email'),

  body('certificateType')
    .isIn(['Degree', 'Diploma', 'Certificate', 'Course Completion', 'Professional Certification'])
    .withMessage('Invalid certificate type'),

  body('courseName')
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Course name must be between 2 and 200 characters'),

  body('issueDate')
    .isISO8601()
    .withMessage('Please provide a valid issue date'),

  body('expiryDate')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid expiry date')
    .custom((value, { req }) => {
      if (value && new Date(value) <= new Date(req.body.issueDate)) {
        throw new Error('Expiry date must be after issue date');
      }
      return true;
    }),

  body('grade')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Grade cannot exceed 50 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),

  body('ipfsHash')
    .notEmpty()
    .withMessage('IPFS hash is required')
    .matches(/^Qm[1-9A-HJ-NP-Za-km-z]{44}$/)
    .withMessage('Invalid IPFS hash format'),

  body('issuerAddress')
    .matches(/^0x[a-fA-F0-9]{40}$/)
    .withMessage('Invalid Ethereum address format'),

  handleValidationErrors
];

// Parameter validation
const validateObjectId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid ID format'),

  handleValidationErrors
];

const validateCertificateId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid certificate ID format'),

  handleValidationErrors
];

// Query validation
const validateSearchQuery = [
  query('q')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search query must be between 1 and 100 characters'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50'),

  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),

  handleValidationErrors
];

// File validation
const validateFileUpload = (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'No file uploaded'
    });
  }

  // Check file type
  if (req.file.mimetype !== 'application/pdf') {
    return res.status(400).json({
      success: false,
      message: 'Only PDF files are allowed'
    });
  }

  // Check file size (10MB limit)
  if (req.file.size > 10 * 1024 * 1024) {
    return res.status(400).json({
      success: false,
      message: 'File size cannot exceed 10MB'
    });
  }

  next();
};

// Blockchain validation
const validateBlockchainData = [
  body('transactionHash')
    .optional()
    .matches(/^0x[a-fA-F0-9]{64}$/)
    .withMessage('Invalid transaction hash format'),

  body('blockchainId')
    .optional()
    .isNumeric()
    .withMessage('Blockchain ID must be numeric'),

  handleValidationErrors
];

// Admin validation
const validateUserStatusUpdate = [
  body('isActive')
    .isBoolean()
    .withMessage('isActive must be a boolean value'),

  handleValidationErrors
];

// Verification log validation
const validateVerificationLog = [
  body('verificationMethod')
    .isIn(['qr_scan', 'manual_search', 'direct_link', 'api_call'])
    .withMessage('Invalid verification method'),

  body('verificationResult')
    .isIn(['valid', 'invalid', 'expired', 'revoked', 'not_found'])
    .withMessage('Invalid verification result'),

  body('responseTime')
    .isNumeric()
    .withMessage('Response time must be numeric'),

  handleValidationErrors
];

module.exports = {
  validateUserRegistration,
  validateUserLogin,
  validateCertificateCreation,
  validateObjectId,
  validateCertificateId,
  validateSearchQuery,
  validateFileUpload,
  validateBlockchainData,
  validateUserStatusUpdate,
  validateVerificationLog,
  handleValidationErrors
};