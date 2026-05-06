export async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";
  const url = `${baseURL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    credentials: "include", 
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.error || `API Error: ${response.statusText}`);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}
