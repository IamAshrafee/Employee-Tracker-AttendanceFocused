import {
  format,
  parse,
  differenceInMinutes,
  addMinutes,
  startOfDay,
} from "date-fns";
import { Attendance } from "../models/Attendance.js";
import { SystemSettings } from "../models/SystemSettings.js";
import { RestDay } from "../models/RestDay.js";
import { User } from "../models/User.js";

/**
 * Get current date in YYYY-MM-DD format
 */
export const getCurrentDate = () => {
  return format(new Date(), "yyyy-MM-dd");
};

/**
 * Parse time string (HH:mm) and combine with date
 */
export const parseTimeWithDate = (date, timeString) => {
  const [hours, minutes] = timeString.split(":").map(Number);
  const dateObj = new Date(date);
  dateObj.setHours(hours, minutes, 0, 0);
  return dateObj;
};

/**
 * Check if user has rest day today
 */
export const isRestDayToday = async (userId, date) => {
  const month = format(new Date(date), "yyyy-MM");
  const restDay = await RestDay.findOne({ userId, month });

  if (!restDay) return false;

  return (
    restDay.selectedDates.includes(date) ||
    restDay.emergencyOffDates.some((off) => off.date === date)
  );
};

/**
 * Process duty in
 */
export const processDutyIn = async (userId, deviceId, isOffline = false) => {
  try {
    const currentDate = getCurrentDate();
    const now = new Date();

    // Check if user has rest day
    const hasRestDay = await isRestDayToday(userId, currentDate);
    if (hasRestDay) {
      throw new Error("You have a rest day today. Cannot duty in.");
    }

    // Check if user is locked
    const user = await User.findById(userId);
    if (user.status === "locked") {
      throw new Error(
        "Your account is locked. Please contact your team leader.",
      );
    }

    // Get system settings
    const settings = await SystemSettings.findOne();
    const jobStartTime = parseTimeWithDate(currentDate, settings.jobStartTime);
    const graceTime = addMinutes(jobStartTime, settings.graceMinutes);
    const earlyAllowedTime = addMinutes(
      jobStartTime,
      -settings.earlyDutyInMaxMinutes,
    );

    // Check if too early
    if (now < earlyAllowedTime) {
      throw new Error(
        `You can only duty in ${settings.earlyDutyInMaxMinutes} minutes before job start time.`,
      );
    }

    // Check if attendance already exists
    let attendance = await Attendance.findOne({ userId, date: currentDate });

    if (attendance && attendance.dutyIn.time) {
      throw new Error("You have already marked duty in for today.");
    }

    // Calculate late status
    const isLate = now > graceTime;
    const lateMinutes = isLate ? differenceInMinutes(now, jobStartTime) : 0;

    // Create or update attendance
    if (!attendance) {
      attendance = new Attendance({
        userId,
        date: currentDate,
      });
    }

    attendance.dutyIn = {
      time: now,
      isLate,
      lateMinutes,
      device: deviceId,
      isOffline,
    };
    attendance.status = "present";

    await attendance.save();

    return {
      success: true,
      message: isLate
        ? `Duty in marked. You are ${lateMinutes} minutes late.`
        : "Duty in marked successfully.",
      attendance,
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Process duty out
 */
export const processDutyOut = async (userId, deviceId, isOffline = false) => {
  try {
    const currentDate = getCurrentDate();
    const now = new Date();

    // Check if attendance exists
    const attendance = await Attendance.findOne({ userId, date: currentDate });

    if (!attendance || !attendance.dutyIn.time) {
      throw new Error("You have not marked duty in yet.");
    }

    if (attendance.dutyOut.time) {
      throw new Error("You have already marked duty out for today.");
    }

    // Get system settings
    const settings = await SystemSettings.findOne();
    const jobEndTime = parseTimeWithDate(currentDate, settings.jobEndTime);
    const lateAllowedTime = addMinutes(
      jobEndTime,
      settings.lateDutyOutMaxMinutes,
    );

    // Check if too late
    if (now > lateAllowedTime) {
      // Lock user
      await User.findByIdAndUpdate(userId, {
        status: "locked",
        lockReason: "Missed duty out deadline",
      });

      throw new Error(
        "Duty out deadline passed. Your account has been locked. Contact your team leader.",
      );
    }

    // Calculate late status
    const isLate = now > jobEndTime;
    const lateMinutes = isLate ? differenceInMinutes(now, jobEndTime) : 0;

    // Calculate working minutes (from job start time, not actual duty in)
    const jobStartTime = parseTimeWithDate(currentDate, settings.jobStartTime);
    const actualEndTime = now > jobEndTime ? jobEndTime : now; // No overtime
    const workingMinutes = differenceInMinutes(actualEndTime, jobStartTime);

    attendance.dutyOut = {
      time: now,
      isLate,
      lateMinutes,
      device: deviceId,
      isOffline,
      autoClosedBySystem: false,
    };
    attendance.workingMinutes = Math.max(0, workingMinutes);

    await attendance.save();

    return {
      success: true,
      message: "Duty out marked successfully.",
      attendance,
      workingHours: (workingMinutes / 60).toFixed(2),
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Auto-close attendance at midnight (called by cron)
 */
export const autoCloseAttendance = async () => {
  try {
    const currentDate = getCurrentDate();
    const settings = await SystemSettings.findOne();

    // Find all attendance records with duty in but no duty out
    const openAttendances = await Attendance.find({
      date: currentDate,
      "dutyIn.time": { $exists: true, $ne: null },
      "dutyOut.time": { $exists: true, $eq: null },
    });

    const jobStartTime = parseTimeWithDate(currentDate, settings.jobStartTime);
    const jobEndTime = parseTimeWithDate(currentDate, settings.jobEndTime);

    for (const attendance of openAttendances) {
      // Calculate working minutes until job end time
      const workingMinutes = differenceInMinutes(jobEndTime, jobStartTime);

      attendance.dutyOut = {
        time: new Date(),
        isLate: false,
        lateMinutes: 0,
        device: "system",
        autoClosedBySystem: true,
        isOffline: false,
      };
      attendance.workingMinutes = Math.max(0, workingMinutes);

      await attendance.save();
    }

    console.log(`✅ Auto-closed ${openAttendances.length} attendance records`);
  } catch (error) {
    console.error("Auto-close attendance error:", error);
  }
};

/**
 * Check and mark absent (called by cron)
 */
export const checkAndMarkAbsent = async () => {
  try {
    const currentDate = getCurrentDate();
    const now = new Date();
    const settings = await SystemSettings.findOne();

    const jobStartTime = parseTimeWithDate(currentDate, settings.jobStartTime);
    const absentThreshold = addMinutes(
      jobStartTime,
      settings.autoAbsentAfterHours * 60,
    );

    // Only mark absent if threshold has passed
    if (now < absentThreshold) {
      return;
    }

    // Find users without attendance today
    const allUsers = await User.find({ role: "employee", status: "active" });

    for (const user of allUsers) {
      // Check if user has rest day
      const hasRestDay = await isRestDayToday(user._id, currentDate);
      if (hasRestDay) continue;

      // Check if attendance exists
      const attendance = await Attendance.findOne({
        userId: user._id,
        date: currentDate,
      });

      if (!attendance || !attendance.dutyIn.time) {
        // Mark absent
        await Attendance.findOneAndUpdate(
          { userId: user._id, date: currentDate },
          {
            userId: user._id,
            date: currentDate,
            status: "absent",
            workingMinutes: 0,
          },
          { upsert: true, new: true },
        );
      }
    }

    console.log("✅ Checked and marked absent employees");
  } catch (error) {
    console.error("Check absent error:", error);
  }
};

/**
 * Check and lock users who missed duty out (called by cron)
 */
export const checkAndLockMissedDutyOut = async () => {
  try {
    const currentDate = getCurrentDate();
    const now = new Date();
    const settings = await SystemSettings.findOne();

    const jobEndTime = parseTimeWithDate(currentDate, settings.jobEndTime);
    const lockThreshold = addMinutes(
      jobEndTime,
      settings.lateDutyOutMaxMinutes,
    );

    // Only lock if threshold has passed
    if (now < lockThreshold) {
      return;
    }

    // Find attendance records with duty in but no duty out
    const openAttendances = await Attendance.find({
      date: currentDate,
      "dutyIn.time": { $exists: true, $ne: null },
      "dutyOut.time": { $exists: true, $eq: null },
    });

    for (const attendance of openAttendances) {
      // Lock user
      await User.findByIdAndUpdate(attendance.userId, {
        status: "locked",
        lockReason: "Missed duty out deadline",
      });
    }

    console.log(
      `🔒 Locked ${openAttendances.length} users for missed duty out`,
    );
  } catch (error) {
    console.error("Check lock error:", error);
  }
};
