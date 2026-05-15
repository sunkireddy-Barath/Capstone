require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function seed() {
  console.log('Seeding database...');

  const country = await prisma.country.upsert({
    where: { code: 'IN' },
    update: {},
    create: { name: 'India', code: 'IN' },
  });
  console.log(`Country: ${country.name}`);

  const adminPassword = await bcrypt.hash('Admin@123456', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@villageapi.in' },
    update: {},
    create: {
      email: 'admin@villageapi.in',
      password: adminPassword,
      name: 'Platform Admin',
      company: 'Village API Platform',
      role: 'ADMIN',
      planType: 'UNLIMITED',
    },
  });
  console.log(`Admin user: ${admin.email}`);

  console.log('✅ Seed complete.');
}

seed()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
