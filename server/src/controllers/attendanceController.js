import {
  processDutyIn,
  processDutyOut,
} from "../services/attendanceService.js";
import { Attendance } from "../models/Attendance.js";
import { format } from "date-fns";

/**
 * Mark duty in
 */
export const dutyIn = async (req, res) => {
  try {
    const userId = req.user.userId;
    const deviceId = req.user.deviceId;
    const { isOffline } = req.body;

    const result = await processDutyIn(userId, deviceId, isOffline || false);

    res.json(result);
  } catch (error) {
    console.error("Duty in error:", error);
    res.status(400).json({ message: error.message });
  }
};

/**
 * Mark duty out
 */
export const dutyOut = async (req, res) => {
  try {
    const userId = req.user.userId;
    const deviceId = req.user.deviceId;
    const { isOffline } = req.body;

    const result = await processDutyOut(userId, deviceId, isOffline || false);

    res.json(result);
  } catch (error) {
    console.error("Duty out error:", error);
    res.status(400).json({ message: error.message });
  }
};

/**
 * Get today's attendance
 */
export const getTodayAttendance = async (req, res) => {
  try {
    const userId = req.user.userId;
    const currentDate = format(new Date(), "yyyy-MM-dd");

    const attendance = await Attendance.findOne({ userId, date: currentDate });

    res.json({ attendance });
  } catch (error) {
    console.error("Get attendance error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Get monthly attendance
 */
export const getMonthlyAttendance = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { month } = req.query; // Format: YYYY-MM

    if (!month) {
      return res.status(400).json({ message: "Month is required (YYYY-MM)" });
    }

    // Find all attendance for the month
    const attendances = await Attendance.find({
      userId,
      date: { $regex: `^${month}` },
    }).sort({ date: 1 });

    // Calculate summary
    const summary = {
      totalDays: attendances.length,
      presentDays: attendances.filter((a) => a.status === "present").length,
      absentDays: attendances.filter((a) => a.status === "absent").length,
      restDays: attendances.filter((a) => a.status === "rest_day").length,
      lateDutyIns: attendances.filter((a) => a.dutyIn?.isLate).length,
      totalWorkingHours: (
        attendances.reduce((sum, a) => sum + (a.workingMinutes || 0), 0) / 60
      ).toFixed(2),
    };

    res.json({ attendances, summary });
  } catch (error) {
    console.error("Get monthly attendance error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
