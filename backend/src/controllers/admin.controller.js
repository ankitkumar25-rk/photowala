import prisma from '../lib/prisma.js';
import { createError } from '../middleware/errorHandler.js';
import asyncHandler from '../utils/asyncHandler.js';

export const getDashboardStats = asyncHandler(async (req, res) => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    totalOrders,
    totalRevenue,
    totalUsers,
    totalProducts,
    ordersThisMonth,
    revenueThisMonth,
    lowStockCount,
    statusBreakdown,
  ] = await Promise.all([
    prisma.order.count(),
    prisma.payment.aggregate({ _sum: { amount: true }, where: { status: 'PAID' } }).catch(() => ({ _sum: { amount: null } })),
    prisma.user.count(),
    prisma.product.count({ where: { isActive: true } }),
    prisma.order.count({ where: { createdAt: { gte: startOfMonth } } }),
    prisma.payment.aggregate({ _sum: { amount: true }, where: { status: 'PAID', createdAt: { gte: startOfMonth } } }).catch(() => ({ _sum: { amount: null } })),
    prisma.product.count({ where: { stock: { lte: 10 }, isActive: true } }),
    prisma.order.groupBy({ by: ['status'], _count: true }).catch(() => []),
  ]);

  res.json({
    success: true,
    data: {
      totalOrders,
      totalRevenue: Number(totalRevenue._sum.amount || 0),
      totalUsers,
      totalProducts,
      ordersThisMonth,
      revenueThisMonth: Number(revenueThisMonth._sum.amount || 0),
      lowStockCount,
      statusBreakdown: (statusBreakdown || []).reduce((acc, item) => {
        acc[item.status] = item._count;
        return acc;
      }, {}),
    },
  });
});

export const getSalesChart = asyncHandler(async (req, res) => {
  const days = Math.max(1, parseInt(req.query.days) || 30);
  const from = new Date();
  from.setDate(from.getDate() - days);

  let sales = [];
  try {
    sales = await prisma.$queryRaw`
      SELECT 
        DATE_TRUNC('day', o."createdAt") as "date",
        SUM(o."total") as "revenue",
        COUNT(o."id")::int as "orders"
      FROM "orders" o
      WHERE o."createdAt" >= ${from}
      GROUP BY DATE_TRUNC('day', o."createdAt")
      ORDER BY "date" ASC
    `;
  } catch (queryErr) {
    console.error('[Dashboard] Sales chart query error:', queryErr.message);
    throw createError('Failed to fetch sales data', 500);
  }

  const formattedSales = sales.map(s => ({
    date: s.date.toISOString().split('T')[0],
    revenue: Number(s.revenue || 0),
    orders: s.orders || 0
  }));

  res.json({ success: true, data: formattedSales });
});

export const listCustomers = asyncHandler(async (req, res) => {
  const pageNum = Math.max(1, parseInt(req.query.page) || 1);
  const limitNum = Math.max(1, parseInt(req.query.limit) || 20);
  const search = (req.query.search || '').trim().slice(0, 100);

  const where = { role: 'CUSTOMER' };
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ];
  }
  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip: (pageNum - 1) * limitNum,
      take: limitNum,
      select: { id: true, name: true, email: true, phone: true, createdAt: true, _count: { select: { orders: true } } },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.count({ where }),
  ]);
  res.json({ success: true, data: users, meta: { total, page: pageNum } });
});

export const getCustomer = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.params.id },
    include: {
      orders: { take: 10, orderBy: { createdAt: 'desc' } },
      addresses: true,
    },
  });
  if (!user) throw createError('Customer not found', 404);
  res.json({ success: true, data: user });
});

export const banCustomer = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { action } = req.body;

  if (!['ban', 'unban'].includes(action)) {
    throw createError('Invalid action. Must be "ban" or "unban"', 400);
  }

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw createError('Customer not found', 404);

  const updatedUser = await prisma.user.update({
    where: { id },
    data: { isBanned: action === 'ban' }
  });

  res.json({ 
    success: true, 
    data: updatedUser,
    message: action === 'ban' ? 'Customer banned successfully' : 'Customer unbanned successfully'
  });
});

export const getInventory = asyncHandler(async (req, res) => {
  const pageNum = Math.max(1, parseInt(req.query.page) || 1);
  const limitNum = Math.max(1, parseInt(req.query.limit) || 50);
  const skip = (pageNum - 1) * limitNum;

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where: { isActive: true },
      select: { id: true, name: true, sku: true, stock: true, lowStockAlert: true, category: { select: { name: true } } },
      orderBy: { stock: 'asc' },
      skip,
      take: limitNum,
    }),
    prisma.product.count({ where: { isActive: true } }),
  ]);

  res.json({ success: true, data: products, meta: { total, page: pageNum, limit: limitNum } });
});

export const getLowStockProducts = asyncHandler(async (req, res) => {
  const pageNum = Math.max(1, parseInt(req.query.page) || 1);
  const limitNum = Math.max(1, parseInt(req.query.limit) || 50);
  const skip = (pageNum - 1) * limitNum;
  const threshold = parseInt(req.query.threshold) || 10;

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where: {
        isActive: true,
        stock: { lte: threshold }
      },
      select: { id: true, name: true, sku: true, stock: true, lowStockAlert: true, category: { select: { name: true } } },
      orderBy: { stock: 'asc' },
      skip,
      take: limitNum,
    }),
    prisma.product.count({
      where: {
        isActive: true,
        stock: { lte: threshold }
      }
    })
  ]);

  res.json({ success: true, data: products, meta: { total, page: pageNum, limit: limitNum } });
});
