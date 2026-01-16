import { format, startOfMonth, endOfMonth } from "date-fns";
import { Attendance } from "../models/Attendance.js";
import { BreakLog } from "../models/BreakLog.js";
import { RestDay } from "../models/RestDay.js";

/**
 * Get employee attendance report for a date range
 */
export const getAttendanceReport = async (userId, startDate, endDate) => {
  const attendance = await Attendance.find({
    userId,
    date: {
      $gte: startDate,
      $lte: endDate,
    },
  }).sort({ date: -1 });

  // Calculate statistics
  const stats = {
    totalDays: attendance.length,
    presentDays: attendance.filter((a) => a.status === "present").length,
    absentDays: attendance.filter((a) => a.status === "absent").length,
    lateDays: attendance.filter((a) => a.dutyIn?.isLate).length,
    totalWorkingMinutes: attendance.reduce(
      (sum, a) => sum + (a.workingMinutes || 0),
      0,
    ),
    totalLateMinutes: attendance.reduce(
      (sum, a) => sum + (a.dutyIn?.lateMinutes || 0),
      0,
    ),
    averageWorkingHours: 0,
  };

  if (stats.presentDays > 0) {
    stats.averageWorkingHours = (
      stats.totalWorkingMinutes /
      stats.presentDays /
      60
    ).toFixed(2);
  }

  return {
    attendance,
    stats,
  };
};

/**
 * Get monthly attendance summary
 */
export const getMonthlyReport = async (userId, month) => {
  const monthStart = format(
    startOfMonth(new Date(month + "-01")),
    "yyyy-MM-dd",
  );
  const monthEnd = format(endOfMonth(new Date(month + "-01")), "yyyy-MM-dd");

  // Get attendance
  const attendanceReport = await getAttendanceReport(
    userId,
    monthStart,
    monthEnd,
  );

  // Get breaks for the month
  const breaks = await BreakLog.find({
    userId,
    date: {
      $gte: monthStart,
      $lte: monthEnd,
    },
  });

  const breakStats = {
    totalBreaks: breaks.length,
    totalBreakMinutes: breaks.reduce(
      (sum, b) => sum + (b.durationMinutes || 0),
      0,
    ),
    averageBreakMinutes: 0,
    breaksByType: {},
  };

  if (breaks.length > 0) {
    breakStats.averageBreakMinutes = (
      breakStats.totalBreakMinutes / breaks.length
    ).toFixed(2);

    // Group by type
    breaks.forEach((b) => {
      if (!breakStats.breaksByType[b.breakType]) {
        breakStats.breaksByType[b.breakType] = {
          count: 0,
          totalMinutes: 0,
        };
      }
      breakStats.breaksByType[b.breakType].count++;
      breakStats.breaksByType[b.breakType].totalMinutes +=
        b.durationMinutes || 0;
    });
  }

  // Get rest days
  const restDay = await RestDay.findOne({ userId, month });
  const restDayStats = {
    selectedDays: restDay?.selectedDates?.length || 0,
    emergencyOffs:
      restDay?.emergencyOffDates?.filter((off) => off.approvedBy)?.length || 0,
    pendingEmergencyOffs:
      restDay?.emergencyOffDates?.filter((off) => !off.approvedBy)?.length || 0,
  };

  return {
    month,
    attendance: attendanceReport.attendance,
    attendanceStats: attendanceReport.stats,
    breakStats,
    restDayStats,
  };
};

/**
 * Get daily attendance details
 */
export const getDailyReport = async (userId, date) => {
  const attendance = await Attendance.findOne({ userId, date });

  if (!attendance) {
    return null;
  }

  // Get breaks for the day
  const breaks = await BreakLog.find({ userId, date });

  return {
    date,
    attendance,
    breaks,
  };
};
