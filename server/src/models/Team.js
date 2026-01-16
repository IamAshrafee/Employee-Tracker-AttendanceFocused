import mongoose from "mongoose";

const teamSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Team name is required"],
      trim: true,
      unique: true,
    },
    leaders: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    employees: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

// Index for faster queries
teamSchema.index({ name: 1 });

export const Team = mongoose.model("Team", teamSchema);
