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

  // Rest Days
  async selectRestDays(month, selectedDates) {
    const response = await api.post('/employee/rest-days', { month, selectedDates });
    return response.data;
  },

  async getRestDays(month) {
    const response = await api.get(`/employee/rest-days?month=${month}`);
    return response.data;
  },

  async getAvailableDates(month) {
    const response = await api.get(`/employee/rest-days/available?month=${month}`);
    return response.data;
  },

  async requestEmergencyOff(date, reason) {
    const response = await api.post('/employee/emergency-off', { date, reason });
    return response.data;
  },
};
```
