const bcrypt = require("bcryptjs");
const prisma = require("./config/prismaClient");

async function createAdminUser() {
  try {
    console.log("🔐 Creating admin user...");

    const adminEmail = "admin@example.com";
    const adminPassword = "admin123";

    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail },
    });

    if (existingAdmin) {
      console.log(
        "👤 Admin user already exists, updating role and password..."
      );

      // Hash new password
      const hashedPassword = await bcrypt.hash(adminPassword, 12);

      // Update existing user to admin with new password
      const updatedUser = await prisma.user.update({
        where: { email: adminEmail },
        data: {
          role: "ADMIN",
          password: hashedPassword,
        },
        select: { id: true, name: true, email: true, role: true },
      });

      console.log("✅ Admin user updated:", updatedUser);
      return updatedUser;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(adminPassword, 12);

    // Create admin user
    const adminUser = await prisma.user.create({
      data: {
        name: "System Administrator",
        email: adminEmail,
        password: hashedPassword,
        role: "ADMIN",
      },
      select: { id: true, name: true, email: true, role: true },
    });

    console.log("✅ Admin user created successfully:", adminUser);
    console.log("📧 Email:", adminEmail);
    console.log("🔑 Password:", adminPassword);

    return adminUser;
  } catch (error) {
    console.error("❌ Error creating admin user:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Also create a regular test user
async function createTestUser() {
  try {
    console.log("👤 Creating test user...");

    const userEmail = "user@example.com";
    const userPassword = "user123";

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: userEmail },
    });

    if (existingUser) {
      console.log("👤 Test user already exists");
      return existingUser;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(userPassword, 12);

    // Create test user
    const testUser = await prisma.user.create({
      data: {
        name: "Test User",
        email: userEmail,
        password: hashedPassword,
        role: "USER",
      },
      select: { id: true, name: true, email: true, role: true },
    });

    console.log("✅ Test user created successfully:", testUser);
    console.log("📧 Email:", userEmail);
    console.log("🔑 Password:", userPassword);

    return testUser;
  } catch (error) {
    console.error("❌ Error creating test user:", error);
    throw error;
  }
}

async function main() {
  console.log("🚀 Setting up admin and test users...\n");

  await createAdminUser();
  console.log("");
  await createTestUser();

  console.log("\n🎉 Setup completed!");
  console.log("\n📋 Login credentials:");
  console.log("Admin: admin@example.com / admin123");
  console.log("User:  user@example.com / user123");
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { createAdminUser, createTestUser };
