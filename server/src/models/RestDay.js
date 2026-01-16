import mongoose from "mongoose";

const restDaySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      required: true,
    },
    month: {
      type: String, // Format: YYYY-MM
      required: true,
    },
    selectedDates: [
      {
        type: String, // Format: YYYY-MM-DD
      },
    ],
    emergencyOffDates: [
      {
        date: {
          type: String, // Format: YYYY-MM-DD
        },
        reason: String,
        approvedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        approvedAt: Date,
      },
    ],
  },
  {
    timestamps: true,
  },
);

// Compound index for user + month (unique combination)
restDaySchema.index({ userId: 1, month: 1 }, { unique: true });

export const RestDay = mongoose.model("RestDay", restDaySchema);
