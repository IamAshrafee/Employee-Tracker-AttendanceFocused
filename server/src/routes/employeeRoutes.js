import express from "express";
import {
  dutyIn,
  dutyOut,
  getTodayAttendance,
  getMonthlyAttendance,
} from "../controllers/attendanceController.js";
import {
  breakOut,
  breakIn,
  getTodayBreaksController,
} from "../controllers/breakController.js";
import {
  selectRestDaysController,
  getRestDaysController,
  getAvailableDatesController,
  requestEmergencyOffController,
} from "../controllers/restDayController.js";
import { protect, restrictTo } from "../middleware/auth.js";

const router = express.Router();

// All employee routes require authentication
router.use(protect);
router.use(restrictTo("employee"));

// Attendance
router.post("/duty-in", dutyIn);
router.post("/duty-out", dutyOut);
router.get("/attendance/today", getTodayAttendance);
router.get("/attendance/monthly", getMonthlyAttendance);

// Breaks
router.post("/break-out", breakOut);
router.post("/break-in", breakIn);
router.get("/breaks/today", getTodayBreaksController);

// Rest Days
router.post("/rest-days", selectRestDaysController);
router.get("/rest-days", getRestDaysController);
router.get("/rest-days/available", getAvailableDatesController);
router.post("/emergency-off", requestEmergencyOffController);

export default router;
