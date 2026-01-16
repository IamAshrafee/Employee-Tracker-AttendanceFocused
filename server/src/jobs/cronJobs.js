import cron from "node-cron";
import {
  autoCloseAttendance,
  checkAndMarkAbsent,
  checkAndLockMissedDutyOut,
} from "../services/attendanceService.js";

/**
 * Initialize all cron jobs
 */
export const initCronJobs = () => {
  // Auto-close attendance at 11:59 PM every day
  cron.schedule("59 23 * * *", async () => {
    console.log("🕐 Running auto-close attendance job...");
    await autoCloseAttendance();
  });

  // Check and mark absent every hour
  cron.schedule("0 * * * *", async () => {
    console.log("🕐 Running check absent job...");
    await checkAndMarkAbsent();
  });

  // Check and lock missed duty out every 30 minutes
  cron.schedule("*/30 * * * *", async () => {
    console.log("🕐 Running check lock job...");
    await checkAndLockMissedDutyOut();
  });

  console.log("⏰ Cron jobs initialized");
};
