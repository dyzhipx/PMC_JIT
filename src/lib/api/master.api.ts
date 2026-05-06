import { fetchApi } from "../api-client";

export const masterApi = {
  getSkus: () => fetchApi<any[]>("/master/sku"),
  createSku: (data: any) => fetchApi<any>("/master/sku", { method: "POST", body: JSON.stringify(data) }),
  updateSku: (id: string, data: any) => fetchApi<any>(`/master/sku/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteSku: (id: string) => fetchApi<any>(`/master/sku/${id}`, { method: "DELETE" }),
  
  getBoms: () => fetchApi<any[]>("/master/bom"),
  getBomBySku: (skuId: string) => fetchApi<any>(`/master/bom/${skuId}`),
  addBomComponent: (skuId: string, data: any) => fetchApi<any>(`/master/bom/${skuId}/component`, { method: "POST", body: JSON.stringify(data) }),
  updateBomComponent: (id: string, data: any) => fetchApi<any>(`/master/bom/component/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteBomComponent: (id: string) => fetchApi<any>(`/master/bom/component/${id}`, { method: "DELETE" }),

  getSuppliers: () => fetchApi<any[]>("/master/supplier"),
  createSupplier: (data: any) => fetchApi<any>("/master/supplier", { method: "POST", body: JSON.stringify(data) }),
  updateSupplier: (id: string, data: any) => fetchApi<any>(`/master/supplier/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteSupplier: (id: string) => fetchApi<any>(`/master/supplier/${id}`, { method: "DELETE" }),

  getLineSkus: () => fetchApi<any[]>("/master/line-sku"),
  addLineSku: (skuId: string, line: string) => fetchApi<any>("/master/line-sku", { method: "POST", body: JSON.stringify({ skuId, line }) }),
  deleteLineSku: (skuId: string, line: string) => fetchApi<any>(`/master/line-sku/${skuId}/${line}`, { method: "DELETE" }),

  getPalletQty: () => fetchApi<any[]>("/master/pallet-qty"),
  setPalletQty: (material: string, qtyPerPallet: number) => fetchApi<any>(`/master/pallet-qty/${material}`, { method: "PUT", body: JSON.stringify({ qtyPerPallet }) }),

  getUom: () => fetchApi<any[]>("/master/uom"),

  getBlockLayout: () => fetchApi<any>("/master/block-layout"),
  saveBlockLayout: (layout: any) => fetchApi<any>("/master/block-layout", { method: "PUT", body: JSON.stringify({ layout }) }),
};
