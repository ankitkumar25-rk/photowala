const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure base upload directory exists
const UPLOAD_BASE = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(UPLOAD_BASE)) {
    fs.mkdirSync(UPLOAD_BASE, { recursive: true });
}

// Allowed extensions
const ALLOWED_EXT = [
    '.pdf', '.cdr', '.psd', '.jpg', '.jpeg', '.png', '.webp', 
    '.dxf', '.dwg', '.stl', '.step', '.csv', '.xlsx'
];

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Determine subfolder based on service (e.g., from route or body)
        // Default to 'general' if not specified
        const service = req.body.serviceType || req.params.serviceType || 'general';
        const dest = path.join(UPLOAD_BASE, service.toLowerCase());
        
        if (!fs.existsSync(dest)) {
            fs.mkdirSync(dest, { recursive: true });
        }
        cb(null, dest);
    },
    filename: (req, file, cb) => {
        const safeName = file.originalname.replace(/[^a-z0-9.]/gi, '_').toLowerCase();
        const timestamp = Date.now();
        const random = Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        const nameWithoutExt = path.basename(safeName, ext);
        
        cb(null, `${nameWithoutExt}_${timestamp}_${random}${ext}`);
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 100 * 1024 * 1024 // 100MB
    },
    fileFilter: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        if (ALLOWED_EXT.includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error(`File type ${ext} is not allowed.`));
        }
    }
});

/**
 * handleUpload wrapper to catch Multer errors
 */
const handleUpload = (field) => (req, res, next) => {
    const uploadMiddleware = upload.single(field);
    
    uploadMiddleware(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            return res.status(400).json({
                success: false,
                message: 'Upload error',
                error: err.message
            });
        } else if (err) {
            return res.status(400).json({
                success: false,
                message: err.message
            });
        }
        next();
    });
};

module.exports = { handleUpload };
