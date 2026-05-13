import prisma from '../lib/prisma.js';
import { createError } from '../middleware/errorHandler.js';
import { z } from 'zod';
import asyncHandler from '../utils/asyncHandler.js';

function genTicketNumber() {
  return `TKT-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2,5).toUpperCase()}`;
}

export const createTicket = asyncHandler(async (req, res) => {
  const { subject, message, orderId } = z.object({
    subject: z.string().min(5).max(200),
    message: z.string().min(10),
    orderId: z.string().uuid().optional(),
  }).parse(req.body);

  const ticket = await prisma.supportTicket.create({
    data: {
      ticketNumber: genTicketNumber(),
      userId: req.user.id,
      subject, message, orderId,
    },
  });
  res.status(201).json({ success: true, data: ticket });
});

export const getMyTickets = asyncHandler(async (req, res) => {
  const tickets = await prisma.supportTicket.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: 'desc' },
  });
  res.json({ success: true, data: tickets });
});

export const getTicketsQueue = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const where = status ? { status } : {};
  const [tickets, total] = await Promise.all([
    prisma.supportTicket.findMany({
      where,
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true, email: true } } },
    }),
    prisma.supportTicket.count({ where }),
  ]);
  res.json({ success: true, data: tickets, meta: { total } });
});

export const updateTicket = asyncHandler(async (req, res) => {
  const { adminReply, status } = z.object({
    adminReply: z.string().optional(),
    status: z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']).optional(),
  }).parse(req.body);

  const ticket = await prisma.supportTicket.update({
    where: { id: req.params.id },
    data: { adminReply, status },
  });
  res.json({ success: true, data: ticket });
});

export const closeTicket = asyncHandler(async (req, res) => {
  const ticket = await prisma.supportTicket.update({
    where: { id: req.params.id },
    data: { status: 'CLOSED' },
  });
  res.json({ success: true, data: ticket });
});
