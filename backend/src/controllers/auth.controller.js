const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const prisma = require('../config/database');
const { signAccessToken, signRefreshToken, verifyToken } = require('../config/paseto');
const { sendEmail, emailTemplates } = require('../config/email');
const { createError } = require('../middleware/errorHandler');
const { z } = require('zod');

const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

// ── Validation Schemas ────────────────────────────────────────
const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(128),
  phone: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// ── Helpers ───────────────────────────────────────────────────
async function issueTokens(user) {
  const payload = { sub: user.id, email: user.email, role: user.role };
  const [accessToken, refreshToken] = await Promise.all([
    signAccessToken(payload),
    signRefreshToken(payload),
  ]);

  // Store refresh token in DB when the schema is available.
  // Login should still succeed if this persistence layer is unavailable.
  try {
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });
  } catch (err) {
    console.error('[auth] refresh token persistence failed:', err.message);
  }

  return { accessToken, refreshToken };
}

// ── Controllers ───────────────────────────────────────────────
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, phone } = registerSchema.parse(req.body);

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) throw createError('Email already registered', 409);

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { name, email, passwordHash, phone },
    });

    const { accessToken, refreshToken } = await issueTokens(user);

    // Send welcome email (non-blocking)
    const tpl = emailTemplates.welcomeEmail(user);
    sendEmail({ to: user.email, ...tpl }).catch(console.error);

    res.cookie('access_token', accessToken, COOKIE_OPTS);
    res.cookie('refresh_token', refreshToken, COOKIE_OPTS);

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: { accessToken, user: { id: user.id, name: user.name, email: user.email, role: user.role } },
    });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.passwordHash) throw createError('Invalid credentials', 401);

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw createError('Invalid credentials', 401);

    const { accessToken, refreshToken } = await issueTokens(user);

    res.cookie('access_token', accessToken, COOKIE_OPTS);
    res.cookie('refresh_token', refreshToken, COOKIE_OPTS);

    res.json({
      success: true,
      data: { accessToken, user: { id: user.id, name: user.name, email: user.email, role: user.role } },
    });
  } catch (err) {
    next(err);
  }
};

exports.logout = async (req, res, next) => {
  try {
    const token = req.cookies?.refresh_token;
    if (token) {
      await prisma.refreshToken.deleteMany({ where: { token } });
    }
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (err) {
    next(err);
  }
};

exports.refresh = async (req, res, next) => {
  try {
    const token = req.cookies?.refresh_token || req.body?.refreshToken;
    if (!token) throw createError('Refresh token required', 401);

    const payload = await verifyToken(token);
    if (payload.purpose !== 'refresh') throw createError('Invalid token', 401);

    const stored = await prisma.refreshToken.findUnique({ where: { token } });
    if (!stored || stored.expiresAt < new Date()) throw createError('Token expired', 401);

    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) throw createError('User not found', 401);

    // Rotate refresh token
    await prisma.refreshToken.delete({ where: { token } });
    const { accessToken, refreshToken: newRefreshToken } = await issueTokens(user);

    res.cookie('access_token', accessToken, COOKIE_OPTS);
    res.cookie('refresh_token', newRefreshToken, COOKIE_OPTS);

    res.json({ success: true, data: { accessToken } });
  } catch (err) {
    next(err);
  }
};

exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = z.object({ email: z.string().email() }).parse(req.body);

    const user = await prisma.user.findUnique({ where: { email } });
    // Always 200 to prevent email enumeration
    if (!user) return res.json({ success: true, message: 'If that email exists, a reset link was sent.' });

    // Invalidate old tokens
    await prisma.passwordResetToken.updateMany({ where: { userId: user.id, used: false }, data: { used: true } });

    const resetToken = uuidv4();
    await prisma.passwordResetToken.create({
      data: {
        token: resetToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 min
      },
    });

    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;
    const tpl = emailTemplates.passwordReset(user, resetUrl);
    await sendEmail({ to: user.email, ...tpl });

    res.json({ success: true, message: 'If that email exists, a reset link was sent.' });
  } catch (err) {
    next(err);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { token, password } = z.object({
      token: z.string().uuid(),
      password: z.string().min(8),
    }).parse(req.body);

    const resetRecord = await prisma.passwordResetToken.findUnique({ where: { token } });
    if (!resetRecord || resetRecord.used || resetRecord.expiresAt < new Date()) {
      throw createError('Reset link is invalid or has expired', 400);
    }

    const passwordHash = await bcrypt.hash(password, 12);
    await prisma.$transaction([
      prisma.user.update({ where: { id: resetRecord.userId }, data: { passwordHash } }),
      prisma.passwordResetToken.update({ where: { token }, data: { used: true } }),
      prisma.refreshToken.deleteMany({ where: { userId: resetRecord.userId } }), // revoke all sessions
    ]);

    res.json({ success: true, message: 'Password reset successfully. Please log in again.' });
  } catch (err) {
    next(err);
  }
};


exports.googleCallback = async (req, res, next) => {
  try {
    const user = req.user;
    const { accessToken, refreshToken } = await issueTokens(user);

    res.cookie('access_token', accessToken, COOKIE_OPTS);
    res.cookie('refresh_token', refreshToken, COOKIE_OPTS);

    res.redirect(`${process.env.CLIENT_URL}/auth/success`);
  } catch (err) {
    next(err);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, name: true, email: true, phone: true, role: true, avatarUrl: true, createdAt: true },
    });
    if (!user) throw createError('User not found', 404);
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};
