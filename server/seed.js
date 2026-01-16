import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { User } from "./src/models/User.js";
import { SystemSettings } from "./src/models/SystemSettings.js";
import { config } from "./src/config/index.js";

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.mongoUri);
    console.log("✅ Connected to MongoDB");

    // Create admin user
    const adminExists = await User.findOne({ email: "admin@test.com" });

    if (!adminExists) {
      const hashedPassword = await bcrypt.hash("admin123", 10);

      await User.create({
        email: "admin@test.com",
        password: hashedPassword,
        name: "Admin User",
        role: "admin",
      });

      console.log("✅ Admin user created");
      console.log("   Email: admin@test.com");
      console.log("   Password: admin123");
    } else {
      console.log("ℹ️  Admin user already exists");
    }

    // Create team leader
    const leaderExists = await User.findOne({ email: "leader@test.com" });

    if (!leaderExists) {
      const hashedPassword = await bcrypt.hash("leader123", 10);

      await User.create({
        email: "leader@test.com",
        password: hashedPassword,
        name: "Team Leader",
        role: "team_leader",
      });

      console.log("✅ Team leader created");
      console.log("   Email: leader@test.com");
      console.log("   Password: leader123");
    } else {
      console.log("ℹ️  Team leader already exists");
    }

    // Create employee
    const employeeExists = await User.findOne({ email: "employee@test.com" });

    if (!employeeExists) {
      const hashedPassword = await bcrypt.hash("employee123", 10);

      await User.create({
        email: "employee@test.com",
        password: hashedPassword,
        name: "John Doe",
        role: "employee",
      });

      console.log("✅ Employee created");
      console.log("   Email: employee@test.com");
      console.log("   Password: employee123");
    } else {
      console.log("ℹ️  Employee already exists");
    }

    // Create default system settings
    const settingsExists = await SystemSettings.findOne();

    if (!settingsExists) {
      await SystemSettings.create({
        jobStartTime: "09:00",
        jobEndTime: "17:00",
        graceMinutes: 10,
        earlyDutyInMaxMinutes: 30,
        lateDutyOutMaxMinutes: 30,
        maxBreakMinutesPerDay: 60,
        restDaysPerMonth: 4,
        maxRestDaysPerDatePerTeam: 4,
        autoAbsentAfterHours: 3,
      });

      console.log("✅ System settings created");
      console.log("   Job time: 09:00 - 17:00");
      console.log("   Grace period: 10 minutes");
    } else {
      console.log("ℹ️  System settings already exist");
    }

    console.log("\n🎉 Database seeding completed!");
    console.log("\n📝 Test Credentials:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("Admin:");
    console.log("  Email: admin@test.com");
    console.log("  Password: admin123");
    console.log("\nTeam Leader:");
    console.log("  Email: leader@test.com");
    console.log("  Password: leader123");
    console.log("\nEmployee:");
    console.log("  Email: employee@test.com");
    console.log("  Password: employee123");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding error:", error);
    process.exit(1);
  }
};

seedDatabase();
