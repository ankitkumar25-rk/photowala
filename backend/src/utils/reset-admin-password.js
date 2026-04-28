require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

const bcrypt = require('bcryptjs');
const prisma = require('../config/database');

async function main() {
  const email = process.argv[2] || 'admin@manufact.in';
  const newPassword = process.argv[3] || 'Admin@1234';

  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL must be set before running this script');
  }

  if (!email || !newPassword) {
    throw new Error('Usage: node src/utils/reset-admin-password.js <email> <newPassword>');
  }

  console.log(`Resetting password for ${email}...`);

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, role: true },
  });

  if (!user) {
    throw new Error(`User not found: ${email}`);
  }

  const passwordHash = await bcrypt.hash(newPassword, 12);

  await prisma.user.update({
    where: { email },
    data: {
      passwordHash,
      isEmailVerified: true,
    },
  });

  console.log(`Done. Password reset for ${user.email}.`);
}

main()
  .catch((err) => {
    console.error('Password reset failed:', err.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });