const express = require('express');
const router = express.Router();
const multer = require('multer');
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

// Normalize folder query for downstream controller use.
router.use((req, res, next) => {
  req.uploadFolder = sanitizeFolder(req.query.folder || 'manufact/products');
  next();
});

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

module.exports = router;
