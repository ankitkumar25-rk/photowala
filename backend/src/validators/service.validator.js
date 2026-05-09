const { z } = require('zod');

// Shared base schema
const baseOrderSchema = z.object({
  orderName: z.string().min(1, 'Order name is required'),
  quantity: z.number().int().positive('Quantity must be a positive integer'),
  deliveryOption: z.enum(['courier', 'transport']),
  fileOption: z.enum(['online', 'email']),
  specialRemark: z.string().max(500).optional(),
});

// 1. Pen
const penOrderSchema = baseOrderSchema.extend({
  penType: z.string().min(1, 'Pen type is required'),
});

// 2. Sticker
const stickerOrderSchema = baseOrderSchema.extend({
  stickerType: z.enum(['no-cut', 'round-cut', 'straight-cut']),
  lamination: z.enum(['Not Required', 'Gloss Lamination']),
  stickerCount: z.string().optional(), // e.g. "20 Round Stickers"
});

// 3. Digital Printing
const digitalPrintingSchema = baseOrderSchema.extend({
  productType: z.string().min(1, 'Product type is required'), // e.g. "ART PAPER"
  subType: z.string().optional(), // e.g. "Digital Printout - 300 GSM"
  size: z.string().min(1, 'Size is required'),
  printing: z.string().min(1, 'Printing side is required'),
  lamination: z.string().optional(),
  halfCut: z.string().optional(),
});

// 4. Letterhead
const letterheadSchema = baseOrderSchema.extend({
  productCode: z.string().min(1, 'Product code is required'),
  printing: z.enum(['Single Side', 'Both Side']),
  binding: z.string().min(1, 'Binding option is required'),
  size: z.enum(['A4 (8.26" X 11.69")', 'Letter Size (8.5" X 11.0")']),
  cuttingType: z.string().optional(),
  uvSide: z.string().optional(),
  foilSide: z.string().optional(),
  foilColor: z.string().optional(),
});

// 5. Garment Tag
const garmentTagSchema = baseOrderSchema.extend({
  tagType: z.enum(['GLOSS', 'MATT', 'UV', 'THREAD']),
  size: z.string().optional(),
  printing: z.string().optional(),
  uvOption: z.string().optional(),
  dieShape: z.string().optional(),
  threadType: z.string().optional(),
  threadColor: z.string().optional(),
});

// 6. Bill Book
const billBookSchema = baseOrderSchema.extend({
  bookType: z.enum(['A4_BB_2', 'A4_BB_3']),
  paperQuality: z.string().min(1, 'Paper quality is required'),
  copy2Color: z.string().min(1, '2nd copy color is required'),
  copy3Color: z.string().optional(),
  binding: z.string().min(1, 'Binding quality is required'),
});

// 7. Envelope
const envelopeSchema = baseOrderSchema.extend({
  envelopeSize: z.string().min(1, 'Envelope size is required'),
  paperType: z.string().min(1, 'Paper type is required'),
  windowCutting: z.string().optional(),
  flapOpening: z.string().optional(),
});

// --- Machine Services ---

const machineBaseSchema = z.object({
  quantity: z.number().int().positive(),
  specialInstructions: z.string().optional(),
});

const co2LaserSchema = machineBaseSchema.extend({
  orderName: z.string().min(1),
  materialType: z.string().min(1),
  thickness: z.string().min(1),
  dimensions: z.string().min(1), // LxWxH
});

const cncRouterSchema = machineBaseSchema.extend({
  projectTitle: z.string().min(1),
  materialType: z.string().min(1),
  processType: z.enum(['2D Profile Cutting', '3D Carving / Bas-Relief', 'Drilling & Pocketing', 'V-Groove Folding']),
  sheetDimensions: z.string().min(1),
});

const laserMarkingSchema = machineBaseSchema.extend({
  orderName: z.string().min(1),
  materialType: z.string().min(1),
  markingType: z.string().min(1),
  markingArea: z.string().min(1),
});

module.exports = {
  penOrderSchema,
  stickerOrderSchema,
  digitalPrintingSchema,
  letterheadSchema,
  garmentTagSchema,
  billBookSchema,
  envelopeSchema,
  co2LaserSchema,
  cncRouterSchema,
  laserMarkingSchema
};
