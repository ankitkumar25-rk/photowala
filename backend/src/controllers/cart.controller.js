const prisma = require('../config/database');
const { createError } = require('../middleware/errorHandler');
const { z } = require('zod');
const crypto = require('crypto');

exports.getCart = async (req, res, next) => {
  try {
    let cart;
    if (req.user) {
      cart = await prisma.cart.findUnique({
        where: { userId: req.user.id },
        include: {
          items: {
            include: { product: { include: { images: { where: { isPrimary: true }, take: 1 } } } },
          },
        },
      });
    } else {
      const sessionId = req.cookies?.cart_session;
      if (!sessionId) return res.json({ success: true, data: { items: [] } });
      cart = await prisma.cart.findUnique({
        where: { sessionId },
        include: {
          items: {
            include: { product: { include: { images: { where: { isPrimary: true }, take: 1 } } } },
          },
        },
      });
    }

    res.json({ success: true, data: cart || { items: [] } });
  } catch (err) {
    next(err);
  }
};

exports.addToCart = async (req, res, next) => {
  try {
    const { productId, quantity, customizationText, customizationImageUrl } = z.object({
      productId: z.string().uuid(),
      quantity: z.number().int().positive().default(1),
      customizationText: z.string().optional(),
      customizationImageUrl: z.string().url().optional(),
    }).parse(req.body);

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product || !product.isActive) throw createError('Product not found', 404);
    if (product.stock < quantity) throw createError('Insufficient stock', 400);

    let cartWhere;
    let cartIdent;

    if (req.user) {
      cartWhere = { userId: req.user.id };
      cartIdent = { userId: req.user.id };
    } else {
      let sessionId = req.cookies?.cart_session;
      if (!sessionId) {
        sessionId = crypto.randomUUID();
        res.cookie('cart_session', sessionId, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true });
      }
      cartWhere = { sessionId };
      cartIdent = { sessionId };
    }

    const cart = await prisma.cart.upsert({
      where: req.user ? { userId: req.user.id } : { sessionId: cartWhere.sessionId },
      create: cartIdent,
      update: {},
    });

    const existing = await prisma.cartItem.findUnique({
      where: { cartId_productId: { cartId: cart.id, productId } },
    });

    if (existing) {
      await prisma.cartItem.update({
        where: { cartId_productId: { cartId: cart.id, productId } },
        data: {
          quantity: { increment: quantity },
          // Update customization if newly provided
          ...(customizationText !== undefined && { customizationText }),
          ...(customizationImageUrl !== undefined && { customizationImageUrl }),
        },
      });
    } else {
      await prisma.cartItem.create({
        data: { cartId: cart.id, productId, quantity, price: product.price, customizationText, customizationImageUrl },
      });
    }

    res.json({ success: true, message: 'Added to cart' });
  } catch (err) {
    next(err);
  }
};

exports.updateCartItem = async (req, res, next) => {
  try {
    const { productId, quantity } = z.object({
      productId: z.string().uuid(),
      quantity: z.number().int().positive(),
    }).parse(req.body);

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (product.stock < quantity) throw createError('Insufficient stock', 400);

    const cartWhere = req.user
      ? { userId: req.user.id }
      : { sessionId: req.cookies?.cart_session };

    const cart = await prisma.cart.findUnique({ where: cartWhere });
    if (!cart) throw createError('Cart not found', 404);

    await prisma.cartItem.update({
      where: { cartId_productId: { cartId: cart.id, productId } },
      data: { quantity },
    });

    res.json({ success: true, message: 'Cart updated' });
  } catch (err) {
    next(err);
  }
};

exports.removeFromCart = async (req, res, next) => {
  try {
    const { productId } = z.object({ productId: z.string().uuid() }).parse(req.body);
    const cartWhere = req.user
      ? { userId: req.user.id }
      : { sessionId: req.cookies?.cart_session };

    const cart = await prisma.cart.findUnique({ where: cartWhere });
    if (!cart) return res.json({ success: true });

    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id, productId },
    });

    res.json({ success: true, message: 'Removed from cart' });
  } catch (err) {
    next(err);
  }
};

exports.clearCart = async (req, res, next) => {
  try {
    const cartWhere = req.user
      ? { userId: req.user.id }
      : { sessionId: req.cookies?.cart_session };

    const cart = await prisma.cart.findUnique({ where: cartWhere });
    if (cart) {
      await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    }
    res.json({ success: true, message: 'Cart cleared' });
  } catch (err) {
    next(err);
  }
};

exports.mergeCart = async (req, res, next) => {
  try {
    const sessionId = req.cookies?.cart_session;
    if (!sessionId) return res.json({ success: true, message: 'Nothing to merge' });

    await prisma.$transaction(async (tx) => {
      const guestCart = await tx.cart.findUnique({
        where: { sessionId },
        include: { items: true },
      });

      if (!guestCart || guestCart.items.length === 0) {
        return;
      }

      const userCart = await tx.cart.upsert({
        where: { userId: req.user.id },
        create: { userId: req.user.id },
        update: {},
      });

      // Validate stock for all items before merging
      for (const item of guestCart.items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
          select: { stock: true, isActive: true }
        });
        
        if (!product || !product.isActive) {
          throw new Error(`Product ${item.productId} is no longer available`);
        }
      }

      // Merge items
      for (const item of guestCart.items) {
        await tx.cartItem.upsert({
          where: { cartId_productId: { cartId: userCart.id, productId: item.productId } },
          create: { cartId: userCart.id, productId: item.productId, quantity: item.quantity, price: item.price },
          update: { quantity: { increment: item.quantity } },
        });
      }

      // Delete guest cart
      await tx.cart.delete({ where: { id: guestCart.id } });
    });

    res.clearCookie('cart_session');
    res.json({ success: true, message: 'Cart merged' });
  } catch (err) {
    next(err);
  }
};
