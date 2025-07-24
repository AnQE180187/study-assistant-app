const prisma = require("../config/prismaClient");

async function updateUserRoles() {
  try {
    console.log("Starting user role migration...");

    // First, let's see what roles exist in the database
    const allUsers = await prisma.$runCommandRaw({
      find: "User",
      filter: {},
      projection: { role: 1 },
    });

    console.log(
      "Current users in database:",
      allUsers.cursor.firstBatch.length
    );

    // Count roles
    const roleCounts = {};
    allUsers.cursor.firstBatch.forEach((user) => {
      roleCounts[user.role] = (roleCounts[user.role] || 0) + 1;
    });

    console.log("Current role distribution:", roleCounts);

    // Update roles using MongoDB updateMany
    const adminUpdate = await prisma.$runCommandRaw({
      update: "User",
      updates: [
        {
          q: { role: "admin" },
          u: { $set: { role: "ADMIN" } },
          multi: true,
        },
      ],
    });

    const studentUpdate = await prisma.$runCommandRaw({
      update: "User",
      updates: [
        {
          q: { role: "student" },
          u: { $set: { role: "USER" } },
          multi: true,
        },
      ],
    });

    const teacherUpdate = await prisma.$runCommandRaw({
      update: "User",
      updates: [
        {
          q: { role: "teacher" },
          u: { $set: { role: "USER" } },
          multi: true,
        },
      ],
    });

    console.log("Migration results:");
    console.log("- Updated admin roles:", adminUpdate.nModified || 0);
    console.log("- Updated student roles:", studentUpdate.nModified || 0);
    console.log("- Updated teacher roles:", teacherUpdate.nModified || 0);

    // Show final role distribution
    const finalRoleCounts = await prisma.user.groupBy({
      by: ["role"],
      _count: {
        role: true,
      },
    });

    console.log("\nFinal role distribution:");
    finalRoleCounts.forEach((item) => {
      console.log(`- ${item.role}: ${item._count.role} users`);
    });

    console.log("\nMigration completed successfully!");
  } catch (error) {
    console.error("Error during migration:", error);
  } finally {
    await prisma.$disconnect();
  }
}

updateUserRoles();
