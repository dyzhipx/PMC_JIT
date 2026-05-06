import { fetchApi } from "../api-client";

export const productionApi = {
  getLineStockAll: () => fetchApi<any>("/production/stock"),
  getLineStockByLine: (line: string) => fetchApi<any>(`/production/stock/${line}`),
  getLineBarcodes: (line?: string) => {
    const params = new URLSearchParams();
    if (line) params.append("line", line);
    return fetchApi<any>(`/production/barcodes?${params.toString()}`);
  },
  receiveToLine: (data: { line: string; material: string; barcode: string; pcs: number }) => 
    fetchApi<any>("/production/receive", { method: "POST", body: JSON.stringify(data) }),
  returnFromLine: (barcode: string) => 
    fetchApi<any>("/production/return", { method: "POST", body: JSON.stringify({ barcode }) }),
  getPendingReturns: () => fetchApi<any[]>("/production/returns/pending"),
  verifyReturn: (id: string, action: "approve" | "reject") => 
    fetchApi<any>(`/production/returns/${id}/verify`, { method: "POST", body: JSON.stringify({ action }) }),
  getExternalOnhand: (dest: string) => fetchApi<any>(`/production/external/${dest}`),
};
