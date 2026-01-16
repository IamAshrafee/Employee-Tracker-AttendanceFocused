import {
  selectRestDays,
  getRestDays,
  getAvailableDates,
  requestEmergencyOff,
} from "../services/restDayService.js";

/**
 * Select rest days for a month
 */
export const selectRestDaysController = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { month, selectedDates } = req.body;

    if (!month || !selectedDates || !Array.isArray(selectedDates)) {
      return res.status(400).json({
        message: "Month and selectedDates array are required",
      });
    }

    const result = await selectRestDays(userId, month, selectedDates);

    res.json(result);
  } catch (error) {
    console.error("Select rest days error:", error);
    res.status(400).json({ message: error.message });
  }
};

/**
 * Get rest days for a month
 */
export const getRestDaysController = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { month } = req.query;

    if (!month) {
      return res.status(400).json({ message: "Month is required (YYYY-MM)" });
    }

    const restDay = await getRestDays(userId, month);

    res.json({ restDay });
  } catch (error) {
    console.error("Get rest days error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Get available dates for a month
 */
export const getAvailableDatesController = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { month } = req.query;

    if (!month) {
      return res.status(400).json({ message: "Month is required (YYYY-MM)" });
    }

    const result = await getAvailableDates(userId, month);

    res.json(result);
  } catch (error) {
    console.error("Get available dates error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Request emergency off
 */
export const requestEmergencyOffController = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { date, reason } = req.body;

    if (!date || !reason) {
      return res.status(400).json({ message: "Date and reason are required" });
    }

    const result = await requestEmergencyOff(userId, date, reason);

    res.json(result);
  } catch (error) {
    console.error("Request emergency off error:", error);
    res.status(400).json({ message: error.message });
  }
};
