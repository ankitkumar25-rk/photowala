const multer = require('multer');
const { uploadAutoToCloudinary } = require('../config/cloudinary');
const { createError } = require('./errorHandler');

// Use memory storage for buffer-based Cloudinary upload
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow various formats including vector and CAD
    const allowedExtensions = [
      '.pdf', '.cdr', '.psd', '.jpeg', '.jpg', '.png', 
      '.stl', '.step', '.dxf', '.dwg', '.plt', '.csv', '.xlsx'
    ];
    const ext = file.originalname.toLowerCase().substring(file.originalname.lastIndexOf('.'));
    
    if (allowedExtensions.includes(ext)) {
      cb(null, true);
    } else {
      cb(createError(`File format ${ext} not allowed.`, 400));
    }
  }
});

/**
 * Middleware to upload to Cloudinary after multer processing
 * @param {string} folder - Cloudinary folder path
 */
const uploadToCloudinary = (folder) => async (req, res, next) => {
  if (!req.file) return next();

  try {
    const result = await uploadAutoToCloudinary(req.file.buffer, {
      folder,
      public_id: `${Date.now()}-${req.file.originalname.replace(/[^a-zA-Z0-9]/g, '_')}`
    });
    
    req.file.cloudinary = result;
    next();
  } catch (error) {
    next(createError('Cloudinary upload failed: ' + error.message, 500));
  }
};

module.exports = { upload, uploadToCloudinary };
