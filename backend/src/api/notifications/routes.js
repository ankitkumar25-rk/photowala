import express from 'express';
import { authenticate } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/rbac.js';
import { 
  addAdminClient, 
  removeAdminClient 
} from '../../services/notificationService.js';

const router = express.Router();

// SSE endpoint — admin connects here to receive live events
router.get('/stream', authenticate, requireRole(['ADMIN','SUPER_ADMIN']),
  (req, res) => {
    // SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // important for Render/nginx
    res.flushHeaders();

    // Send initial ping to confirm connection
    res.write('event: connected\ndata: {"message":"SSE connected"}\n\n');

    // Register this admin as a client
    addAdminClient(res);

    // Keep alive ping every 25 seconds
    const keepAlive = setInterval(() => {
      res.write(':ping\n\n');
    }, 25000);

    // Cleanup on disconnect
    req.on('close', () => {
      clearInterval(keepAlive);
      removeAdminClient(res);
    });
  }
);

export default router;
