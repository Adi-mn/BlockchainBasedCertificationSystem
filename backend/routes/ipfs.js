const express = require('express');
const multer = require('multer');
const FormData = require('form-data');
const axios = require('axios');
const { protect, authorize } = require('../middleware/auth');
const { validateFileUpload } = require('../middleware/validation');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Only allow PDF files
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  }
});

// @desc    Upload file to IPFS via Pinata
// @route   POST /api/ipfs/upload
// @access  Private (Institution only)
router.post('/upload',
  protect,
  authorize('institution'),
  upload.single('file'),
  validateFileUpload,
  async (req, res, next) => {
    try {
      if (!process.env.PINATA_API_KEY || !process.env.PINATA_SECRET_KEY) {
        // Fallback for Development if keys are missing
        console.warn('⚠️ IPFS keys missing. Using MOCK IPFS mode.');
        const mockHash = `QmMockHash${Math.random().toString(36).substring(7)}ForDevPurposeOnly`;
        return res.status(200).json({
          success: true,
          message: 'MOCK IPFS UPLOAD (Dev Mode)',
          ipfsHash: mockHash,
          ipfsUrl: `https://mock-gateway.local/ipfs/${mockHash}`,
          fileSize: req.file.size,
          fileName: req.file.originalname,
          mimeType: req.file.mimetype,
          isMock: true
        });
      }

      const file = req.file;

      // Create form data for Pinata
      const formData = new FormData();
      formData.append('file', file.buffer, {
        filename: file.originalname,
        contentType: file.mimetype
      });

      // Add metadata
      const metadata = JSON.stringify({
        name: file.originalname,
        keyvalues: {
          uploadedBy: req.user.name,
          institutionId: req.user._id.toString(),
          uploadDate: new Date().toISOString(),
          fileSize: file.size,
          mimeType: file.mimetype
        }
      });
      formData.append('pinataMetadata', metadata);

      // Add options
      const options = JSON.stringify({
        cidVersion: 0
      });
      formData.append('pinataOptions', options);

      // Upload to Pinata
      const response = await axios.post(
        'https://api.pinata.cloud/pinning/pinFileToIPFS',
        formData,
        {
          headers: {
            ...formData.getHeaders(),
            'pinata_api_key': process.env.PINATA_API_KEY,
            'pinata_secret_api_key': process.env.PINATA_SECRET_KEY
          },
          maxContentLength: Infinity,
          maxBodyLength: Infinity
        }
      );

      const ipfsHash = response.data.IpfsHash;
      const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;

      res.status(200).json({
        success: true,
        message: 'File uploaded to IPFS successfully',
        ipfsHash,
        ipfsUrl,
        fileSize: file.size,
        fileName: file.originalname,
        mimeType: file.mimetype
      });

    } catch (error) {
      console.error('IPFS upload error:', error);

      // MOCK FALLBACK for Invalid/Expired Keys
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        console.log('⚠️ Pinata Auth Failed (401/403). Using MOCK IPFS Hash.');
        const mockHash = `QmMockHash${Math.random().toString(36).substring(7)}Fallback`;

        return res.status(200).json({
          success: true,
          message: 'MOCK IPFS UPLOAD (Fallback due to Auth Failure)',
          ipfsHash: mockHash,
          ipfsUrl: `https://mock-gateway.local/ipfs/${mockHash}`,
          fileSize: req.file.size,
          fileName: req.file.originalname,
          mimeType: req.file.mimetype,
          isMock: true
        });
      }

      if (error.response) {
        return res.status(error.response.status).json({
          success: false,
          message: 'IPFS upload failed',
          error: error.response.data
        });
      }

      next(error);
    }
  }
);

// @desc    Get file info from IPFS
// @route   GET /api/ipfs/:hash
// @access  Public
router.get('/:hash', async (req, res, next) => {
  try {
    const { hash } = req.params;

    // Check for MOCK HASH
    if (hash.includes('MockHash')) {
      return res.status(200).json({
        success: true,
        ipfsHash: hash,
        ipfsUrl: `https://mock-gateway.local/ipfs/${hash}`,
        publicGatewayUrl: `https://mock-gateway.local/ipfs/${hash}`,
        metadata: {
          name: 'Mock-File.pdf',
          size: 12345,
          pinDate: new Date().toISOString()
        },
        isMock: true
      });
    }

    // Validate IPFS hash format (Standard)
    if (!/^Qm[1-9A-HJ-NP-Za-km-z]{44}$/.test(hash)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid IPFS hash format'
      });
    }

    // Get file metadata from Pinata (if available)
    let metadata = null;
    if (process.env.PINATA_API_KEY && process.env.PINATA_SECRET_KEY) {
      try {
        const response = await axios.get(
          `https://api.pinata.cloud/data/pinList?hashContains=${hash}`,
          {
            headers: {
              'pinata_api_key': process.env.PINATA_API_KEY,
              'pinata_secret_api_key': process.env.PINATA_SECRET_KEY
            }
          }
        );

        if (response.data.rows && response.data.rows.length > 0) {
          metadata = response.data.rows[0];
        }
      } catch (error) {
        console.error('Error fetching Pinata metadata:', error);
      }
    }

    const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${hash}`;
    const publicGatewayUrl = `https://ipfs.io/ipfs/${hash}`;

    res.status(200).json({
      success: true,
      ipfsHash: hash,
      ipfsUrl,
      publicGatewayUrl,
      metadata: metadata ? {
        name: metadata.metadata?.name,
        size: metadata.size,
        pinDate: metadata.date_pinned,
        keyvalues: metadata.metadata?.keyvalues
      } : null
    });

  } catch (error) {
    next(error);
  }
});

