import { User } from "../models/User.js";
import { Team } from "../models/Team.js";
import { Attendance } from "../models/Attendance.js";
import { RestDay } from "../models/RestDay.js";
import { LeaderActionLog } from "../models/LeaderActionLog.js";
import { format } from "date-fns";

/**
 * Get team leader's team
 */
export const getLeaderTeam = async (leaderId) => {
  const team = await Team.findOne({ leaders: leaderId }).populate(
    "leaders employees",
  );

  if (!team) {
    throw new Error("You are not assigned as a leader to any team");
  }

  return team;
};

/**
 * Get team members
 */
export const getTeamMembers = async (leaderId) => {
  const team = await getLeaderTeam(leaderId);

  const employees = await User.find({
    _id: { $in: team.employees },
  }).select("-password");

  return {
    team: {
      id: team._id,
      name: team.name,
    },
    employees,
  };
};

/**
 * Get team attendance for a date
 */
export const getTeamAttendance = async (leaderId, date) => {
  const team = await getLeaderTeam(leaderId);

  const attendance = await Attendance.find({
    userId: { $in: team.employees },
    date,
  }).populate("userId", "name email");

  return attendance;
};

/**
 * Unlock employee account
 */
export const unlockEmployee = async (leaderId, employeeId, reason) => {
  const team = await getLeaderTeam(leaderId);

  // Check if employee is in the team
  if (!team.employees.includes(employeeId)) {
    throw new Error("Employee is not in your team");
  }

  const employee = await User.findById(employeeId);
  if (!employee) {
    throw new Error("Employee not found");
  }

  if (employee.status !== "locked") {
    throw new Error("Employee is not locked");
  }

  // Unlock the user
  employee.status = "active";
  employee.lockReason = null;
  await employee.save();

  // Log the action
  await LeaderActionLog.create({
    leaderId,
    targetUserId: employeeId,
    action: "unlock_employee",
    details: `Unlocked account for ${employee.name}`,
    reason,
  });

  return {
    success: true,
    message: "Employee unlocked successfully",
    employee,
  };
};

/**
 * Edit employee attendance
 */
export const editAttendance = async (
  leaderId,
  attendanceId,
  updates,
  reason,
) => {
  const team = await getLeaderTeam(leaderId);

  const attendance = await Attendance.findById(attendanceId).populate("userId");
  if (!attendance) {
    throw new Error("Attendance record not found");
  }

  // Check if employee is in the team
  if (!team.employees.includes(attendance.userId._id.toString())) {
    throw new Error("Attendance record is not for an employee in your team");
  }

  // Record the edit in history
  const editRecord = {
    editedAt: new Date(),
    editedBy: leaderId,
    reason,
    changes: {},
  };

  // Apply updates and track changes
  if (updates.dutyInTime) {
    editRecord.changes.dutyIn = {
      from: attendance.dutyIn.time,
      to: updates.dutyInTime,
    };
    attendance.dutyIn.time = new Date(updates.dutyInTime);
  }

  if (updates.dutyOutTime) {
    editRecord.changes.dutyOut = {
      from: attendance.dutyOut.time,
      to: updates.dutyOutTime,
    };
    attendance.dutyOut.time = new Date(updates.dutyOutTime);
  }

  if (updates.status) {
    editRecord.changes.status = {
      from: attendance.status,
      to: updates.status,
    };
    attendance.status = updates.status;
  }

  attendance.editHistory.push(editRecord);
  await attendance.save();

  // Log the action
  await LeaderActionLog.create({
    leaderId,
    targetUserId: attendance.userId._id,
    action: "edit_attendance",
    details: `Edited attendance for ${attendance.userId.name} on ${attendance.date}`,
    reason,
  });

  return {
    success: true,
    message: "Attendance updated successfully",
    attendance,
  };
};

/**
 * Approve emergency off request
 */
export const approveEmergencyOff = async (
  leaderId,
  employeeId,
  month,
  emergencyOffDate,
) => {
  const team = await getLeaderTeam(leaderId);

  // Check if employee is in the team
  if (!team.employees.includes(employeeId)) {
    throw new Error("Employee is not in your team");
  }

  const restDay = await RestDay.findOne({ userId: employeeId, month });
  if (!restDay) {
    throw new Error("No rest day record found for this month");
  }

  // Find the emergency off request
  const emergencyOff = restDay.emergencyOffDates.find(
    (off) => off.date === emergencyOffDate && !off.approvedBy,
  );

  if (!emergencyOff) {
    throw new Error("Emergency off request not found or already approved");
  }

  // Approve the request
  emergencyOff.approvedBy = leaderId;
  emergencyOff.approvedAt = new Date();
  await restDay.save();

  // Log the action
  const employee = await User.findById(employeeId);
  await LeaderActionLog.create({
    leaderId,
    targetUserId: employeeId,
    action: "approve_emergency_off",
    details: `Approved emergency off for ${employee.name} on ${emergencyOffDate}`,
    reason: emergencyOff.reason,
  });

  return {
    success: true,
    message: "Emergency off approved successfully",
    restDay,
  };
};

/**
 * Get pending approvals
 */
export const getPendingApprovals = async (leaderId) => {
  const team = await getLeaderTeam(leaderId);

  // Get locked employees
  const lockedEmployees = await User.find({
    _id: { $in: team.employees },
    status: "locked",
  }).select("-password");

  // Get pending emergency off requests
  const currentMonth = format(new Date(), "yyyy-MM");
  const restDays = await RestDay.find({
    userId: { $in: team.employees },
    month: currentMonth,
    "emergencyOffDates.approvedBy": null,
  }).populate("userId", "name email");

  const pendingEmergencyOffs = restDays
    .map((rd) => {
      const pending = rd.emergencyOffDates.filter((off) => !off.approvedBy);
      return pending.map((off) => ({
        userId: rd.userId,
        month: rd.month,
        date: off.date,
        reason: off.reason,
      }));
    })
    .flat();

  return {
    lockedEmployees,
    pendingEmergencyOffs,
  };
};
