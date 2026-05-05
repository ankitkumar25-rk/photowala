require('dotenv').config();

function requireEnv(name, message) {
  const value = process.env[name];
  if (!value) {
    throw new Error(message || `${name} must be set`);
  }
  return value;
}

requireEnv('DATABASE_URL', 'DATABASE_URL must be set');
const pasetoSecret = requireEnv('PASETO_SECRET_KEY', 'PASETO_SECRET_KEY must be set');
if (pasetoSecret.length < 64) {
  throw new Error('PASETO_SECRET_KEY must be 64 hex chars (32 bytes)');
}

const app    = require('./src/app');
const prisma = require('./src/config/database');

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || (process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost');

async function main() {
  // Test DB connection
  try {
    await prisma.$connect();
    console.log('✅ PostgreSQL connected');
  } catch (err) {
    console.error('❌ Database connection failed:', err.message);
    console.error('   Make sure PostgreSQL is running and DATABASE_URL is correct in .env');
    process.exit(1);
  }

  const server = app.listen(PORT, HOST, () => {
    const publicUrl = process.env.PUBLIC_URL || `http://${HOST}:${PORT}`;
    console.log(`\n🚀 Server  → ${publicUrl}`);
    console.log(`📋 API     → ${publicUrl}/api`);
    console.log(`💚 Health  → ${publicUrl}/api/health`);
    console.log(`📦 Mode    → ${process.env.NODE_ENV || 'development'}\n`);
  });

  // Handle port-in-use gracefully
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`\n❌ Port ${PORT} is already in use!`);
      console.error(`   Stop the other process first, then run: npm run dev\n`);
      process.exit(1); // exit with error code so nodemon retries
    } else {
      throw err;
    }
  });


  // Graceful shutdown
  const shutdown = async (signal) => {
    console.log(`\n${signal} received. Shutting down gracefully...`);
    server.close(async () => {
      await prisma.$disconnect();
      console.log('✅ Server closed');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT',  () => shutdown('SIGINT'));
  process.on('uncaughtException', (err) => {
    console.error('💥 Uncaught Exception:', err);
    shutdown('UNCAUGHT_EXCEPTION');
  });
}

main();
