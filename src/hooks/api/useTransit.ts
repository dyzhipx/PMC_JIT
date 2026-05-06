import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { transitApi } from "../../lib/api/transit.api";

export const transitKeys = {
  all: ["transit"] as const,
  info: () => [...transitKeys.all, "info"] as const,
  inventory: () => [...transitKeys.all, "inventory"] as const,
  mutations: (filters: any) => [...transitKeys.all, "mutations", filters] as const,
  outboundPending: () => [...transitKeys.all, "outboundPending"] as const,
};

export function useTransitInfo() {
  return useQuery({
    queryKey: transitKeys.info(),
    queryFn: () => transitApi.getInfo(),
  });
}

export function useTransitInventory() {
  return useQuery({
    queryKey: transitKeys.inventory(),
    queryFn: () => transitApi.getInventory(),
  });
}

export function useTransitMutations(filters?: { material?: string; startDate?: string; endDate?: string; line?: string }) {
  return useQuery({
    queryKey: transitKeys.mutations(filters),
    queryFn: () => transitApi.getMutations(filters),
  });
}

export function useOutboundPending() {
  return useQuery({
    queryKey: transitKeys.outboundPending(),
    queryFn: () => transitApi.getOutboundPending(),
  });
}

export function useReceiveToTransit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: transitApi.receiveToTransit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: transitKeys.inventory() });
    },
  });
}
