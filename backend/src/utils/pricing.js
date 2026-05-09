/**
 * Pricing Utility for Photowala Services
 */

const GST_RATE = 0.18;
const EMAIL_FEE = 10;

/**
 * Shared logic to apply GST and Email fee
 */
function finalizePrice(base, fileSubmission) {
    const emailFee = fileSubmission === 'EMAIL' ? EMAIL_FEE : 0;
    const subtotal = base + emailFee;
    const gstAmount = Math.round(subtotal * GST_RATE * 100) / 100;
    const totalAmount = Math.round((subtotal + gstAmount) * 100) / 100;

    return {
        baseAmount: base,
        emailFee,
        gstAmount,
        totalAmount
    };
}

const pricing = {
    calcPenPrice: ({ penType, quantity, fileSubmission }) => {
        const prices = {
            '101': 66, '102': 70, '103': 83, '104': 105, 
            '105': 115, '106': 115, '107': 120, '108': 220, 
            '109': 225, '110': 190
        };
        const unit = prices[penType] || 0;
        return finalizePrice(unit * quantity, fileSubmission);
    },

    calcStickerPrice: ({ quantity, lamination, fileSubmission }) => {
        let base = quantity * 1.70;
        if (lamination === 'Gloss Lamination') base += 200;
        return finalizePrice(base, fileSubmission);
    },

    calcLetterheadPrice: ({ product, quantity, fileSubmission }) => {
        const slabs = {
            'LH-1': { 1000: 1.5, 2000: 1.3, 3000: 1.2, 4000: 1.1, 8000: 1.0, 12000: 0.95, 16000: 0.9 },
            'LH-2': { 1000: 1.8, 2000: 1.6, 3000: 1.5, 4000: 1.4, 8000: 1.3, 12000: 1.25, 16000: 1.2 },
            'LH-3': { 1000: 2.2, 2000: 2.0, 3000: 1.9, 4000: 1.8, 8000: 1.7, 12000: 1.65, 16000: 1.6 },
            'LH-4': { 1000: 2.5, 2000: 2.3, 3000: 2.2, 4000: 2.1, 8000: 2.0, 12000: 1.95, 16000: 1.9 },
            'LH-5': { 1000: 2.8, 2000: 2.6, 3000: 2.5, 4000: 2.4, 8000: 2.3, 12000: 2.25, 16000: 2.2 },
        };
        const productSlab = slabs[product] || slabs['LH-1'];
        const unit = productSlab[quantity] || productSlab[1000];
        return finalizePrice(unit * quantity, fileSubmission);
    },

    calcGarmentTagPrice: ({ tagType, size, quantity, uvVariant, fileSubmission }) => {
        // Sample matrix pricing
        const rates = {
            'TAG-1': { Small: 1.2, Medium: 1.5, Large: 2.0 },
            'TAG-2': { Small: 1.5, Medium: 1.8, Large: 2.4 },
            'TAG-3': { Small: 2.0, Medium: 2.5, Large: 3.2 }
        };
        const baseRate = rates[tagType]?.[size] || 1.2;
        let base = baseRate * quantity;
        
        if (uvVariant === 'ONE_SIDE') base += 0.40 * quantity;
        if (uvVariant === 'BOTH_SIDE') base += 0.80 * quantity;
        
        return finalizePrice(base, fileSubmission);
    },

    calcBillBookPrice: ({ product, quantity, fileSubmission }) => {
        const unit = product === 'A4_BB_2' ? 85 : 120;
        return finalizePrice(unit * quantity, fileSubmission);
    },

    calcEnvelopePrice: ({ paperType, quantity, fileSubmission }) => {
        const unit = paperType.includes('100 GSM') ? 2.50 : 1.80;
        return finalizePrice(unit * quantity, fileSubmission);
    },

    calcDigitalPrintingPrice: ({ productType, quantity, lamination, fileSubmission }) => {
        const rates = {
            'Art Paper 170 GSM': 15,
            'Art Paper 300 GSM': 25,
            'Sticker Paper': 35
        };
        const unit = rates[productType] || 20;
        let base = unit * quantity;
        if (lamination !== 'None') base += 5 * quantity;
        return finalizePrice(base, fileSubmission);
    }
};

/**
 * Get estimated delivery date
 */
function getEstimatedDelivery(serviceType, product) {
    const daysMap = {
        PEN: 3,
        STICKER_LABELS: 7,
        DIGITAL_PRINTING: 1,
        LETTERHEAD: 2,
        GARMENT_TAG: 10,
        BILL_BOOK: 7,
        ENVELOPE: 4
    };

    let days = daysMap[serviceType] || 5;
    
    // Add extra for UV/Foil in Letterhead
    if (serviceType === 'LETTERHEAD' && product?.includes('UV')) days += 1;

    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + days);
    return deliveryDate;
}

module.exports = { ...pricing, getEstimatedDelivery };
