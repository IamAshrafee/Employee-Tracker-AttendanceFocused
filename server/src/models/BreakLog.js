import mongoose from "mongoose";

const breakLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    attendanceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Attendance",
      required: true,
    },
    date: {
      type: String, // Format: YYYY-MM-DD
      required: true,
    },
    breakType: {
      type: String,
      enum: ["lunch", "toilet", "cooking", "personal", "other"],
      required: true,
    },
    breakOut: {
      type: Date,
      required: true,
    },
    breakIn: {
      type: Date,
      default: null,
    },
    durationMinutes: {
      type: Number,
      default: 0,
    },
    isOffline: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true, // True until break is ended
    },
  },
  {
    timestamps: true,
  },
);

// Indexes
breakLogSchema.index({ userId: 1, date: 1 });
breakLogSchema.index({ attendanceId: 1 });

export const BreakLog = mongoose.model("BreakLog", breakLogSchema);
