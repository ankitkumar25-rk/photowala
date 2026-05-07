const prisma = require('../../../config/database');

exports.getProducts = async (req, res, next) => {
  try {
    const products = await prisma.printedPenProduct.findMany({
      include: {
        penTypes: true,
        formFields: true,
      }
    });
    res.json(products);
  } catch (error) {
    next(error);
  }
};

exports.getPenTypes = async (req, res, next) => {
  try {
    const { product_id } = req.query;
    const where = product_id ? { productId: product_id } : {};
    const penTypes = await prisma.printedPenType.findMany({ where });
    res.json(penTypes);
  } catch (error) {
    next(error);
  }
};

exports.getCouriers = async (req, res, next) => {
  try {
    const couriers = await prisma.printedPenCourier.findMany({
      where: { isActive: true }
    });
    res.json(couriers);
  } catch (error) {
    next(error);
  }
};
