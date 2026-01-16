import { Team } from "../models/Team.js";
import { User } from "../models/User.js";
import { LeaderActionLog } from "../models/LeaderActionLog.js";

/**
 * Create a new team
 */
export const createTeam = async (req, res) => {
  try {
    const { name, leaderIds } = req.body;

    // Check if team name already exists
    const existingTeam = await Team.findOne({ name });
    if (existingTeam) {
      return res.status(400).json({ message: "Team name already exists" });
    }

    // Validate leaders exist and have team_leader role
    if (leaderIds && leaderIds.length > 0) {
      const leaders = await User.find({ _id: { $in: leaderIds } });
      const invalidLeaders = leaders.filter(
        (leader) => leader.role !== "team_leader" && leader.role !== "admin",
      );

      if (invalidLeaders.length > 0) {
        return res.status(400).json({
          message: "Some users are not team leaders",
        });
      }
    }

    // Create team
    const team = await Team.create({
      name,
      leaders: leaderIds || [],
      employees: [],
      createdBy: req.user.userId,
    });

    res.status(201).json({
      message: "Team created successfully",
      team,
    });
  } catch (error) {
    console.error("Create team error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Get all teams
 */
export const getAllTeams = async (req, res) => {
  try {
    const teams = await Team.find()
      .populate("leaders", "name email")
      .populate("employees", "name email")
      .populate("createdBy", "name email");

    res.json({ teams });
  } catch (error) {
    console.error("Get teams error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Get single team
 */
export const getTeam = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate("leaders", "name email role")
      .populate("employees", "name email status")
      .populate("createdBy", "name email");

    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    res.json({ team });
  } catch (error) {
    console.error("Get team error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Assign team leaders
 */
export const assignLeaders = async (req, res) => {
  try {
    const { teamId, leaderIds } = req.body;

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    // Validate leaders
    const leaders = await User.find({ _id: { $in: leaderIds } });
    const invalidLeaders = leaders.filter(
      (leader) => leader.role !== "team_leader" && leader.role !== "admin",
    );

    if (invalidLeaders.length > 0) {
      return res.status(400).json({
        message: "Some users are not team leaders",
      });
    }

    team.leaders = leaderIds;
    await team.save();

    res.json({
      message: "Team leaders assigned successfully",
      team,
    });
  } catch (error) {
    console.error("Assign leaders error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Delete team
 */
export const deleteTeam = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    // Remove team reference from all employees
    await User.updateMany({ teamId: team._id }, { teamId: null });

    await team.deleteOne();

    res.json({ message: "Team deleted successfully" });
  } catch (error) {
    console.error("Delete team error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
