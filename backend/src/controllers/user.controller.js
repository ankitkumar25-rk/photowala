const prisma = require('../config/database');
const { createError } = require('../middleware/errorHandler');
const { z } = require('zod');
const bcrypt = require('bcryptjs');

exports.getProfile = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, name: true, email: true, phone: true, avatarUrl: true, role: true, createdAt: true },
    });
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { name, phone } = z.object({ name: z.string().min(2).optional(), phone: z.string().optional() }).parse(req.body);
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { name, phone },
      select: { id: true, name: true, email: true, phone: true },
    });
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = z.object({
      currentPassword: z.string().min(1),
      newPassword: z.string().min(8),
    }).parse(req.body);

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user.passwordHash) throw createError('Password change not available for OAuth accounts', 400);

    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) throw createError('Current password is incorrect', 401);

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({ where: { id: req.user.id }, data: { passwordHash } });

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (err) {
    next(err);
  }
};

const addressSchema = z.object({
  label: z.string().default('Home'),
  fullName: z.string().min(2),
  phone: z.string().min(10),
  line1: z.string().min(5),
  line2: z.string().optional(),
  city: z.string().min(2),
  state: z.string().min(2),
  pincode: z.string().length(6),
  isDefault: z.boolean().default(false),
});

exports.getAddresses = async (req, res, next) => {
  try {
    const addresses = await prisma.address.findMany({
      where: { userId: req.user.id },
      orderBy: { isDefault: 'desc' },
    });
    res.json({ success: true, data: addresses });
  } catch (err) {
    next(err);
  }
};

exports.addAddress = async (req, res, next) => {
  try {
    const data = addressSchema.parse(req.body);

    if (data.isDefault) {
      await prisma.address.updateMany({
        where: { userId: req.user.id },
        data: { isDefault: false },
      });
    }

    const address = await prisma.address.create({
      data: { ...data, userId: req.user.id },
    });
    res.status(201).json({ success: true, data: address });
  } catch (err) {
    next(err);
  }
};

exports.updateAddress = async (req, res, next) => {
  try {
    const data = addressSchema.partial().parse(req.body);
    const address = await prisma.address.update({
      where: { id: req.params.id, userId: req.user.id },
      data,
    });
    res.json({ success: true, data: address });
  } catch (err) {
    next(err);
  }
};

exports.deleteAddress = async (req, res, next) => {
  try {
    await prisma.address.delete({ where: { id: req.params.id, userId: req.user.id } });
    res.json({ success: true, message: 'Address deleted' });
  } catch (err) {
    next(err);
  }
};

exports.setDefaultAddress = async (req, res, next) => {
  try {
    await prisma.$transaction([
      prisma.address.updateMany({ where: { userId: req.user.id }, data: { isDefault: false } }),
      prisma.address.update({ where: { id: req.params.id, userId: req.user.id }, data: { isDefault: true } }),
    ]);
    res.json({ success: true, message: 'Default address updated' });
  } catch (err) {
    next(err);
  }
};

exports.getWishlist = async (req, res, next) => {
  try {
    const items = await prisma.wishlistItem.findMany({
      where: { userId: req.user.id },
      include: {
        product: {
          include: { images: { where: { isPrimary: true }, take: 1 } },
        },
      },
    });
    res.json({ success: true, data: items });
  } catch (err) {
    next(err);
  }
};

exports.addToWishlist = async (req, res, next) => {
  try {
    await prisma.wishlistItem.upsert({
      where: { userId_productId: { userId: req.user.id, productId: req.params.productId } },
      create: { userId: req.user.id, productId: req.params.productId },
      update: {},
    });
    res.json({ success: true, message: 'Added to wishlist' });
  } catch (err) {
    next(err);
  }
};

exports.removeFromWishlist = async (req, res, next) => {
  try {
    await prisma.wishlistItem.deleteMany({
      where: { userId: req.user.id, productId: req.params.productId },
    });
    res.json({ success: true, message: 'Removed from wishlist' });
  } catch (err) {
    next(err);
  }
};

exports.addReview = async (req, res, next) => {
  try {
    const { productId, rating, title, body } = z.object({
      productId: z.string().uuid(),
      rating: z.number().int().min(1).max(5),
      title: z.string().optional(),
      body: z.string().optional(),
    }).parse(req.body);

    // Only allow review if user has ordered this product
    const hasOrdered = await prisma.orderItem.findFirst({
      where: {
        productId,
        order: { userId: req.user.id, status: 'DELIVERED' },
      },
    });

    const review = await prisma.review.upsert({
      where: { userId_productId: { userId: req.user.id, productId } },
      create: { userId: req.user.id, productId, rating, title, body, isVerified: !!hasOrdered },
      update: { rating, title, body },
    });

    res.status(201).json({ success: true, data: review });
  } catch (err) {
    next(err);
  }
};
