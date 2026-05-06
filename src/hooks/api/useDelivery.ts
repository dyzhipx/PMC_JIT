import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { deliveryApi } from "../../lib/api/delivery.api";

export const deliveryKeys = {
  all: ["delivery"] as const,
  active: () => [...deliveryKeys.all, "active"] as const,
  detail: (id: string) => [...deliveryKeys.all, "detail", id] as const,
  barcodeCheck: (barcode: string) => [...deliveryKeys.all, "barcodeCheck", barcode] as const,
};

export function useActiveDeliveries() {
  return useQuery({
    queryKey: deliveryKeys.active(),
    queryFn: () => deliveryApi.getActiveDeliveries(),
  });
}

export function useDeliveryDetail(id: string) {
  return useQuery({
    queryKey: deliveryKeys.detail(id),
    queryFn: () => deliveryApi.getDeliveryById(id),
    enabled: !!id,
  });
}

export function useCreateDelivery() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deliveryApi.createDelivery,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: deliveryKeys.active() });
    },
  });
}

export function useRefreshDelivery() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { date: string; shiftKey: string; slotId: string } }) => 
      deliveryApi.refreshDelivery(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: deliveryKeys.detail(id) });
    },
  });
}

export function useScanDeliveryItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { material: string; barcode: string; qtyPallet?: number; pcs?: number; supplier?: string } }) => 
      deliveryApi.scanDeliveryItem(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: deliveryKeys.detail(id) });
    },
  });
}

export function useValidateDelivery() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deliveryApi.validateDelivery,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: deliveryKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: deliveryKeys.active() });
    },
  });
}

export function useBarcodeCheck(barcode: string) {
  return useQuery({
    queryKey: deliveryKeys.barcodeCheck(barcode),
    queryFn: () => deliveryApi.barcodeCheck(barcode),
    enabled: !!barcode,
  });
}
