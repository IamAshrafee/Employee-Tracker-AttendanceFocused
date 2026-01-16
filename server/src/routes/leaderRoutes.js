import express from "express";
import {
  getTeamMembersController,
  getTeamAttendanceController,
  unlockEmployeeController,
  editAttendanceController,
  approveEmergencyOffController,
  getPendingApprovalsController,
} from "../controllers/leaderController.js";
import { protect, restrictTo } from "../middleware/auth.js";

const router = express.Router();

// All leader routes require authentication
router.use(protect);
router.use(restrictTo("team_leader"));

// Team management
router.get("/team/members", getTeamMembersController);
router.get("/team/attendance", getTeamAttendanceController);

// Approvals
router.get("/approvals/pending", getPendingApprovalsController);
router.post("/approvals/unlock-employee", unlockEmployeeController);
router.post("/approvals/edit-attendance", editAttendanceController);
router.post("/approvals/emergency-off", approveEmergencyOffController);

export default router;
