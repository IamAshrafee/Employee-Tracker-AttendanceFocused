import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: {
      type: String, // Format: YYYY-MM-DD
      required: true,
    },
    dutyIn: {
      time: {
        type: Date,
        default: null,
      },
      isLate: {
        type: Boolean,
        default: false,
      },
      lateMinutes: {
        type: Number,
        default: 0,
      },
      device: {
        type: String,
        default: null,
      },
      isOffline: {
        type: Boolean,
        default: false,
      },
    },
    dutyOut: {
      time: {
        type: Date,
        default: null,
      },
      isLate: {
        type: Boolean,
        default: false,
      },
      lateMinutes: {
        type: Number,
        default: 0,
      },
      device: {
        type: String,
        default: null,
      },
      autoClosedBySystem: {
        type: Boolean,
        default: false,
      },
      isOffline: {
        type: Boolean,
        default: false,
      },
    },
    workingMinutes: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["present", "absent", "rest_day", "emergency_off"],
      default: "present",
    },
    isLocked: {
      type: Boolean,
      default: false,
    },
    lockReason: {
      type: String,
      default: null,
    },
    editedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    editReason: {
      type: String,
      default: null,
    },
    editedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

// Compound index for user + date (unique combination)
attendanceSchema.index({ userId: 1, date: 1 }, { unique: true });
attendanceSchema.index({ date: 1 });

export const Attendance = mongoose.model("Attendance", attendanceSchema);
