import { useQuery } from "@tanstack/react-query";
import { materialApi } from "../../lib/api/material.api";

export const materialKeys = {
  all: ["material"] as const,
  requests: (date: string) => [...materialKeys.all, "requests", date] as const,
  lineRequests: (date: string) => [...materialKeys.all, "lineRequests", date] as const,
};

export function useMaterialRequirements(date: string) {
  return useQuery({
    queryKey: materialKeys.requests(date),
    queryFn: () => materialApi.getRequirements(date),
    enabled: !!date,
  });
}

export function useLineMaterialRequirements(date: string) {
  return useQuery({
    queryKey: materialKeys.lineRequests(date),
    queryFn: () => materialApi.getLineRequirements(date),
    enabled: !!date,
  });
}
