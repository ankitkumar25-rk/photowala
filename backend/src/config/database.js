// Prisma v7 handles connections internally for PostgreSQL.
// Only use adapters if using specialized drivers like pg-lite or edge functions.
const prisma = new PrismaClient();

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

module.exports = prisma;
