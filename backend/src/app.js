const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const Redis = require('ioredis');
const RedisStore = require('connect-redis').default;
const path = require('path');
const passport = require('./config/passport');   // loads Google strategy

const { errorHandler } = require('./middleware/errorHandler');
const { rateLimiter } = require('./middleware/rateLimiter');
const { ensureCsrfCookie, requireCsrf } = require('./middleware/csrf');

// Route imports
const authRoutes = require('./routes/auth.routes');
const productRoutes = require('./routes/product.routes');
const categoryRoutes = require('./routes/category.routes');
const cartRoutes = require('./routes/cart.routes');
const orderRoutes = require('./routes/order.routes');
const paymentRoutes = require('./routes/payment.routes');
const userRoutes = require('./routes/user.routes');
const adminRoutes = require('./routes/admin.routes');
const uploadRoutes = require('./routes/upload.routes');
const returnsRoutes = require('./routes/returns.routes');
const supportRoutes = require('./routes/support.routes');
const serviceOrderRoutes = require('./routes/serviceOrder.routes');

const app = express();
const sessionSecret = process.env.SESSION_SECRET || (process.env.NODE_ENV !== 'production' ? 'dev-session-secret' : '');
const redisUrl = process.env.REDIS_URL;

if (!sessionSecret) {
  throw new Error('SESSION_SECRET must be set in production');
}

// Render (and similar platforms) terminate TLS at a proxy. Trusting the first
// proxy allows secure session cookies to work correctly behind HTTPS.
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
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      console.warn(`✖ CORS blocked request from origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'X-CSRF-Token'],
}));

// ================================
// PARSING MIDDLEWARE
// ================================
// Raw body needed for Razorpay webhook signature verification
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve local uploaded files
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// ================================
// SESSION (for Passport/Google OAuth)
// ================================
let sessionStore;
if (redisUrl) {
  const redis = new Redis(redisUrl, {
    enableOfflineQueue: true,
    maxRetriesPerRequest: 2,
    retryStrategy: (times) => Math.min(times * 200, 2000),
  });
  redis.on('error', (err) => {
    console.warn('[session] Redis error:', err?.message || err);
  });
  sessionStore = new RedisStore({ client: redis, prefix: 'sess:' });
}

const sessionOptions = {
  secret: sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
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
// Exempt OAuth routes from rate limiting (not direct user requests)
app.use('/api', (req, res, next) => {
  if (req.path === '/auth/google/callback' || req.path === '/auth/google') return next();
  rateLimiter(req, res, next);
});
app.use('/api', ensureCsrfCookie);
app.use('/api', requireCsrf);

// ================================
// ROUTES
// ================================
// Root URL landing page
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    service: 'photowala-backend',
    message: 'Service is live',
    health: '/api/health'
  });
});

// Base API entrypoint for health checks and browser testing
app.get('/api', (req, res) => {
  res.status(200).json({
    success: true,
    service: 'photowala-backend',
    message: 'API is live',
    health: '/api/health',
  });
});

// Explicit health check path
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// CSRF bootstrap endpoint (safe GET)
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

// ================================
// 404 HANDLER
// ================================
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});


// ================================
// GLOBAL ERROR HANDLER
// ================================
app.use(errorHandler);

module.exports = app;
