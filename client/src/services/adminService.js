import api from "./api";

/**
 * Admin service
 */
export const adminService = {
  // Team management
  async createTeam(name, leaderIds = []) {
    const response = await api.post("/admin/teams", { name, leaderIds });
    return response.data;
  },

  async getAllTeams() {
    const response = await api.get("/admin/teams");
    return response.data;
  },

  async getTeam(teamId) {
    const response = await api.get(`/admin/teams/${teamId}`);
    return response.data;
  },

  async assignLeaders(teamId, leaderIds) {
    const response = await api.put("/admin/teams/leaders", {
      teamId,
      leaderIds,
    });
    return response.data;
  },

  async deleteTeam(teamId) {
    const response = await api.delete(`/admin/teams/${teamId}`);
    return response.data;
  },

  // System settings
  async getSettings() {
    const response = await api.get("/admin/settings");
    return response.data;
  },

  async updateSettings(settings) {
    const response = await api.put("/admin/settings", settings);
    return response.data;
  },
};
