const priceService = require('../services/price.service');

exports.calculatePrice = async (req, res, next) => {
  try {
    const { product_id, quantity } = req.body;
    
    if (!product_id || !quantity || quantity <= 0) {
      return res.status(400).json({ error: 'Valid product_id and quantity are required' });
    }

    const priceDetails = await priceService.calculateApplicablePrice(product_id, quantity);
    res.json(priceDetails);
  } catch (error) {
    next(error);
  }
};