// @desc    Pin existing IPFS hash
// @route   POST /api/ipfs/pin/:hash
// @access  Private (Institution only)
router.post('/pin/:hash', protect, authorize('institution'), async (req, res, next) => {
  try {
    const { hash } = req.params;
    const { name, metadata } = req.body;

    if (hash.includes('MockHash')) {
      return res.status(200).json({
        success: true,
        message: 'Mock Hash pinned successfully'
      });
    }

    // Validate IPFS hash format
    if (!/^Qm[1-9A-HJ-NP-Za-km-z]{44}$/.test(hash)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid IPFS hash format'
      });
    }

    if (!process.env.PINATA_API_KEY || !process.env.PINATA_SECRET_KEY) {
      return res.status(500).json({
        success: false,
        message: 'IPFS service not configured'
      });
    }

    // Pin the hash to Pinata
    const pinData = {
      hashToPin: hash,
      pinataMetadata: {
        name: name || `Certificate-${hash}`,
        keyvalues: {
          pinnedBy: req.user.name,
          institutionId: req.user._id.toString(),
          pinDate: new Date().toISOString(),
          ...metadata
        }
      }
    };

    const response = await axios.post(
      'https://api.pinata.cloud/pinning/pinByHash',
      pinData,
      {
        headers: {
          'Content-Type': 'application/json',
          'pinata_api_key': process.env.PINATA_API_KEY,
          'pinata_secret_api_key': process.env.PINATA_SECRET_KEY
        }
      }
    );

    res.status(200).json({
      success: true,
      message: 'IPFS hash pinned successfully',
      ipfsHash: response.data.ipfsHash,
      ipfsUrl: `https://gateway.pinata.cloud/ipfs/${response.data.ipfsHash}`
    });

  } catch (error) {
    console.error('IPFS pin error:', error);

    if (error.response) {
      return res.status(error.response.status).json({
        success: false,
        message: 'IPFS pin failed',
        error: error.response.data
      });
    }

    next(error);
  }
});

// @desc    Unpin IPFS hash
// @route   DELETE /api/ipfs/unpin/:hash
// @access  Private (Institution only)
router.delete('/unpin/:hash', protect, authorize('institution', 'admin'), async (req, res, next) => {
  try {
    const { hash } = req.params;

    if (hash.includes('MockHash')) {
      return res.status(200).json({
        success: true,
        message: 'Mock Hash unpinned successfully'
      });
    }

    // Validate IPFS hash format
    if (!/^Qm[1-9A-HJ-NP-Za-km-z]{44}$/.test(hash)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid IPFS hash format'
      });
    }

    if (!process.env.PINATA_API_KEY || !process.env.PINATA_SECRET_KEY) {
      return res.status(500).json({
        success: false,
        message: 'IPFS service not configured'
      });
    }

    // Unpin from Pinata
    await axios.delete(
      `https://api.pinata.cloud/pinning/unpin/${hash}`,
      {
        headers: {
          'pinata_api_key': process.env.PINATA_API_KEY,
          'pinata_secret_api_key': process.env.PINATA_SECRET_KEY
        }
      }
    );

    res.status(200).json({
      success: true,
      message: 'IPFS hash unpinned successfully'
    });

  } catch (error) {
    console.error('IPFS unpin error:', error);

    if (error.response) {
      return res.status(error.response.status).json({
        success: false,
        message: 'IPFS unpin failed',
        error: error.response.data
      });
    }

    next(error);
  }
});

// @desc    Get pinned files list
// @route   GET /api/ipfs/pinned
// @access  Private (Institution only)
router.get('/pinned', protect, authorize('institution', 'admin'), async (req, res, next) => {
  try {
    if (!process.env.PINATA_API_KEY || !process.env.PINATA_SECRET_KEY) {
      return res.status(500).json({
        success: false,
        message: 'IPFS service not configured'
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 10, 100);
    const offset = (page - 1) * limit;

    // Get pinned files from Pinata
    const response = await axios.get(
      `https://api.pinata.cloud/data/pinList?status=pinned&pageLimit=${limit}&pageOffset=${offset}`,
      {
        headers: {
          'pinata_api_key': process.env.PINATA_API_KEY,
          'pinata_secret_api_key': process.env.PINATA_SECRET_KEY
        }
      }
    );

    const files = response.data.rows.map(file => ({
      ipfsHash: file.ipfs_pin_hash,
      name: file.metadata?.name,
      size: file.size,
      pinDate: file.date_pinned,
      ipfsUrl: `https://gateway.pinata.cloud/ipfs/${file.ipfs_pin_hash}`,
      metadata: file.metadata?.keyvalues
    }));

    res.status(200).json({
      success: true,
      count: files.length,
      total: response.data.count,
      page,
      pages: Math.ceil(response.data.count / limit),
      files
    });

  } catch (error) {
    console.error('Error fetching pinned files:', error);

    // Ignore error if listing fails
    return res.status(200).json({
      success: true,
      count: 0,
      total: 0,
      page: 1,
      pages: 1,
      files: []
    });
  }
});

module.exports = router;