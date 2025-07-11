const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  // Create admin role if it doesn't exist
  let adminRole = await prisma.role.findFirst({ where: { name: 'admin' } });
  if (!adminRole) {
    adminRole = await prisma.role.create({
      data: {
        name: 'admin',
      },
    });
    console.log('Created admin role');
  } else {
    console.log('Admin role already exists');
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
    console.log('Created admin user:', adminEmail);
  } else {
    console.log('Admin user already exists:', adminEmail);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 