const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

// Define the permissions based on your enum
const permissions = [
  "create_brand",
  "update_brand",
  "delete_brand",
  "view_brand",

  "create_brand_social",
  "update_brand_social",
  "delete_brand_social",
  "view_brand_social",

  "create_item",
  "update_item",
  "delete_item",
  "view_item",

  "create_comment",
  "update_comment",
  "delete_comment",
  "view_comment",

  "create_resource",
  "delete_resource",
  "view_resource",

  "create_brand_resource",
  "delete_brand_resource",
  "view_brand_resource",

  "create_blog",
  "update_blog",
  "delete_blog",
  "view_blog",

  "create_blog_gallery",
  "delete_blog_gallery",
  "view_blog_gallery",

  "create_event",
  "update_event",
  "delete_event",
  "view_event",

  "create_event_gallery",
  "delete_event_gallery",
  "view_event_gallery",

  "create_user",
  "update_user",
  "delete_user",
  "view_user",

  "create_website_social",
  "update_website_social",
  "delete_website_social",
  "view_website_social",

  "create_form",
  "update_form",
  "delete_form",
  "view_form",

  "create_form_response",
  "delete_form_response",
  "view_form_response",

  "create_role",
  "update_role",
  "delete_role",
  "view_role",

  "create_home",
  "update_home",
  "delete_home",
  "view_home",

  "view_contact_me",
  "delete_contact_me",
];

const seedDatabase = async () => {
  try {
    console.log("🌱 Seeding permissions...");

    // Upsert permissions
    const permissionRecords = await Promise.all(
      permissions.map(async (perm) => {
        return prisma.permissions.upsert({
          where: { name: perm },
          update: {},
          create: { name: perm },
        });
      })
    );

    console.log("✅ Permissions seeded!");

    // Create the Admin role with all permissions
    console.log("🌱 Seeding Admin role...");

    const adminRole = await prisma.role.upsert({
      where: { name: "Admin" },
      update: {},
      create: {
        name: "Admin",
        permissions: {
          connect: permissionRecords.map((perm) => ({ id: perm.id })),
        },
      },
    });

    console.log("✅ Admin role seeded!");

    // Hash password for user
    const hashedPassword = await bcrypt.hash("amanj2025", 10);

    // Create the Admin user
    console.log("🌱 Seeding Admin user...");

    await prisma.user.upsert({
      where: { email: "amangshkurxdr@gmail.com" },
      update: {},
      create: {
        name: "Amanj",
        username: "Amanj01",
        email: "amangshkurxdr@gmail.com",
        password: hashedPassword, // Hashed password
        role: { connect: { id: adminRole.id } }, // Assign Admin role
      },
    });

    console.log("✅ Admin user seeded!");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
  } finally {
    await prisma.$disconnect();
  }
};

// Run the seed function
seedDatabase();
