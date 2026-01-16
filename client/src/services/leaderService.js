import api from "./api";

export const leaderService = {
  // Team
  async getTeamMembers() {
    const response = await api.get("/leader/team/members");
    return response.data;
  },

  async getTeamAttendance(date) {
    const response = await api.get(`/leader/team/attendance?date=${date}`);
    return response.data;
  },

  // Approvals
  async getPendingApprovals() {
    const response = await api.get("/leader/approvals/pending");
    return response.data;
  },

  async unlockEmployee(employeeId, reason) {
    const response = await api.post("/leader/approvals/unlock-employee", {
      employeeId,
      reason,
    });
    return response.data;
  },

  async editAttendance(attendanceId, updates, reason) {
    const response = await api.post("/leader/approvals/edit-attendance", {
      attendanceId,
      updates,
      reason,
    });
    return response.data;
  },

  async approveEmergencyOff(employeeId, month, date) {
    const response = await api.post("/leader/approvals/emergency-off", {
      employeeId,
      month,
      date,
    });
    return response.data;
  },
};
