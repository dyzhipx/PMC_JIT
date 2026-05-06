import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { warehouseApi } from "../../lib/api/warehouse.api";

export const warehouseKeys = {
  all: ["warehouse"] as const,
  stock: () => [...warehouseKeys.all, "stock"] as const,
};

export function useWarehouseStock() {
  return useQuery({
    queryKey: warehouseKeys.stock(),
    queryFn: () => warehouseApi.getStock(),
  });
}

export function useAddWarehouseStock() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: warehouseApi.addStock,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: warehouseKeys.stock() });
    },
  });
}

export function useDeleteWarehouseStock() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: warehouseApi.deleteStock,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: warehouseKeys.stock() });
    },
  });
}
