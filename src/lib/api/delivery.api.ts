import { fetchApi } from "../api-client";

export const deliveryApi = {
  getActiveDeliveries: () => fetchApi<any[]>("/delivery"),
  getDeliveryById: (id: string) => fetchApi<any>(`/delivery/${id}`),
  createDelivery: (data: { date: string; shiftKey: string; slotId: string }) => 
    fetchApi<any>("/delivery/create", { method: "POST", body: JSON.stringify(data) }),
  refreshDelivery: (id: string, data: { date: string; shiftKey: string; slotId: string }) =>
    fetchApi<any>(`/delivery/${id}/refresh`, { method: "POST", body: JSON.stringify(data) }),
  scanDeliveryItem: (id: string, data: { material: string; barcode: string; qtyPallet?: number; pcs?: number; supplier?: string }) =>
    fetchApi<any>(`/delivery/${id}/scan`, { method: "POST", body: JSON.stringify(data) }),
  validateDelivery: (id: string) => 
    fetchApi<any>(`/delivery/${id}/validate`, { method: "POST" }),
  barcodeCheck: (barcode: string) => 
    fetchApi<any>(`/delivery/barcode-check/${barcode}`),
};
