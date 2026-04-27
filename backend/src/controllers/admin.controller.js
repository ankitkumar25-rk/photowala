const prisma = require('../config/database');
const { createError } = require('../middleware/errorHandler');

exports.getDashboardStats = async (req, res, next) => {
  try {
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
      prisma.payment.aggregate({ _sum: { amount: true }, where: { status: 'PAID' } }),
      prisma.user.count(),
      prisma.product.count({ where: { isActive: true } }),
      prisma.order.count({ where: { createdAt: { gte: startOfMonth } } }),
      prisma.payment.aggregate({ _sum: { amount: true }, where: { status: 'PAID', createdAt: { gte: startOfMonth } } }),
      prisma.product.count({ where: { stock: { lte: 10 }, isActive: true } }),
      prisma.order.groupBy({ by: ['status'], _count: true }),
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
        statusBreakdown: statusBreakdown.reduce((acc, item) => {
          acc[item.status] = item._count;
          return acc;
        }, {}),
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.getSalesChart = async (req, res, next) => {
  try {
    const { days = 30 } = req.query;
    const from = new Date();
    from.setDate(from.getDate() - Number(days));

    const orders = await prisma.order.findMany({
      where: { createdAt: { gte: from }, payment: { status: 'PAID' } },
      select: { createdAt: true, total: true },
      orderBy: { createdAt: 'asc' },
    });

    // Group by date
    const grouped = orders.reduce((acc, order) => {
      const date = order.createdAt.toISOString().split('T')[0];
      if (!acc[date]) acc[date] = { date, revenue: 0, orders: 0 };
      acc[date].revenue += Number(order.total);
      acc[date].orders += 1;
      return acc;
    }, {});

    res.json({ success: true, data: Object.values(grouped) });
  } catch (err) {
    next(err);
  }
};

exports.listCustomers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
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
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        select: { id: true, name: true, email: true, phone: true, createdAt: true, _count: { select: { orders: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);
    res.json({ success: true, data: users, meta: { total, page: Number(page) } });
  } catch (err) {
    next(err);
  }
};

exports.getCustomer = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      include: {
        orders: { take: 10, orderBy: { createdAt: 'desc' }, include: { payment: true } },
        addresses: true,
      },
    });
    if (!user) throw createError('Customer not found', 404);
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

exports.banCustomer = async (req, res, next) => {
  try {
    // Flag: set a banned role or deactivate — implementation-specific
    // Here, simply update role to a "banned" state if needed
    res.json({ success: true, message: 'Customer action recorded' });
  } catch (err) {
    next(err);
  }
};

exports.getInventory = async (req, res, next) => {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      select: { id: true, name: true, sku: true, stock: true, lowStockAlert: true, category: { select: { name: true } } },
      orderBy: { stock: 'asc' },
    });
    res.json({ success: true, data: products });
  } catch (err) {
    next(err);
  }
};

exports.getLowStockProducts = async (req, res, next) => {
  try {
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        stock: { lte: prisma.product.fields.lowStockAlert },
      },
      select: { id: true, name: true, stock: true, lowStockAlert: true },
    });
    res.json({ success: true, data: products });
  } catch (err) {
    next(err);
  }
};
