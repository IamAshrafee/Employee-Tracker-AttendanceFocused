import mongoose from "mongoose";

const loginHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    action: {
      type: String,
      enum: ["login", "logout", "force_logout"],
      required: true,
    },
    deviceId: {
      type: String,
      required: true,
    },
    deviceInfo: {
      type: String,
      default: null,
    },
    ipAddress: {
      type: String,
      default: null,
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

// Index for faster queries
loginHistorySchema.index({ userId: 1, timestamp: -1 });

export const LoginHistory = mongoose.model("LoginHistory", loginHistorySchema);
