import { fetchApi } from "../api-client";

export const warehouseApi = {
  getStock: () => fetchApi<any[]>("/warehouse/stock"),
  addStock: (data: { material: string; initialStockQty: number }) => 
    fetchApi<any>("/warehouse/stock", { method: "POST", body: JSON.stringify(data) }),
  deleteStock: (id: string) => fetchApi<any>(`/warehouse/stock/${id}`, { method: "DELETE" }),
};
