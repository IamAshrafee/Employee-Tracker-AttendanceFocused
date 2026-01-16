import { SystemSettings } from "../models/SystemSettings.js";

/**
 * Get system settings
 */
export const getSettings = async (req, res) => {
  try {
    let settings = await SystemSettings.findOne();

    // Create default settings if none exist
    if (!settings) {
      settings = await SystemSettings.create({
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
    }

    res.json({ settings });
  } catch (error) {
    console.error("Get settings error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Update system settings
 */
export const updateSettings = async (req, res) => {
  try {
    const {
      jobStartTime,
      jobEndTime,
      graceMinutes,
      earlyDutyInMaxMinutes,
      lateDutyOutMaxMinutes,
      maxBreakMinutesPerDay,
      restDaysPerMonth,
      maxRestDaysPerDatePerTeam,
      autoAbsentAfterHours,
    } = req.body;

    let settings = await SystemSettings.findOne();

    if (!settings) {
      settings = new SystemSettings();
    }

    // Update fields if provided
    if (jobStartTime) settings.jobStartTime = jobStartTime;
    if (jobEndTime) settings.jobEndTime = jobEndTime;
    if (graceMinutes !== undefined) settings.graceMinutes = graceMinutes;
    if (earlyDutyInMaxMinutes !== undefined)
      settings.earlyDutyInMaxMinutes = earlyDutyInMaxMinutes;
    if (lateDutyOutMaxMinutes !== undefined)
      settings.lateDutyOutMaxMinutes = lateDutyOutMaxMinutes;
    if (maxBreakMinutesPerDay !== undefined)
      settings.maxBreakMinutesPerDay = maxBreakMinutesPerDay;
    if (restDaysPerMonth !== undefined)
      settings.restDaysPerMonth = restDaysPerMonth;
    if (maxRestDaysPerDatePerTeam !== undefined)
      settings.maxRestDaysPerDatePerTeam = maxRestDaysPerDatePerTeam;
    if (autoAbsentAfterHours !== undefined)
      settings.autoAbsentAfterHours = autoAbsentAfterHours;

    settings.updatedBy = req.user.userId;

    await settings.save();

    res.json({
      message: "Settings updated successfully",
      settings,
    });
  } catch (error) {
    console.error("Update settings error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
