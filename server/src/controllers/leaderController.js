import {
  getTeamMembers,
  getTeamAttendance,
  unlockEmployee,
  editAttendance,
  approveEmergencyOff,
  getPendingApprovals,
} from "../services/leaderService.js";

/**
 * Get team members
 */
export const getTeamMembersController = async (req, res) => {
  try {
    const leaderId = req.user.userId;
    const result = await getTeamMembers(leaderId);
    res.json(result);
  } catch (error) {
    console.error("Get team members error:", error);
    res.status(400).json({ message: error.message });
  }
};

/**
 * Get team attendance
 */
export const getTeamAttendanceController = async (req, res) => {
  try {
    const leaderId = req.user.userId;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ message: "Date is required (YYYY-MM-DD)" });
    }

    const attendance = await getTeamAttendance(leaderId, date);
    res.json({ attendance });
  } catch (error) {
    console.error("Get team attendance error:", error);
    res.status(400).json({ message: error.message });
  }
};

/**
 * Unlock employee
 */
export const unlockEmployeeController = async (req, res) => {
  try {
    const leaderId = req.user.userId;
    const { employeeId, reason } = req.body;

    if (!employeeId || !reason) {
      return res
        .status(400)
        .json({ message: "Employee ID and reason are required" });
    }

    const result = await unlockEmployee(leaderId, employeeId, reason);
    res.json(result);
  } catch (error) {
    console.error("Unlock employee error:", error);
    res.status(400).json({ message: error.message });
  }
};

/**
 * Edit attendance
 */
export const editAttendanceController = async (req, res) => {
  try {
    const leaderId = req.user.userId;
    const { attendanceId, updates, reason } = req.body;

    if (!attendanceId || !updates || !reason) {
      return res.status(400).json({
        message: "Attendance ID, updates, and reason are required",
      });
    }

    const result = await editAttendance(
      leaderId,
      attendanceId,
      updates,
      reason,
    );
    res.json(result);
  } catch (error) {
    console.error("Edit attendance error:", error);
    res.status(400).json({ message: error.message });
  }
};

/**
 * Approve emergency off
 */
export const approveEmergencyOffController = async (req, res) => {
  try {
    const leaderId = req.user.userId;
    const { employeeId, month, date } = req.body;

    if (!employeeId || !month || !date) {
      return res.status(400).json({
        message: "Employee ID, month, and date are required",
      });
    }

    const result = await approveEmergencyOff(leaderId, employeeId, month, date);
    res.json(result);
  } catch (error) {
    console.error("Approve emergency off error:", error);
    res.status(400).json({ message: error.message });
  }
};

/**
 * Get pending approvals
 */
export const getPendingApprovalsController = async (req, res) => {
  try {
    const leaderId = req.user.userId;
    const result = await getPendingApprovals(leaderId);
    res.json(result);
  } catch (error) {
    console.error("Get pending approvals error:", error);
    res.status(500).json({ message: error.message });
  }
};
