import { format, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";
import { RestDay } from "../models/RestDay.js";
import { User } from "../models/User.js";
import { SystemSettings } from "../models/SystemSettings.js";

/**
 * Select rest days for a month
 */
export const selectRestDays = async (userId, month, selectedDates) => {
  try {
    // Get user to check team
    const user = await User.findById(userId);
    if (!user.teamId) {
      throw new Error("You must be assigned to a team to select rest days");
    }

    // Get system settings
    const settings = await SystemSettings.findOne();
    const maxRestDays = settings.restDaysPerMonth;
    const maxPerDate = settings.maxRestDaysPerDatePerTeam;

    // Validate number of rest days
    if (selectedDates.length > maxRestDays) {
      throw new Error(`You can only select ${maxRestDays} rest days per month`);
    }

    // Check if each date is available (max 4 employees per date per team)
    for (const date of selectedDates) {
      const count = await RestDay.countDocuments({
        teamId: user.teamId,
        month,
        selectedDates: date,
      });

      if (count >= maxPerDate) {
        throw new Error(
          `The date ${date} is fully booked. Maximum ${maxPerDate} employees can take rest on the same day.`,
        );
      }
    }

    // Create or update rest day record
    const restDay = await RestDay.findOneAndUpdate(
      { userId, month },
      {
        userId,
        teamId: user.teamId,
        month,
        selectedDates,
      },
      { upsert: true, new: true },
    );

    return {
      success: true,
      message: "Rest days selected successfully",
      restDay,
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Get rest days for a month
 */
export const getRestDays = async (userId, month) => {
  const restDay = await RestDay.findOne({ userId, month });
  return restDay || { selectedDates: [], emergencyOffDates: [] };
};

/**
 * Get available dates for a month (considering team limit)
 */
export const getAvailableDates = async (userId, month) => {
  try {
    const user = await User.findById(userId);
    if (!user.teamId) {
      return { availableDates: [], fullyBookedDates: [] };
    }

    const settings = await SystemSettings.findOne();
    const maxPerDate = settings.maxRestDaysPerDatePerTeam;

    // Get all rest days for the team in this month
    const teamRestDays = await RestDay.find({
      teamId: user.teamId,
      month,
    });

    // Count employees per date
    const dateCount = {};
    teamRestDays.forEach((rd) => {
      rd.selectedDates.forEach((date) => {
        dateCount[date] = (dateCount[date] || 0) + 1;
      });
    });

    // Get fully booked dates
    const fullyBookedDates = Object.keys(dateCount).filter(
      (date) => dateCount[date] >= maxPerDate,
    );

    // Get all dates in the month
    const monthStart = startOfMonth(new Date(month + "-01"));
    const monthEnd = endOfMonth(monthStart);
    const allDates = eachDayOfInterval({ start: monthStart, end: monthEnd });

    const availableDates = allDates
      .map((date) => format(date, "yyyy-MM-dd"))
      .filter((date) => !fullyBookedDates.includes(date));

    return {
      availableDates,
      fullyBookedDates,
      dateCount,
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Request emergency off (team leader approval required)
 */
export const requestEmergencyOff = async (userId, date, reason) => {
  try {
    const user = await User.findById(userId);
    if (!user.teamId) {
      throw new Error("You must be assigned to a team");
    }

    const month = format(new Date(date), "yyyy-MM");

    // Get or create rest day record
    let restDay = await RestDay.findOne({ userId, month });

    if (!restDay) {
      restDay = await RestDay.create({
        userId,
        teamId: user.teamId,
        month,
        selectedDates: [],
        emergencyOffDates: [],
      });
    }

    // Check if already requested for this date
    const exists = restDay.emergencyOffDates.some((off) => off.date === date);

    if (exists) {
      throw new Error("Emergency off already requested for this date");
    }

    // Add emergency off request
    restDay.emergencyOffDates.push({
      date,
      reason,
      approvedBy: null,
      approvedAt: null,
    });

    await restDay.save();

    return {
      success: true,
      message:
        "Emergency off request submitted. Waiting for team leader approval.",
      restDay,
    };
  } catch (error) {
    throw error;
  }
};
