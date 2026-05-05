const express = require('express');
const multer = require('multer');
const path = require('path');
const { optionalAuth } = require('../middleware/auth');
const serviceRequestController = require('../controllers/serviceRequest.controller');

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase();
    const allowed = ['.cdr', '.zip', '.pdf'];
    if (!allowed.includes(ext)) {
      return cb(new Error('Only .cdr, .zip, or .pdf files are allowed'));
    }
    cb(null, true);
  },
});

router.post('/', optionalAuth, upload.single('designFile'), serviceRequestController.createServiceRequest);

module.exports = router;
