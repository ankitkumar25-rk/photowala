const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { authenticate, authorize } = require('../middleware/auth');
const uploadController = require('../controllers/upload.controller');

function sanitizeFolder(folder = 'products') {
  const cleaned = String(folder)
    .replace(/[^a-zA-Z0-9/_-]/g, '')
    .replace(/\/{2,}/g, '/')
    .replace(/^\/+|\/+$/g, '');
  return cleaned || 'manufact/products';
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed'));
    }
    cb(null, true);
  },
});

// Disk storage for design files (PDF, CDR, PSD, etc.)
const designStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '..', '..', 'uploads', 'designs');
    if (!require('fs').existsSync(dir)) {
      require('fs').mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'design-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const uploadDesign = multer({
  storage: designStorage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (req, file, cb) => {
    const allowedExts = ['.pdf', '.cdr', '.psd', '.jpeg', '.jpg', '.png'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowedExts.includes(ext)) {
      return cb(new Error('Format not allowed. Allowed: PDF, CDR, PSD, JPEG, PNG'));
    }
    cb(null, true);
  }
});

// Normalize folder query for downstream controller use.
router.use((req, res, next) => {
  req.uploadFolder = sanitizeFolder(req.query.folder || 'manufact/products');
  next();
});

// Admin-only product image routes
router.post('/image',
  authenticate,
  authorize('ADMIN', 'SUPER_ADMIN'),
  upload.single('image'),
  uploadController.uploadImage
);

router.post('/images',
  authenticate,
  authorize('ADMIN', 'SUPER_ADMIN'),
  upload.array('images', 10),
  uploadController.uploadImages
);

router.delete('/image/:publicId',
  authenticate,
  authorize('ADMIN', 'SUPER_ADMIN'),
  uploadController.deleteImage
);

// Customer route: upload a customization logo/image (authenticated users only)
router.post('/customization',
  authenticate,
  (req, res, next) => { req.uploadFolder = 'photowala/customizations'; next(); },
  upload.single('image'),
  uploadController.uploadImage
);

// Local design file upload (for Digital Printing)
router.post('/design',
  authenticate,
  uploadDesign.single('design'),
  uploadController.uploadDesignLocal
);

module.exports = router;
