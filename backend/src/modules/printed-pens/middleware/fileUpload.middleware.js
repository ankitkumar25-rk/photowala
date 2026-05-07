const multer = require('multer');

// Configure multer for memory storage, upload to Cloudinary happens in controller/service
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/vnd.adobe.photoshop', // PSD
    'application/postscript', // CDR fallback
    'application/x-cdr', // CDR fallback
  ];
  
  if (allowedMimeTypes.includes(file.mimetype) || file.originalname.toLowerCase().endsWith('.cdr') || file.originalname.toLowerCase().endsWith('.psd')) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, CDR, PSD, JPEG, PNG are allowed.'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB
  },
  fileFilter: fileFilter,
});

module.exports = upload;
