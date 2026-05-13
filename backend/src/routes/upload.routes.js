import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { authenticate, authorize } from '../middleware/auth.js';
import * as uploadController from '../controllers/upload.controller.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

function sanitizeFolder(folder = 'products') {
  const cleaned = String(folder)
    .replace(/[^a-zA-Z0-9/_-]/g, '')
    .replace(/\/{2,}/g, '/')
    .replace(/^\/+|\/+$/g, '');
  return cleaned || 'manufact/products';
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed'));
    }
    cb(null, true);
  },
});

const designStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '..', '..', 'uploads', 'designs');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
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
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedExts = ['.pdf', '.cdr', '.psd', '.jpeg', '.jpg', '.png'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowedExts.includes(ext)) {
      return cb(new Error('Format not allowed. Allowed: PDF, CDR, PSD, JPEG, PNG'));
    }
    cb(null, true);
  }
});

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

router.post('/customization',
  authenticate,
  (req, res, next) => { req.uploadFolder = 'photowala/customizations'; next(); },
  upload.single('image'),
  uploadController.uploadImage
);

router.post('/design',
  authenticate,
  uploadDesign.single('design'),
  uploadController.uploadDesignLocal
);

export default router;
