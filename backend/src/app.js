const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const path = require('path');
const passport = require('./config/passport');   // loads Google strategy

const { errorHandler } = require('./middleware/errorHandler');
const { rateLimiter } = require('./middleware/rateLimiter');

// Route imports
const authRoutes = require('./routes/auth.routes');
const productRoutes = require('./routes/product.routes');
const categoryRoutes = require('./routes/category.routes');
const cartRoutes = require('./routes/cart.routes');
const orderRoutes = require('./routes/order.routes');
const paymentRoutes = require('./routes/payment.routes');
const userRoutes = require('./routes/user.routes');
const adminRoutes   = require('./routes/admin.routes');
const uploadRoutes  = require('./routes/upload.routes');
const returnsRoutes = require('./routes/returns.routes');
const supportRoutes = require('./routes/support.routes');

const app = express();
const sessionSecret = process.env.SESSION_SECRET || (process.env.NODE_ENV !== 'production' ? 'dev-session-secret' : '');

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
app.use(helmet());
app.use(cors({
  origin: [
    process.env.CLIENT_URL || 'http://localhost:5173',
    process.env.ADMIN_URL  || 'http://localhost:5174',
  ],
  credentials: true,
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
app.use(session({
  secret: sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  },
}));
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
app.use('/api', rateLimiter);

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

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth',       authRoutes);
app.use('/api/products',   productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/cart',       cartRoutes);
app.use('/api/orders',     orderRoutes);
app.use('/api/payments',   paymentRoutes);
app.use('/api/users',      userRoutes);
app.use('/api/admin',      adminRoutes);
app.use('/api/uploads',    uploadRoutes);
app.use('/api/returns',    returnsRoutes);
app.use('/api/support',    supportRoutes);

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
