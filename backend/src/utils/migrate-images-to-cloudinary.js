import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import prisma from '../lib/prisma.js';
import { uploadToCloudinary } from '../config/cloudinary.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const UPLOAD_ROOT = path.join(__dirname, '..', '..', 'uploads');
const DEFAULT_FOLDER = process.env.CLOUDINARY_MIGRATION_FOLDER || 'manufact/products/migrated';
const SHOULD_DELETE_LOCAL = process.env.DELETE_LOCAL_AFTER_MIGRATION === 'true';

function extractRelativePathFromUrl(url) {
  if (!url || typeof url !== 'string') return null;
  const marker = '/uploads/';
  const idx = url.indexOf(marker);
  if (idx === -1) return null;

  return decodeURIComponent(url.slice(idx + marker.length)).replace(/^\/+/, '');
}

function resolveLocalAbsolutePath(image) {
  const fromUrl = extractRelativePathFromUrl(image.url);
  const relative = fromUrl || (image.publicId ? String(image.publicId).replace(/^\/+/, '') : null);
  if (!relative) return null;
  if (relative.includes('..')) return null;

  return path.join(UPLOAD_ROOT, relative.split('/').join(path.sep));
}

async function main() {
  console.log('Starting local -> Cloudinary image migration...');

  const images = await prisma.productImage.findMany({
    where: {
      OR: [
        { url: { startsWith: '/uploads/' } },
        { url: { contains: '/uploads/' } },
      ],
    },
    select: {
      id: true,
      productId: true,
      url: true,
      publicId: true,
    },
  });

  if (!images.length) {
    console.log('No legacy local images found. Nothing to migrate.');
    return;
  }

  let migrated = 0;
  let skipped = 0;
  let failed = 0;

  for (const image of images) {
    const absolutePath = resolveLocalAbsolutePath(image);

    if (!absolutePath || !fs.existsSync(absolutePath)) {
      skipped += 1;
      console.log(`[SKIP] ${image.id} - local file not found`);
      continue;
    }

    try {
      const buffer = fs.readFileSync(absolutePath);
      const upload = await uploadToCloudinary(buffer, {
        folder: DEFAULT_FOLDER,
        resource_type: 'image',
      });

      await prisma.productImage.update({
        where: { id: image.id },
        data: {
          url: upload.secure_url,
          publicId: upload.public_id,
        },
      });

      if (SHOULD_DELETE_LOCAL) {
        fs.unlinkSync(absolutePath);
      }

      migrated += 1;
      console.log(`[OK] ${image.id} -> ${upload.public_id}`);
    } catch (err) {
      failed += 1;
      console.error(`[FAIL] ${image.id}`, err.message);
    }
  }

  console.log('Migration complete.');
  console.log(`Migrated: ${migrated}`);
  console.log(`Skipped: ${skipped}`);
  console.log(`Failed: ${failed}`);
  console.log(`Delete local after migration: ${SHOULD_DELETE_LOCAL}`);
}

main()
  .catch((err) => {
    console.error('Migration aborted:', err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
