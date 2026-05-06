import { fetchApi } from "../api-client";

export const transitApi = {
  getInfo: () => fetchApi<any>("/transit/info"),
  getInventory: () => fetchApi<any[]>("/transit/inventory"),
  receiveToTransit: (data: { material: string; qtyPallet: number; barcode: string; actualPcs?: number; source?: string }) => 
    fetchApi<any>("/transit/receive", { method: "POST", body: JSON.stringify(data) }),
  takeFromTransit: (data: { material: string; qty: number; line: string }) => 
    fetchApi<any>("/transit/take", { method: "POST", body: JSON.stringify(data) }),
  getStockCheck: (date: string) => fetchApi<any>(`/transit/stock-check/${date}`),
  saveStockCheck: (date: string, entries: any[]) => 
    fetchApi<any>(`/transit/stock-check/${date}`, { method: "PUT", body: JSON.stringify({ entries }) }),
  getMutations: (params?: { material?: string; startDate?: string; endDate?: string; line?: string }) => {
    const search = new URLSearchParams();
    if (params?.material) search.append("material", params.material);
    if (params?.startDate) search.append("startDate", params.startDate);
    if (params?.endDate) search.append("endDate", params.endDate);
    if (params?.line) search.append("line", params.line);
    return fetchApi<any[]>(`/transit/mutations?${search.toString()}`);
  },
  getUsedBarcodes: () => fetchApi<string[]>("/transit/used-barcodes"),
  requestOutbound: (data: { barcode: string; destination: string; targetLine?: string }) => 
    fetchApi<any>("/transit/outbound", { method: "POST", body: JSON.stringify(data) }),
  getOutboundPending: () => fetchApi<any[]>("/transit/outbound/pending"),
  verifyOutbound: (id: string, action: "approve" | "reject") => 
    fetchApi<any>(`/transit/outbound/${id}/verify`, { method: "POST", body: JSON.stringify({ action }) }),
};
