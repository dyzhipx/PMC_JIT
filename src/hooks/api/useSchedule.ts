import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { scheduleApi } from "../../lib/api/schedule.api";

export const scheduleKeys = {
  all: ["schedule"] as const,
  list: (filters: any) => [...scheduleKeys.all, "list", filters] as const,
  dates: () => [...scheduleKeys.all, "dates"] as const,
  summary: (date: string) => [...scheduleKeys.all, "summary", date] as const,
};

export function useSchedules(filters?: { date?: string; line?: string; status?: string }) {
  return useQuery({
    queryKey: scheduleKeys.list(filters),
    queryFn: () => scheduleApi.getAllSchedules(filters),
  });
}

export function useScheduleDates() {
  return useQuery({
    queryKey: scheduleKeys.dates(),
    queryFn: () => scheduleApi.getUniqueDates(),
  });
}

export function useShiftSummary(date: string) {
  return useQuery({
    queryKey: scheduleKeys.summary(date),
    queryFn: () => scheduleApi.getShiftSummary(date),
    enabled: !!date,
  });
}

export function useImportSchedules() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: scheduleApi.importSchedules,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: scheduleKeys.all });
    },
  });
}
