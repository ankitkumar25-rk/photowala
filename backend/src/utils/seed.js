/**
 * Database seed: creates realistic premium gifting, mementos & trophies catalog
 * Run with: node src/utils/seed.js
 */
import 'dotenv/config';
import prisma from '../lib/prisma.js';
import bcrypt from 'bcryptjs';

const categories = [
  { name: 'TROPHIES', slug: 'trophies', description: 'Premium trophies for awards and recognition' },
  { name: '3D_MODELS', slug: '3d-models', description: 'Intricate 3D models and sculptures' },
  { name: 'CORPORATE_GIFTS', slug: 'corporate-gifts', description: 'Badges, IDs, and general corporate gifting items' },
  { name: 'MOMENTOS', slug: 'momentos', description: 'Elegant glass and crystal mementos' },
  { name: 'OTHERS', slug: 'others', description: 'Other versatile gift items' },
  { name: 'PEN_HOLDERS', slug: 'pen-holders', description: 'Custom desktop pen holders' },
  { name: 'TEMPLES', slug: 'temples', description: 'Miniature temple replicas and artifacts' }
];

async function main() {
  console.log('🏆 Seeding database with Trophies & Gifts...');

  // Create admin user
  const adminHash = await bcrypt.hash('Admin@1234', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@manufact.in' },
    update: {},
    create: {
      name: 'Admin',
      email: 'admin@manufact.in',
      passwordHash: adminHash,
      role: 'SUPER_ADMIN',
      isEmailVerified: true,
    },
  });
  console.log('✅ Admin user created:', admin.email);

  // Create demo customer
  const customerHash = await bcrypt.hash('Customer@1234', 12);
  await prisma.user.upsert({
    where: { email: 'customer@example.com' },
    update: {},
    create: {
      name: 'Corporate Buyer',
      email: 'customer@example.com',
      passwordHash: customerHash,
      phone: '9876543210',
      isEmailVerified: true,
    },
  });
  console.log('✅ Demo customer created');

  // Create categories
  const createdCategories = {};
  for (const cat of categories) {
    const created = await prisma.category.upsert({
      where: { name: cat.name },
      update: { description: cat.description, slug: cat.slug },
      create: cat,
    });
    createdCategories[cat.slug] = created.id;
  }
  console.log('✅ Categories created/updated:', Object.keys(createdCategories).length);

  // Create exactly 19 products
  const products = [
    { name: 'Golden Shield Excellence Award Plaque', slug: 'golden-shield-excellence-award-plaque', categorySlug: 'trophies', price: 1850, mrp: 2200, stock: 150, unit: 'piece', isFeatured: true, tags: ['award', 'shield', 'gold'] },
    { name: 'Geometric Crystal Tower Achievement Award', slug: 'geometric-crystal-tower-achievement-award', categorySlug: 'trophies', price: 950, mrp: 1200, stock: 80, unit: 'piece', tags: ['crystal', 'tower'] },
    { name: 'Star Performer Blue Glass Trophy', slug: 'star-performer-blue-glass-trophy', categorySlug: 'trophies', price: 1200, mrp: 1500, stock: 100, unit: 'piece', isFeatured: true, tags: ['glass', 'star', 'blue'] },
    { name: 'Premium Leadership Metal Cup', slug: 'premium-leadership-metal-cup', categorySlug: 'trophies', price: 3400, mrp: 4000, stock: 12, unit: 'piece', tags: ['metal', 'cup'] },
    { name: 'Wooden Base Acrylic Recognition Trophy', slug: 'wooden-base-acrylic-recognition-trophy', categorySlug: 'trophies', price: 750, mrp: 900, stock: 45, unit: 'piece', tags: ['acrylic', 'wood'] },
    { name: 'Corporate Office 3D Architecture Model', slug: 'corporate-office-3d-architecture-model', categorySlug: '3d-models', price: 14500, mrp: 16000, stock: 5, unit: 'piece', tags: ['3d', 'model', 'office'] },
    { name: 'Bronze Engine Replica Model', slug: 'bronze-engine-replica-model', categorySlug: '3d-models', price: 8500, mrp: 10000, stock: 8, unit: 'piece', tags: ['bronze', 'replica'] },
    { name: 'Miniature Ship 3D Keepsake', slug: 'miniature-ship-3d-keepsake', categorySlug: '3d-models', price: 3200, mrp: 4000, stock: 15, unit: 'piece', tags: ['ship', 'keepsake'] },
    { name: 'Executive Gold Plated Lapel Pin', slug: 'executive-gold-plated-lapel-pin', categorySlug: 'corporate-gifts', price: 450, mrp: 600, stock: 500, unit: 'piece', tags: ['lapel', 'badge'] },
    { name: 'Custom Engraved Name Plate (Metal)', slug: 'custom-engraved-name-plate-metal', categorySlug: 'corporate-gifts', price: 1200, mrp: 1500, stock: 50, unit: 'piece', tags: ['name-plate', 'engraved'] },
    { name: 'Premium Leather Corporate Gift Set', slug: 'premium-leather-corporate-gift-set', categorySlug: 'corporate-gifts', price: 2500, mrp: 3000, stock: 35, unit: 'piece', isFeatured: true, tags: ['leather', 'gift-set'] },
    { name: 'Crystal Diamond Anniversary Momento', slug: 'crystal-diamond-anniversary-momento', categorySlug: 'momentos', price: 2100, mrp: 2600, stock: 40, unit: 'piece', tags: ['diamond', 'crystal'] },
    { name: 'Employee of the Month Wooden Momento', slug: 'employee-of-the-month-wooden-momento', categorySlug: 'momentos', price: 850, mrp: 1100, stock: 120, unit: 'piece', tags: ['wooden', 'momento'] },
    { name: 'Silver Jubilee Celebration Photo Frame Momento', slug: 'silver-jubilee-celebration-photo-frame-momento', categorySlug: 'momentos', price: 3000, mrp: 3500, stock: 20, unit: 'piece', tags: ['silver', 'frame'] },
    { name: 'Rosewood Executive Pen Holder', slug: 'rosewood-executive-pen-holder', categorySlug: 'pen-holders', price: 650, mrp: 800, stock: 85, unit: 'piece', tags: ['rosewood', 'pen-holder'] },
    { name: 'Marble Base Multi-Pen Stand with Clock', slug: 'marble-base-multi-pen-stand-with-clock', categorySlug: 'pen-holders', price: 1500, mrp: 1800, stock: 30, unit: 'piece', tags: ['marble', 'clock'] },
    { name: 'Miniature Brass Kedar Dome Temple', slug: 'miniature-brass-kedar-dome-temple', categorySlug: 'temples', price: 4500, mrp: 5200, stock: 10, unit: 'piece', tags: ['temple', 'brass'], isFeatured: true },
    { name: 'Wooden Carved Desktop Mandir', slug: 'wooden-carved-desktop-mandir', categorySlug: 'temples', price: 2100, mrp: 2800, stock: 25, unit: 'piece', tags: ['wooden', 'carved'] },
    { name: 'Personalized Silver Cufflinks', slug: 'personalized-silver-cufflinks', categorySlug: 'others', price: 1800, mrp: 2400, stock: 30, unit: 'piece', tags: ['cufflinks', 'silver'] }
  ];

  let productCount = 0;
  for (const p of products) {
    const { categorySlug, ...data } = p;
    await prisma.product.upsert({
      where: { slug: data.slug },
      update: {
        price: data.price,
        stock: data.stock,
        categoryId: createdCategories[categorySlug]
      },
      create: {
        ...data,
        shortDesc: `Premium ${data.name.toLowerCase()} for the finest recognition.`,
        description: `This exquisite ${data.name} is crafted from the highest quality materials, perfect for corporate gifting and lasting mementos. Featuring elegant styling and precision finishes, it is an impressive centerpiece for any collection.`,
        categoryId: createdCategories[categorySlug],
        certifications: ['ISO 9001:2015'],
        lowStockAlert: 5
      },
    });
    productCount++;
  }

  console.log(`✅ Products seeded: ${productCount}`);
  console.log('\n🎉 Seed complete!');
  console.log('   Admin: admin@manufact.in / Admin@1234');
  console.log('   Customer: customer@example.com / Customer@1234');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
