import api from "./api";

/**
 * Employee service
 */
export const employeeService = {
  // Attendance
  async dutyIn(isOffline = false) {
    const response = await api.post("/employee/duty-in", { isOffline });
    return response.data;
  },

  async dutyOut(isOffline = false) {
    const response = await api.post("/employee/duty-out", { isOffline });
    return response.data;
  },

  async getTodayAttendance() {
    const response = await api.get("/employee/attendance/today");
    return response.data;
  },

  async getMonthlyAttendance(month) {
    const response = await api.get(
      `/employee/attendance/monthly?month=${month}`,
    );
    return response.data;
  },

  // Breaks
  async startBreak(breakType, isOffline = false) {
    const response = await api.post("/employee/break-out", {
      breakType,
      isOffline,
    });
    return response.data;
  },

  async endBreak(breakId, isOffline = false) {
    const response = await api.post("/employee/break-in", {
      breakId,
      isOffline,
    });
    return response.data;
  },

  async getTodayBreaks() {
    const response = await api.get("/employee/breaks/today");
    return response.data;
  },
};
