const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seeder...');

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

  // ==================== ABOUT SEEDER ====================
  console.log('📝 Creating about data...');

  // Check if about data already exists
  let aboutData = await prisma.about.findFirst();
  if (!aboutData) {
    aboutData = await prisma.about.create({
      data: {
        title: "Our Story",
        description: "Zaga Mall opened its doors in 2018 with a vision to create more than just a shopping center—we wanted to build a community hub where people could shop, dine, and be entertained all in one place. What started as a local shopping center has grown into one of the region's premier retail destinations, featuring over 200 stores, restaurants, and entertainment venues spread across three levels. Our commitment to providing an exceptional shopping experience has made us a favorite among locals and tourists alike. We continue to evolve and bring in new brands and experiences to delight our visitors.",
        image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=600&fit=crop",
        factsAndFigures: {
          create: [
            { number: "50+", description: "Stores & Restaurants" },
            { number: "2,000+", description: "Parking Spaces" },
            { number: "1M+", description: "Annual Visitors" },
            { number: "50+", description: "Employees" }
          ]
        },
        ourValues: {
          create: [
            { 
              title: "Community", 
              description: "We strive to be more than a mall—we're a gathering place for the community to connect and create memories." 
            },
            { 
              title: "Quality", 
              description: "We curate a selection of high-quality retailers and experiences to ensure visitor satisfaction." 
            },
            { 
              title: "Innovation", 
              description: "We continuously evolve our offerings and spaces to meet the changing needs of our visitors." 
            },
            { 
              title: "Sustainability", 
              description: "We're committed to environmentally responsible practices throughout our operations." 
            }
          ]
        }
      },
      include: {
        factsAndFigures: true,
        ourValues: true
      }
    });
    console.log('✅ Created about data');
  } else {
    console.log('ℹ️ About data already exists');
  }

  console.log('🎉 Seeder completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeder error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 