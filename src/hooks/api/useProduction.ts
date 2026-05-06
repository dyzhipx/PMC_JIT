import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { productionApi } from "../../lib/api/production.api";

export const productionKeys = {
  all: ["production"] as const,
  stockAll: () => [...productionKeys.all, "stockAll"] as const,
  stockLine: (line: string) => [...productionKeys.all, "stockLine", line] as const,
  barcodes: (line?: string) => [...productionKeys.all, "barcodes", line] as const,
  pendingReturns: () => [...productionKeys.all, "pendingReturns"] as const,
  external: (dest: string) => [...productionKeys.all, "external", dest] as const,
};

export function useLineStockAll() {
  return useQuery({
    queryKey: productionKeys.stockAll(),
    queryFn: () => productionApi.getLineStockAll(),
  });
}

// Example mutation
export function useReceiveToLine() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: productionApi.receiveToLine,
    onSuccess: (_: any, variables: { line: string; material: string; barcode: string; pcs: number }) => {
      queryClient.invalidateQueries({ queryKey: productionKeys.stockLine(variables.line) });
      queryClient.invalidateQueries({ queryKey: productionKeys.stockAll() });
    },
  });
}
