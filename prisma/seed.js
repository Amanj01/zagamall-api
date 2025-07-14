const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting auth seeder...');

  // ==================== AUTH SEEDER ====================
  console.log('🔐 Creating auth data...');

  // Create admin role if it doesn't exist
  let adminRole = await prisma.role.findFirst({ where: { name: 'admin' } });
  if (!adminRole) {
    adminRole = await prisma.role.create({
      data: {
        name: 'admin',
      },
    });
    console.log('✅ Created admin role');
  } else {
    console.log('ℹ️ Admin role already exists');
  }

  // Create admin user if it doesn't exist
  const adminEmail = 'admin@zagamall.com';
  const adminPassword = 'admin123';
  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  let adminUser = await prisma.user.findFirst({ where: { email: adminEmail } });
  if (!adminUser) {
    adminUser = await prisma.user.create({
      data: {
        name: 'Admin',
        email: adminEmail,
        password: hashedPassword,
        username: 'admin',
        role: { connect: { id: adminRole.id } },
      },
    });
    console.log('✅ Created admin user:', adminEmail);
    console.log('🔑 Password:', adminPassword);
  } else {
    console.log('ℹ️ Admin user already exists:', adminEmail);
  }

  console.log('🎉 Auth seeder completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeder error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 