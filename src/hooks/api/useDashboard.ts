import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "../../lib/api/dashboard.api";

export const dashboardKeys = {
  all: ["dashboard"] as const,
  stats: () => [...dashboardKeys.all, "stats"] as const,
  dailyProduction: () => [...dashboardKeys.all, "dailyProduction"] as const,
  recentSchedules: () => [...dashboardKeys.all, "recentSchedules"] as const,
};

export function useDashboardStats() {
  return useQuery({
    queryKey: dashboardKeys.stats(),
    queryFn: () => dashboardApi.getStats(),
  });
}

export function useDailyProduction() {
  return useQuery({
    queryKey: dashboardKeys.dailyProduction(),
    queryFn: () => dashboardApi.getDailyProduction(),
  });
}

export function useRecentSchedules() {
  return useQuery({
    queryKey: dashboardKeys.recentSchedules(),
    queryFn: () => dashboardApi.getRecentSchedules(),
  });
}
