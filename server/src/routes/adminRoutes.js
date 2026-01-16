import express from "express";
import {
  createTeam,
  getAllTeams,
  getTeam,
  assignLeaders,
  deleteTeam,
} from "../controllers/adminController.js";
import {
  getSettings,
  updateSettings,
} from "../controllers/settingsController.js";
import { protect, restrictTo } from "../middleware/auth.js";

const router = express.Router();

// All admin routes require authentication and admin role
router.use(protect);
router.use(restrictTo("admin"));

// Team management
router.post("/teams", createTeam);
router.get("/teams", getAllTeams);
router.get("/teams/:id", getTeam);
router.put("/teams/leaders", assignLeaders);
router.delete("/teams/:id", deleteTeam);

// System settings
router.get("/settings", getSettings);
router.put("/settings", updateSettings);

export default router;
