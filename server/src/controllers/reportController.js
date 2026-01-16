import {
  getAttendanceReport,
  getMonthlyReport,
  getDailyReport,
} from "../services/reportService.js";

/**
 * Get attendance report for date range
 */
export const getAttendanceReportController = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        message: "Start date and end date are required (YYYY-MM-DD)",
      });
    }

    const report = await getAttendanceReport(userId, startDate, endDate);

    res.json(report);
  } catch (error) {
    console.error("Get attendance report error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Get monthly report
 */
export const getMonthlyReportController = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { month } = req.query;

    if (!month) {
      return res.status(400).json({ message: "Month is required (YYYY-MM)" });
    }

    const report = await getMonthlyReport(userId, month);

    res.json(report);
  } catch (error) {
    console.error("Get monthly report error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Get daily report
 */
export const getDailyReportController = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ message: "Date is required (YYYY-MM-DD)" });
    }

    const report = await getDailyReport(userId, date);

    if (!report) {
      return res
        .status(404)
        .json({ message: "No attendance record found for this date" });
    }

    res.json(report);
  } catch (error) {
    console.error("Get daily report error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
