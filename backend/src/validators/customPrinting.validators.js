const { z } = require('zod');

const commonFields = {
    orderName: z.string().min(1, 'Order name is required'),
    fileSubmission: z.enum(['UPLOAD', 'EMAIL']),
    deliveryOption: z.enum(['COURIER', 'TRANSPORT']),
    paymentMethod: z.enum(['COD', 'RAZORPAY']),
    specialRemark: z.string().max(250).optional(),
};

const penSchema = z.object({
    ...commonFields,
    penType: z.enum(['101', '102', '103', '104', '105', '106', '107', '108', '109', '110']),
    quantity: z.coerce.number().int().positive(),
});

const stickerSchema = z.object({
    ...commonFields,
    quantity: z.coerce.number().int().min(1000),
    stickerType: z.enum(['ST-1', 'ST-2', 'ST-3']),
    lamination: z.string().min(1),
});

const letterheadSchema = z.object({
    ...commonFields,
    product: z.enum(['LH-1', 'LH-2', 'LH-3', 'LH-4', 'LH-5']),
    quantity: z.coerce.number().int().positive(),
    printing: z.string().min(1),
    binding: z.string().min(1),
});

const garmentTagSchema = z.object({
    ...commonFields,
    tagType: z.enum(['TAG-1', 'TAG-2', 'TAG-3']),
    size: z.enum(['Small', 'Medium', 'Large']),
    quantity: z.coerce.number().int().min(100),
    uvVariant: z.enum(['NONE', 'ONE_SIDE', 'BOTH_SIDE']).optional(),
});

const billBookSchema = z.object({
    ...commonFields,
    product: z.enum(['A4_BB_2', 'A4_BB_3']),
    quantity: z.coerce.number().int().min(10),
    firstCopyPaper: z.string().min(1),
    bindingQuality: z.string().min(1),
});

const envelopeSchema = z.object({
    ...commonFields,
    envelopeSize: z.enum(['EN-1', 'EN-2', 'EN-3', 'EN-4', 'EN-5', 'EN-6', 'EN-7']),
    paperType: z.string().min(1),
    flapOpening: z.string().min(1),
    quantity: z.coerce.number().int().positive(),
});

const digitalPrintingSchema = z.object({
    ...commonFields,
    productType: z.string().min(1),
    quantity: z.coerce.number().int().positive(),
    lamination: z.string().min(1),
});

module.exports = {
    penSchema,
    stickerSchema,
    letterheadSchema,
    garmentTagSchema,
    billBookSchema,
    envelopeSchema,
    digitalPrintingSchema
};
