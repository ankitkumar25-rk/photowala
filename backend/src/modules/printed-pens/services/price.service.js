const prisma = require('../../../config/database');

exports.calculateApplicablePrice = async (productId, quantity) => {
  const product = await prisma.printedPenProduct.findUnique({
    where: { id: productId },
    include: { volumeDiscounts: true }
  });

  if (!product) {
    throw new Error('Product not found');
  }

  const basePrice = parseFloat(product.basePrice);
  const baseCost = basePrice * quantity;

  let applicableDiscountPct = 0;

  // Find the applicable discount bracket
  const applicableBracket = product.volumeDiscounts.find(discount => {
    if (quantity >= discount.minQty && (discount.maxQty === null || quantity <= discount.maxQty)) {
      return true;
    }
    return false;
  });

  if (applicableBracket) {
    applicableDiscountPct = parseFloat(applicableBracket.discountPct);
  }

  const discountAmount = baseCost * (applicableDiscountPct / 100);
  const applicableCost = baseCost - discountAmount;
  const gstAmount = applicableCost * 0.18; // 18% GST
  const totalAmount = applicableCost + gstAmount;

  return {
    baseCost: baseCost.toFixed(2),
    discountPct: applicableDiscountPct,
    discountAmount: discountAmount.toFixed(2),
    applicableCost: applicableCost.toFixed(2),
    gstAmount: gstAmount.toFixed(2),
    totalAmount: totalAmount.toFixed(2)
  };
};
