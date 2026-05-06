import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { masterApi } from "../../lib/api/master.api";

export const masterKeys = {
  all: ["master"] as const,
  sku: () => [...masterKeys.all, "sku"] as const,
  bom: () => [...masterKeys.all, "bom"] as const,
  supplier: () => [...masterKeys.all, "supplier"] as const,
  lineSku: () => [...masterKeys.all, "lineSku"] as const,
  palletQty: () => [...masterKeys.all, "palletQty"] as const,
  uom: () => [...masterKeys.all, "uom"] as const,
  blockLayout: () => [...masterKeys.all, "blockLayout"] as const,
};

export function useSkus() {
  return useQuery({
    queryKey: masterKeys.sku(),
    queryFn: () => masterApi.getSkus(),
  });
}

export function useBoms() {
  return useQuery({
    queryKey: masterKeys.bom(),
    queryFn: () => masterApi.getBoms(),
  });
}

export function useSuppliers() {
  return useQuery({
    queryKey: masterKeys.supplier(),
    queryFn: () => masterApi.getSuppliers(),
  });
}

export function useLineSkus() {
  return useQuery({
    queryKey: masterKeys.lineSku(),
    queryFn: () => masterApi.getLineSkus(),
  });
}

// Simplified mutations setup (you can add all other mutations similarly)
export function useCreateSku() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: masterApi.createSku,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: masterKeys.sku() }); },
  });
}
