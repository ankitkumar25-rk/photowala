/**
 * Calculate order pricing with GST and Email fee
 * @param {number} baseAmount - Base price before tax
 * @param {string} fileOption - 'online' or 'email'
 * @returns {object} { baseAmount, emailFee, gstAmount, totalAmount }
 */
function calculateServicePrice(baseAmount, fileOption) {
  const emailFee = fileOption === 'email' ? 10 : 0;
  const subtotal = baseAmount + emailFee;
  const gstAmount = Math.round(subtotal * 0.18);
  const totalAmount = subtotal + gstAmount;

  return {
    baseAmount: Math.round(baseAmount),
    emailFee,
    gstAmount,
    totalAmount
  };
}

// Specific pricing logic for different services
const pricingLogic = {
  PEN: (qty, penType) => {
    const prices = {
      '101': 66, '102': 70, '103': 83, '104': 105, '105': 115,
      '106': 115, '107': 120, '108': 220, '109': 225, '110': 190
    };
    const unitPrice = prices[penType] || 0;
    return qty * unitPrice;
  },
  
  STICKER: (qty, lamination) => {
    let price = qty * 1.70;
    if (lamination === 'Gloss Lamination') price += 200;
    return price;
  },

  LETTERHEAD: (qty, productCode) => {
    const priceMap = {
      'LH-1': { 1000: 1.50, 2000: 1.30, 3000: 1.20, 4000: 1.10, 8000: 1.00, 12000: 0.95, 16000: 0.90 },
      'LH-2': { 1000: 1.80, 2000: 1.60, 3000: 1.50, 4000: 1.40, 8000: 1.30, 12000: 1.25, 16000: 1.20 },
      'LH-3': { 1000: 2.20, 2000: 2.00, 3000: 1.90, 4000: 1.80, 8000: 1.70, 12000: 1.65, 16000: 1.60 },
      'LH-4': { 1000: 2.50, 2000: 2.30, 3000: 2.20, 4000: 2.10, 8000: 2.00, 12000: 1.95, 16000: 0.90 },
      'LH-4A': { 1000: 3.50, 2000: 3.30, 3000: 3.20, 4000: 3.10, 8000: 3.00, 12000: 2.95, 16000: 2.90 },
      'LH-4B': { 1000: 4.50, 2000: 4.30, 3000: 4.20, 4000: 4.10, 8000: 4.00, 12000: 3.95, 16000: 3.90 },
      'LH-5': { 1000: 2.80, 2000: 2.60, 3000: 2.50, 4000: 2.40, 8000: 2.30, 12000: 2.25, 16000: 2.20 },
    };
    const codeMap = productCode.split('-').slice(0, 2).join('-'); // Extract LH-1, LH-4A etc.
    // Fallback if exact slab doesn't exist (use highest slab or linear)
    const slabs = priceMap[codeMap] || priceMap['LH-1'];
    const unitPrice = slabs[qty] || slabs[Object.keys(slabs).sort((a,b)=>b-a)[0]];
    return qty * unitPrice;
  },

  GARMENT_TAG: (qty, tagType, size, uvOption) => {
    // Simplified logic based on provided info
    const rates = {
      GLOSS: { Small: 1.2, Medium: 1.8, Large: 2.5 },
      MATT: { Small: 1.4, Medium: 2.1, Large: 2.8 },
      UV: { Small: 1.6, Medium: 2.4, Large: 3.2 }
    };
    if (tagType === 'THREAD') return qty * 0.85;
    
    let rate = rates[tagType]?.[size] || 1.2;
    if (tagType === 'UV') {
      if (uvOption === 'Both Side Printing + Single Side UV') rate += 0.40;
      if (uvOption === 'Both Side Printing + Both Side UV') rate += 0.80;
    }
    return qty * rate;
  },

  BILL_BOOK: (qty, bookType) => {
    const rate = bookType === 'A4_BB_2' ? 85 : 120;
    return qty * rate;
  },

  ENVELOPE: (qty, paperType) => {
    const rate = paperType.includes('100 GSM') ? 2.50 : 1.80;
    return qty * rate;
  }
};

module.exports = { calculateServicePrice, pricingLogic };
