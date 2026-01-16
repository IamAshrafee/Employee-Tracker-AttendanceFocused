import { format, differenceInMinutes } from "date-fns";
import { BreakLog } from "../models/BreakLog.js";
import { Attendance } from "../models/Attendance.js";
import { SystemSettings } from "../models/SystemSettings.js";

/**
 * Start a break
 */
export const startBreak = async (
  userId,
  attendanceId,
  breakType,
  isOffline = false,
) => {
  try {
    const now = new Date();

    // Check if attendance exists
    const attendance = await Attendance.findById(attendanceId);
    if (!attendance) {
      throw new Error("Attendance record not found");
    }

    if (!attendance.dutyIn.time) {
      throw new Error("You must duty in before taking a break");
    }

    if (attendance.dutyOut.time) {
      throw new Error("You have already marked duty out");
    }

    // Check if user already has an active break
    const activeBreak = await BreakLog.findOne({
      userId,
      attendanceId,
      isActive: true,
    });

    if (activeBreak) {
      throw new Error("You already have an active break. Please end it first.");
    }

    // Create break log
    const breakLog = await BreakLog.create({
      userId,
      attendanceId,
      date: attendance.date,
      breakType,
      breakOut: now,
      isOffline,
      isActive: true,
    });

    return {
      success: true,
      message: `${breakType} break started`,
      breakLog,
    };
  } catch (error) {
    throw error;
  }
};

/**
 * End a break
 */
export const endBreak = async (userId, breakId, isOffline = false) => {
  try {
    const now = new Date();

    // Find the break
    const breakLog = await BreakLog.findById(breakId);

    if (!breakLog) {
      throw new Error("Break not found");
    }

    if (breakLog.userId.toString() !== userId.toString()) {
      throw new Error("Unauthorized");
    }

    if (!breakLog.isActive) {
      throw new Error("Break is already ended");
    }

    // Calculate duration
    const duration = differenceInMinutes(now, breakLog.breakOut);

    // Update break log
    breakLog.breakIn = now;
    breakLog.durationMinutes = duration;
    breakLog.isActive = false;

    await breakLog.save();

    // Check total break time for the day
    const totalBreakTime = await getTotalBreakMinutes(userId, breakLog.date);
    const settings = await SystemSettings.findOne();

    let warning = null;
    if (totalBreakTime > settings.maxBreakMinutesPerDay) {
      warning = `You have exceeded your daily break limit of ${settings.maxBreakMinutesPerDay} minutes. Total: ${totalBreakTime} minutes`;
    }

    return {
      success: true,
      message: "Break ended successfully",
      breakLog,
      duration: `${duration} minutes`,
      totalBreakToday: `${totalBreakTime} minutes`,
      warning,
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Get total break minutes for a day
 */
export const getTotalBreakMinutes = async (userId, date) => {
  const breaks = await BreakLog.find({
    userId,
    date,
    isActive: false, // Only count completed breaks
  });

  return breaks.reduce((total, brk) => total + (brk.durationMinutes || 0), 0);
};

/**
 * Get today's breaks for a user
 */
export const getTodayBreaks = async (userId, date) => {
  const breaks = await BreakLog.find({
    userId,
    date,
  }).sort({ breakOut: -1 });

  const totalMinutes = await getTotalBreakMinutes(userId, date);
  const settings = await SystemSettings.findOne();

  return {
    breaks,
    totalMinutes,
    remainingMinutes: Math.max(
      0,
      settings.maxBreakMinutesPerDay - totalMinutes,
    ),
    limitExceeded: totalMinutes > settings.maxBreakMinutesPerDay,
  };
};
