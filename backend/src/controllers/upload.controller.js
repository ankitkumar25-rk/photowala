const fs = require('fs');
const path = require('path');
const { createError } = require('../middleware/errorHandler');
const { uploadToCloudinary, deleteFromCloudinary } = require('../config/cloudinary');

const UPLOAD_ROOT = path.join(__dirname, '..', '..', 'uploads');

function extractCloudinaryErrorMessage(err) {
  return err?.error?.message || err?.message || 'Cloudinary operation failed';
}

exports.uploadImage = async (req, res, next) => {
  try {
    if (!req.file || !req.file.buffer) throw createError('No image file provided', 400);

    const folder = req.uploadFolder || 'manufact/products';
    const upload = await uploadToCloudinary(req.file.buffer, {
      folder,
      resource_type: 'image',
    });

    res.json({
      success: true,
      data: {
        url: upload.secure_url,
        publicId: upload.public_id,
      },
    });
  } catch (err) {
    next(createError(`Image upload failed: ${extractCloudinaryErrorMessage(err)}`, 500));
  }
};

exports.uploadImages = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) throw createError('No images provided', 400);

    const folder = req.uploadFolder || 'manufact/products';
    const uploads = await Promise.all(
      req.files.map((file) => uploadToCloudinary(file.buffer, {
        folder,
        resource_type: 'image',
      }))
    );

    res.json({
      success: true,
      data: uploads.map((item) => ({
        url: item.secure_url,
        publicId: item.public_id,
      })),
    });
  } catch (err) {
    next(createError(`Image upload failed: ${extractCloudinaryErrorMessage(err)}`, 500));
  }
};

exports.deleteImage = async (req, res, next) => {
  try {
    const { publicId } = req.params;
    const decoded = decodeURIComponent(publicId);

    // Cloudinary first (new uploads).
    const cloudinaryResult = await deleteFromCloudinary(decoded);

    // Backward compatibility for legacy local files.
    if (cloudinaryResult?.result === 'not found') {
      const safeRelativePath = decoded.replace(/\.{2,}/g, '');
      const absolutePath = path.join(UPLOAD_ROOT, safeRelativePath);
      if (fs.existsSync(absolutePath)) {
        fs.unlinkSync(absolutePath);
      }
    }

    res.json({ success: true, message: 'Image deleted' });
  } catch (err) {
    next(createError(`Image delete failed: ${extractCloudinaryErrorMessage(err)}`, 500));
  }
};

exports.uploadDesignLocal = async (req, res, next) => {
  try {
    if (!req.file) throw createError('No design file provided', 400);

    const relativePath = `designs/${req.file.filename}`;
    const url = `/uploads/${relativePath}`;

    res.json({
      success: true,
      data: {
        url,
        filename: req.file.filename,
        originalName: req.file.originalname
      },
    });
  } catch (err) {
    next(createError(`Design upload failed: ${err.message}`, 500));
  }
};
