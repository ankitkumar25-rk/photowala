import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import path from 'path';
import { fileURLToPath } from 'url';
import passport from './config/passport.js';

import { errorHandler } from './middleware/errorHandler.js';
import { ensureCsrfCookie, requireCsrf } from './middleware/csrf.js';
import { rateLimit } from './middleware/rateLimit.js';
import valkey from './lib/valkey.js';

// Route imports
import authRoutes from './routes/auth.routes.js';
import productRoutes from './routes/product.routes.js';
import categoryRoutes from './routes/category.routes.js';
import cartRoutes from './routes/cart.routes.js';
import orderRoutes from './routes/order.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import userRoutes from './routes/user.routes.js';
import adminRoutes from './routes/admin.routes.js';
import uploadRoutes from './routes/upload.routes.js';
import returnsRoutes from './routes/returns.routes.js';
import supportRoutes from './routes/support.routes.js';
import serviceOrderRoutes from './routes/serviceOrder.routes.js';

import * as paymentController from './controllers/payment.controller.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const sessionSecret = process.env.SESSION_SECRET || (process.env.NODE_ENV !== 'production' ? 'dev-session-secret' : '');
const redisUrl = process.env.VALKEY_URL || process.env.REDIS_URL;

if (!sessionSecret) {
  throw new Error('SESSION_SECRET must be set in production');
}

if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// ================================
// SECURITY MIDDLEWARE
// ================================
const allowedOrigins = [
  process.env.CLIENT_URL?.replace(/\/$/, ''),
  process.env.ADMIN_URL?.replace(/\/$/, ''),
  'http://localhost:5173',
  'http://localhost:5174'
].filter(Boolean);

console.log('✔ Configuring CORS for origins:', allowedOrigins);

app.use(helmet());

if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    const proto = req.headers['x-forwarded-proto'];
    if (req.secure || proto === 'https') return next();
    return res.redirect(301, `https://${req.headers.host}${req.originalUrl}`);
  });
}

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      console.warn(`✖ CORS blocked request from origin: ${origin}`);
      const corsError = new Error('CORS blocked: This origin is not allowed to access the API');
      corsError.statusCode = 403;
      callback(corsError);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'X-CSRF-Token'],
}));

// ================================
// PAYMENTS WEBHOOK (MUST BE BEFORE express.json)
// ================================
app.post('/api/payments/webhook', express.raw({ type: 'application/json' }), paymentController.razorpayWebhook);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// ================================
// SESSION
// ================================
import RedisStore from 'connect-redis';
import PgSession from 'connect-pg-simple';
import pkg from 'pg';
const { Pool } = pkg;
const PgStore = PgSession(session);

let sessionStore;
// Only use RedisStore if valkey is initialized and not in a permanently closed state
if (redisUrl && valkey && valkey.status !== 'end' && valkey.status !== 'closed') {
  console.log('✔ Redis/Valkey session storage enabled (Status:', valkey.status, ')');
  sessionStore = new RedisStore({ client: valkey, prefix: 'sess:' });
} else if (process.env.DATABASE_URL) {
  console.log('✔ Redis/Valkey not available, using PostgreSQL for session storage');
  sessionStore = new PgStore({
    pool: new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    }),
    tableName: 'session',
    createTableIfMissing: true
  });
}

if (sessionStore) {
  sessionStore.on('error', (err) => {
    console.error('✖ Session store error:', err.message);
  });
}

const sessionOptions = {
  secret: sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  },
  ...(sessionStore ? { store: sessionStore } : {}),
};

app.use(session(sessionOptions));
app.use(passport.initialize());
app.use(passport.session());

// ================================
// LOGGING
// ================================
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// ================================
// RATE LIMITING
// ================================
app.use('/api', rateLimit({ max: 100, windowSec: 60 }));
app.use('/api/auth/login', rateLimit({ max: 5, windowSec: 60, keyPrefix: 'rl:auth' }));
app.use('/api/auth/register', rateLimit({ max: 5, windowSec: 60, keyPrefix: 'rl:auth' }));

app.use('/api', ensureCsrfCookie);
app.use('/api', requireCsrf);

// ================================
// ROUTES
// ================================
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    service: 'photowala-backend',
    message: 'Service is live',
    health: '/api/health'
  });
});

app.get('/api', (req, res) => {
  res.status(200).json({
    success: true,
    service: 'photowala-backend',
    message: 'API is live',
    health: '/api/health',
  });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/csrf', (req, res) => {
  res.json({ success: true, token: req.cookies?.csrf_token || null });
});

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/returns', returnsRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/service-orders', serviceOrderRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

app.use(errorHandler);

export default app;
