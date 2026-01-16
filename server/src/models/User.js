import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
      select: false, // Don't include password in queries by default
    },
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    role: {
      type: String,
      enum: ["admin", "team_leader", "employee"],
      default: "employee",
    },
    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      default: null,
    },
    deviceId: {
      type: String,
      default: null, // Current logged-in device
    },
    status: {
      type: String,
      enum: ["active", "locked", "inactive"],
      default: "active",
    },
    lockReason: {
      type: String,
      default: null,
    },
    unlockApprovedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    unlockApprovedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

// Index for faster queries
userSchema.index({ email: 1 });
userSchema.index({ teamId: 1 });
userSchema.index({ role: 1 });

export const User = mongoose.model("User", userSchema);
