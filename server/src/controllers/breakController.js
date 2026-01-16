import {
  startBreak,
  endBreak,
  getTodayBreaks,
} from "../services/breakService.js";
import { Attendance } from "../models/Attendance.js";
import { format } from "date-fns";

/**
 * Start break
 */
export const breakOut = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { breakType, isOffline } = req.body;

    if (!breakType) {
      return res.status(400).json({ message: "Break type is required" });
    }

    // Get today's attendance
    const currentDate = format(new Date(), "yyyy-MM-dd");
    const attendance = await Attendance.findOne({ userId, date: currentDate });

    if (!attendance) {
      return res.status(400).json({ message: "No attendance found for today" });
    }

    const result = await startBreak(
      userId,
      attendance._id,
      breakType,
      isOffline || false,
    );

    res.json(result);
  } catch (error) {
    console.error("Break out error:", error);
    res.status(400).json({ message: error.message });
  }
};

/**
 * End break
 */
export const breakIn = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { breakId, isOffline } = req.body;

    if (!breakId) {
      return res.status(400).json({ message: "Break ID is required" });
    }

    const result = await endBreak(userId, breakId, isOffline || false);

    res.json(result);
  } catch (error) {
    console.error("Break in error:", error);
    res.status(400).json({ message: error.message });
  }
};

/**
 * Get today's breaks
 */
export const getTodayBreaksController = async (req, res) => {
  try {
    const userId = req.user.userId;
    const currentDate = format(new Date(), "yyyy-MM-dd");

    const result = await getTodayBreaks(userId, currentDate);

    res.json(result);
  } catch (error) {
    console.error("Get breaks error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
