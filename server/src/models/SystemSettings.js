import mongoose from "mongoose";

const systemSettingsSchema = new mongoose.Schema(
  {
    jobStartTime: {
      type: String, // Format: HH:mm (24-hour)
      required: true,
      default: "09:00",
    },
    jobEndTime: {
      type: String, // Format: HH:mm (24-hour)
      required: true,
      default: "17:00",
    },
    graceMinutes: {
      type: Number,
      default: 10,
      min: 0,
      max: 30,
    },
    earlyDutyInMaxMinutes: {
      type: Number,
      default: 30,
      min: 0,
      max: 60,
    },
    lateDutyOutMaxMinutes: {
      type: Number,
      default: 30,
      min: 0,
      max: 60,
    },
    maxBreakMinutesPerDay: {
      type: Number,
      default: 60,
      min: 30,
      max: 120,
    },
    restDaysPerMonth: {
      type: Number,
      default: 4,
      min: 0,
      max: 10,
    },
    maxRestDaysPerDatePerTeam: {
      type: Number,
      default: 4,
      min: 1,
      max: 10,
    },
    autoAbsentAfterHours: {
      type: Number,
      default: 3,
      min: 1,
      max: 8,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

export const SystemSettings = mongoose.model(
  "SystemSettings",
  systemSettingsSchema,
);
