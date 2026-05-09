const { z } = require('zod');

exports.machineRequestSchema = z.object({
    serviceType: z.enum(['CO2_LASER', 'CNC_ROUTER', 'LASER_MARKING']),
    orderName: z.string().min(3).max(100),
    serviceData: z.object({
        materialType: z.string(),
        materialThickness: z.string(),
        quantity: z.string(),
        dimensions: z.object({
            l: z.coerce.string(),
            w: z.coerce.string(),
            h: z.coerce.string(),
        }),
        specialInstructions: z.string().optional(),
    }),
});
