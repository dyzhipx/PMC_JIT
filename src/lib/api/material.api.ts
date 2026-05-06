import { fetchApi } from "../api-client";

export const materialApi = {
  getRequirements: (date: string) => fetchApi<any>(`/material/requirements/${date}`),
  getLineRequirements: (date: string) => fetchApi<any>(`/material/line-requirements/${date}`),
};
