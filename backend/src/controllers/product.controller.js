const prisma = require('../config/database');
const { createError } = require('../middleware/errorHandler');
const { z } = require('zod');

const imageUrlSchema = z.string().refine((value) => {
  if (typeof value !== 'string' || !value.trim()) return false;
  if (value.startsWith('/uploads/')) return true;
  return z.string().url().safeParse(value).success;
}, 'Invalid URL');

const productSchema = z.object({
  name:          z.string().min(2).max(200),
  slug:          z.string().optional(),
  description:   z.string().optional(),
  shortDesc:     z.string().optional(),
  categoryId:    z.string().uuid(),
  price:         z.number().positive(),
  mrp:           z.number().positive(),
  unit:          z.string().default('kg'),
  stock:         z.number().int().min(0).default(0),
  lowStockAlert: z.number().int().min(0).default(10),
  sku:           z.string().optional(),
  isFeatured:    z.boolean().default(false),
  isActive:      z.boolean().default(true),
  tags:          z.array(z.string()).default([]),
  certifications: z.array(z.string()).default([]),
  nutritionInfo: z.any().optional(),
  images: z.array(z.object({
    url: imageUrlSchema,
    publicId: z.string().min(1),
    altText: z.string().optional(),
    isPrimary: z.boolean().optional(),
    sortOrder: z.number().int().min(0).optional(),
  })).optional(),
});

function generateSlug(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function normalizeUploadUrl(url) {
  if (!url) return url;
  const marker = '/uploads/';
  const idx = url.indexOf(marker);
  if (idx !== -1) return url.slice(idx);
  return url;
}

function normalizeProductMedia(product) {
  if (!product) return product;
  if (!Array.isArray(product.images)) return product;
  return {
    ...product,
    images: product.images.map((img) => ({
      ...img,
      url: normalizeUploadUrl(img.url),
    })),
  };
}

function normalizeOptionalSku(sku) {
  if (typeof sku !== 'string') return sku;
  const trimmed = sku.trim();
  return trimmed.length ? trimmed : undefined;
}

exports.listProducts = async (req, res, next) => {
  try {
    const {
      page = 1, limit = 20,
      category, minPrice, maxPrice,
      isFeatured,
      sort = 'createdAt', order = 'desc',
      tags,
    } = req.query;

    const where = { isActive: true };
    if (category)   where.category = { slug: category };
    if (isFeatured !== undefined) where.isFeatured = isFeatured === 'true';
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = Number(minPrice);
      if (maxPrice) where.price.lte = Number(maxPrice);
    }
    if (tags) {
      where.tags = { hasSome: tags.split(',') };
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { [sort]: order },
        include: {
          category: { select: { name: true, slug: true } },
          images: { where: { isPrimary: true }, take: 1 },
          _count: { select: { reviews: true } },
        },
      }),
      prisma.product.count({ where }),
    ]);

    res.json({
      success: true,
      data: products.map(normalizeProductMedia),
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.getFeatured = async (req, res, next) => {
  try {
    const products = await prisma.product.findMany({
      where: { isFeatured: true, isActive: true },
      take: 8,
      include: {
        category: { select: { name: true, slug: true } },
        images: { where: { isPrimary: true }, take: 1 },
      },
    });
    res.json({ success: true, data: products.map(normalizeProductMedia) });
  } catch (err) {
    next(err);
  }
};

exports.searchProducts = async (req, res, next) => {
  try {
    const { q, limit = 10 } = req.query;
    if (!q || q.length < 2) return res.json({ success: true, data: [] });

    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
          { tags: { hasSome: [q.toLowerCase()] } },
        ],
      },
      take: Number(limit),
      include: { images: { where: { isPrimary: true }, take: 1 } },
    });
    res.json({ success: true, data: products.map(normalizeProductMedia) });
  } catch (err) {
    next(err);
  }
};

exports.getProduct = async (req, res, next) => {
  try {
    const product = await prisma.product.findUnique({
      where: { slug: req.params.slug },
      include: {
        category: true,
        images: { orderBy: { sortOrder: 'asc' } },
        reviews: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: { user: { select: { name: true, avatarUrl: true } } },
        },
        _count: { select: { reviews: true } },
      },
    });
    if (!product || !product.isActive) throw createError('Product not found', 404);
    res.json({ success: true, data: normalizeProductMedia(product) });
  } catch (err) {
    next(err);
  }
};

exports.getProductById = async (req, res, next) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
      include: {
        category: true,
        images: { orderBy: { sortOrder: 'asc' } },
        reviews: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: { user: { select: { name: true, avatarUrl: true } } },
        },
        _count: { select: { reviews: true } },
      },
    });
    if (!product || !product.isActive) throw createError('Product not found', 404);
    res.json({ success: true, data: normalizeProductMedia(product) });
  } catch (err) {
    next(err);
  }
};

exports.createProduct = async (req, res, next) => {
  try {
    const data = productSchema.parse(req.body);
    if (!data.slug) data.slug = generateSlug(data.name);
    data.sku = normalizeOptionalSku(data.sku);

    const images = Array.isArray(data.images) ? data.images : [];
    delete data.images;

    const normalizedImages = images.map((img, idx) => ({
      url: img.url,
      publicId: img.publicId,
      altText: img.altText || data.name,
      isPrimary: idx === 0 ? true : Boolean(img.isPrimary),
      sortOrder: img.sortOrder ?? idx,
    }));

    const product = await prisma.product.create({
      data: {
        ...data,
        images: normalizedImages.length ? { create: normalizedImages } : undefined,
      },
      include: { images: true },
    });
    res.status(201).json({ success: true, data: normalizeProductMedia(product) });
  } catch (err) {
    next(err);
  }
};

exports.updateProduct = async (req, res, next) => {
  try {
    const data = productSchema.partial().parse(req.body);

    const normalizedSku = normalizeOptionalSku(data.sku);
    if (normalizedSku === undefined) {
      delete data.sku;
    } else {
      data.sku = normalizedSku;
    }

    const hasImages = Array.isArray(data.images);
    const images = hasImages ? data.images : [];
    delete data.images;

    const normalizedImages = images.map((img, idx) => ({
      url: img.url,
      publicId: img.publicId,
      altText: img.altText || data.name,
      isPrimary: idx === 0 ? true : Boolean(img.isPrimary),
      sortOrder: img.sortOrder ?? idx,
    }));

    const product = await prisma.product.update({
      where: { id: req.params.id },
      data: {
        ...data,
        images: hasImages
          ? {
              deleteMany: {},
              create: normalizedImages,
            }
          : undefined,
      },
      include: { images: true },
    });
    res.json({ success: true, data: normalizeProductMedia(product) });
  } catch (err) {
    next(err);
  }
};

exports.deleteProduct = async (req, res, next) => {
  try {
    // Soft delete
    await prisma.product.update({
      where: { id: req.params.id },
      data: { isActive: false },
    });
    res.json({ success: true, message: 'Product deactivated' });
  } catch (err) {
    next(err);
  }
};

exports.updateStock = async (req, res, next) => {
  try {
    const { stock } = z.object({ stock: z.number().int().min(0) }).parse(req.body);
    const product = await prisma.product.update({
      where: { id: req.params.id },
      data: { stock },
    });
    res.json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
};
