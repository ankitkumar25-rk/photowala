const prisma = require('../../../config/database');
const crypto = require('crypto');

function generateRequestId() {
  return 'SR-' + crypto.randomBytes(4).toString('hex').toUpperCase();
}

exports.createServiceRequest = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { orderId, serviceType } = req.body;

    const trackingUpdates = [{
      status: 'CONFIRMED',
      timestamp: new Date().toISOString(),
      message: 'Service request has been confirmed.'
    }];

    const request = await prisma.printedPenServiceRequest.create({
      data: {
        requestId: generateRequestId(),
        userId,
        orderId: orderId || null,
        serviceType,
        status: 'CONFIRMED',
        trackingUpdates
      }
    });

    res.status(201).json(request);
  } catch (error) {
    next(error);
  }
};

exports.getMyRequests = async (req, res, next) => {
  try {
    const requests = await prisma.printedPenServiceRequest.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' }
    });
    res.json(requests);
  } catch (error) {
    next(error);
  }
};

exports.trackServiceRequest = async (req, res, next) => {
  try {
    const request = await prisma.printedPenServiceRequest.findUnique({
      where: { id: req.params.id }
    });
    if (!request) return res.status(404).json({ error: 'Service request not found' });
    res.json(request);
  } catch (error) {
    next(error);
  }
};

exports.getAllServiceRequests = async (req, res, next) => {
  try {
    const requests = await prisma.printedPenServiceRequest.findMany({
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true, email: true } }, order: true }
    });
    res.json(requests);
  } catch (error) {
    next(error);
  }
};

exports.updateServiceRequestStatus = async (req, res, next) => {
  try {
    const { status, adminNotes } = req.body;
    const request = await prisma.printedPenServiceRequest.findUnique({ where: { id: req.params.id } });
    
    if (!request) return res.status(404).json({ error: 'Service request not found' });

    const newUpdate = {
      status,
      timestamp: new Date().toISOString(),
      message: `Status updated to ${status}. ${adminNotes || ''}`.trim()
    };

    const trackingUpdates = Array.isArray(request.trackingUpdates) ? request.trackingUpdates : [];
    trackingUpdates.push(newUpdate);

    const updatedRequest = await prisma.printedPenServiceRequest.update({
      where: { id: request.id },
      data: {
        status,
        adminNotes: adminNotes || request.adminNotes,
        trackingUpdates
      }
    });

    res.json(updatedRequest);
  } catch (error) {
    next(error);
  }
};
