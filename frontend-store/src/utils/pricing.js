/**
 * Pricing Utility for Photowala Services (Frontend Mirror)
 */

const GST_RATE = 0.18;
const EMAIL_FEE = 10;

function finalizePrice(base, fileSubmission) {
    const emailFee = fileSubmission === 'EMAIL' || fileSubmission === 'email' ? EMAIL_FEE : 0;
    const subtotal = base + emailFee;
    const gstAmount = Math.round(subtotal * GST_RATE * 100) / 100;
    const totalAmount = Math.round((subtotal + gstAmount) * 100) / 100;

    return {
        baseAmount: Math.round(base * 100) / 100,
        emailFee,
        gstAmount,
        totalAmount
    };
}

export const pricingLogic = {
    PEN: ({ penType, quantity, fileSubmission }) => {
        const prices = {
            '101': 66, '102': 70, '103': 83, '104': 105, 
            '105': 115, '106': 115, '107': 120, '108': 220, 
            '109': 225, '110': 190
        };
        const unit = prices[penType] || 0;
        return finalizePrice(unit * Number(quantity || 0), fileSubmission);
    },

    STICKER_LABELS: ({ quantity, lamination, fileSubmission }) => {
        let base = Number(quantity || 0) * 1.70;
        if (lamination === 'Gloss Lamination') base += 200;
        return finalizePrice(base, fileSubmission);
    },

    LETTERHEAD: ({ product, quantity, fileSubmission }) => {
        const slabs = {
            'LH-1': { 1000: 1.5, 2000: 1.3, 3000: 1.2, 4000: 1.1, 8000: 1.0, 12000: 0.95, 16000: 0.9 },
            'LH-2': { 1000: 1.8, 2000: 1.6, 3000: 1.5, 4000: 1.4, 8000: 1.3, 12000: 1.25, 16000: 1.2 },
            'LH-3': { 1000: 2.2, 2000: 2.0, 3000: 1.9, 4000: 1.8, 8000: 1.7, 12000: 1.65, 16000: 1.6 },
            'LH-4': { 1000: 2.5, 2000: 2.3, 3000: 2.2, 4000: 2.1, 8000: 2.0, 12000: 1.95, 16000: 1.9 },
            'LH-5': { 1000: 2.8, 2000: 2.6, 3000: 2.5, 4000: 2.4, 8000: 2.3, 12000: 2.25, 16000: 2.2 },
        };
        const productSlab = slabs[product] || slabs['LH-1'];
        const unit = productSlab[quantity] || productSlab[1000] || 0;
        return finalizePrice(unit * Number(quantity || 0), fileSubmission);
    },

    GARMENT_TAG: ({ tagType, size, quantity, fileSubmission }) => {
        const rates = {
            'GLOSS': { Small: 1.2, Medium: 1.5, Large: 2.0 },
            'MATT': { Small: 1.5, Medium: 1.8, Large: 2.4 },
            'UV': { Small: 2.0, Medium: 2.5, Large: 3.2 },
            'THREAD': { Small: 0.85, Medium: 0.85, Large: 0.85 }
        };
        const baseRate = rates[tagType]?.[size] || 0;
        let base = baseRate * Number(quantity || 0);
        return finalizePrice(base, fileSubmission);
    },

    BILL_BOOK: ({ bookType, quantity, fileSubmission }) => {
        const unit = bookType === 'A4-2' ? 85 : 120;
        return finalizePrice(unit * Number(quantity || 0), fileSubmission);
    },

    ENVELOPE: ({ product, quantity, fileSubmission }) => {
        // EN-1 (9x4), EN-3 (10.75x4.75), etc.
        const rates = {
            'EN-1': 1.80,
            'EN-3': 2.50,
            'EN-4': 2.50
        };
        const unit = rates[product] || 2.0;
        return finalizePrice(unit * Number(quantity || 0), fileSubmission);
    },

    DIGITAL_PRINTING: ({ productType, quantity, lamination, fileSubmission }) => {
        const rates = {
            'Art Paper 170 GSM': 15,
            'Art Paper 300 GSM': 25,
            'Sticker Paper': 35,
            'Metallic Paper': 45
        };
        const unit = rates[productType] || 20;
        let base = unit * Number(quantity || 0);
        if (lamination && lamination !== 'None') base += 5 * Number(quantity || 0);
        return finalizePrice(base, fileSubmission);
    }
};
