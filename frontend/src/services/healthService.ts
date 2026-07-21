import { api } from "./api";
import type { ServiceHealth } from "../types/health";

export async function getSystemHealth(): Promise<ServiceHealth[]> {
  const data = await api.get<any[]>("/health/services");
  return (data || []).map((d: any) => ({
    id: d.id,
    name: d.name,
    status: d.status,
    latencyMs: d.latencyMs,
    cpuPercent: d.cpuPercent,
    memoryMb: d.memoryMb,
    requestsPerMin: d.requestsPerMin,
    failuresPerMin: d.failuresPerMin,
    uptimePercent: d.uptimePercent,
    history: d.history || [],
  }));
}
