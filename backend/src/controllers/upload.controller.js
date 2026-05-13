import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createError } from '../middleware/errorHandler.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../config/cloudinary.js';
import asyncHandler from '../utils/asyncHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const UPLOAD_ROOT = path.join(__dirname, '..', '..', 'uploads');

function extractCloudinaryErrorMessage(err) {
  return err?.error?.message || err?.message || 'Cloudinary operation failed';
}

export const uploadImage = asyncHandler(async (req, res) => {
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
});

export const uploadImages = asyncHandler(async (req, res) => {
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
});

export const deleteImage = asyncHandler(async (req, res) => {
  const { publicId } = req.params;
  const decoded = decodeURIComponent(publicId);

  const cloudinaryResult = await deleteFromCloudinary(decoded);

  if (cloudinaryResult?.result === 'not found') {
    const safeRelativePath = decoded.replace(/\.{2,}/g, '');
    const absolutePath = path.join(UPLOAD_ROOT, safeRelativePath);
    if (fs.existsSync(absolutePath)) {
      fs.unlinkSync(absolutePath);
    }
  }

  res.json({ success: true, message: 'Image deleted' });
});

export const uploadDesignLocal = asyncHandler(async (req, res) => {
  if (!req.file) throw createError('No design file provided', 400);

  const relativePath = `designs/${req.file.filename}`;
  const baseUrl = process.env.PUBLIC_URL || `${req.protocol}://${req.get('host')}`;
  const url = `${baseUrl}/uploads/${relativePath}`;

  res.json({
    success: true,
    data: {
      url,
      filename: req.file.filename,
      originalName: req.file.originalname
    },
  });
});
