require('dotenv').config();
const app    = require('./src/app');
const prisma = require('./src/config/database');

const PORT = process.env.PORT || 5000;

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

  const server = app.listen(PORT, () => {
    console.log(`\n🚀 Server  → http://localhost:${PORT}`);
    console.log(`📋 API     → http://localhost:${PORT}/api`);
    console.log(`💚 Health  → http://localhost:${PORT}/api/health`);
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
