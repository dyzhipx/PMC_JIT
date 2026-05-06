import { fetchApi } from "../api-client";

export const scheduleApi = {
  getAllSchedules: (params?: { date?: string; line?: string; status?: string }) => {
    const urlParams = new URLSearchParams();
    if (params?.date) urlParams.append("date", params.date);
    if (params?.line) urlParams.append("line", params.line);
    if (params?.status) urlParams.append("status", params.status);
    return fetchApi<any[]>(`/schedule?${urlParams.toString()}`);
  },
  getUniqueDates: () => fetchApi<string[]>("/schedule/dates"),
  importSchedules: (items: any[]) => fetchApi<any>("/schedule/import", { method: "POST", body: JSON.stringify({ items }) }),
  updateSchedule: (id: string, data: any) => fetchApi<any>(`/schedule/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteSchedule: (id: string) => fetchApi<any>(`/schedule/${id}`, { method: "DELETE" }),
  markDateConverted: (date: string) => fetchApi<any>(`/schedule/convert/${date}`, { method: "POST" }),
  getShiftSummary: (date: string) => fetchApi<any>(`/schedule/shift-summary/${date}`),
};
