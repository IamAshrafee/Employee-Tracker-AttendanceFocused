import mongoose from "mongoose";

const leaderActionLogSchema = new mongoose.Schema(
  {
    leaderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    targetUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    action: {
      type: String,
      enum: [
        "unlock_user",
        "edit_attendance",
        "approve_emergency_off",
        "add_employee",
        "remove_employee",
      ],
      required: true,
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    reason: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

// Indexes
leaderActionLogSchema.index({ leaderId: 1, timestamp: -1 });
leaderActionLogSchema.index({ targetUserId: 1, timestamp: -1 });

export const LeaderActionLog = mongoose.model(
  "LeaderActionLog",
  leaderActionLogSchema,
);
