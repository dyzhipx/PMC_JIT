import { fetchApi } from "../api-client";

export const dashboardApi = {
  getStats: () => fetchApi<any>("/dashboard/stats"),
  getDailyProduction: () => fetchApi<any>("/dashboard/daily-production"),
  getRecentSchedules: () => fetchApi<any>("/dashboard/recent-schedules")
};
