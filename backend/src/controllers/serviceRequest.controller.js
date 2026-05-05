const prisma = require('../config/database');
const { createError } = require('../middleware/errorHandler');
const { uploadRawToCloudinary } = require('../config/cloudinary');
const { z } = require('zod');

const createSchema = z.object({
  serviceType: z.enum(['CO2_LASER', 'LASER_MARKING', 'CNC_ROUTER']),
  sizeL: z.coerce.number().positive(),
  sizeB: z.coerce.number().positive(),
  sizeH: z.coerce.number().positive(),
  quantity: z.coerce.number().int().positive(),
  priceRange: z.string().min(1).max(120),
  timingRange: z.string().min(1).max(120),
  notes: z.string().max(1000).optional(),
});

const statusSchema = z.object({
  status: z.enum(['NEW', 'IN_PROGRESS', 'CLOSED']),
});

function buildPublicId(serviceType) {
  const ts = Date.now();
  return `service-${serviceType.toLowerCase()}-${ts}`;
}

exports.createServiceRequest = async (req, res, next) => {
  try {
    const payload = createSchema.parse(req.body);

    if (!req.file || !req.file.buffer) {
      throw createError('Design file is required', 400);
    }

    const upload = await uploadRawToCloudinary(req.file.buffer, {
      folder: 'photowala/service-requests',
      public_id: buildPublicId(payload.serviceType),
    });

    const request = await prisma.serviceRequest.create({
      data: {
        serviceType: payload.serviceType,
        sizeL: payload.sizeL,
        sizeB: payload.sizeB,
        sizeH: payload.sizeH,
        quantity: payload.quantity,
        priceRange: payload.priceRange,
        timingRange: payload.timingRange,
        notes: payload.notes || null,
        designFileUrl: upload.secure_url,
        designFilePublicId: upload.public_id,
        userId: req.user?.id || null,
      },
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    res.status(201).json({ success: true, data: request });
  } catch (err) {
    next(err);
  }
};

exports.listServiceRequests = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, serviceType, status } = req.query;
    const where = {};
    if (serviceType) where.serviceType = serviceType;
    if (status) where.status = status;

    const [items, total] = await Promise.all([
      prisma.serviceRequest.findMany({
        where,
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { id: true, name: true, email: true } } },
      }),
      prisma.serviceRequest.count({ where }),
    ]);

    res.json({ success: true, data: items, meta: { total, page: Number(page) } });
  } catch (err) {
    next(err);
  }
};

exports.getServiceRequest = async (req, res, next) => {
  try {
    const request = await prisma.serviceRequest.findUnique({
      where: { id: req.params.id },
      include: { user: { select: { id: true, name: true, email: true } } },
    });
    if (!request) throw createError('Service request not found', 404);
    res.json({ success: true, data: request });
  } catch (err) {
    next(err);
  }
};

exports.updateServiceRequestStatus = async (req, res, next) => {
  try {
    const { status } = statusSchema.parse(req.body);
    const request = await prisma.serviceRequest.update({
      where: { id: req.params.id },
      data: { status },
    });
    res.json({ success: true, data: request });
  } catch (err) {
    next(err);
  }
};
