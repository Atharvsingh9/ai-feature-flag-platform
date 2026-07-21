import axios from "axios";

const REAL_API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";
const MAX_RETRIES = 2;

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

const realClient = axios.create({
  baseURL: REAL_API_BASE,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

realClient.interceptors.response.use(
  (res) => res,
  (error) => {
    const msg = error.response?.data?.detail || error.response?.data?.message || error.message || "Unknown API error";
    return Promise.reject(new Error(msg));
  }
);

async function withRetry<T>(fn: () => Promise<T>): Promise<T> {
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (attempt < MAX_RETRIES && err instanceof Error && err.message.includes("timeout")) {
        await sleep(500 * (attempt + 1));
        continue;
      }
      throw err;
    }
  }
  throw new Error("Unexpected retry exhaustion");
}

export const api = {
  async get<T>(url: string): Promise<T> {
    const response = await withRetry(() => realClient.get<T>(url));
    return response.data;
  },

  async post<T>(url: string, body?: unknown): Promise<T> {
    const response = await withRetry(() => realClient.post<T>(url, body));
    return response.data;
  },

  async patch<T>(url: string, body?: unknown): Promise<T> {
    const response = await withRetry(() => realClient.patch<T>(url, body));
    return response.data;
  },

  async delete<T>(url: string): Promise<T> {
    const response = await withRetry(() => realClient.delete<T>(url));
    return response.data;
  },
};
