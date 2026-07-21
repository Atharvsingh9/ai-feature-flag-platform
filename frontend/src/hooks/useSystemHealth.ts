import { useApiData } from "./useApiData";
import { getSystemHealth } from "../services/healthService";
import type { ServiceHealth } from "../types/health";

export function useSystemHealth() {
  const { data, loading, error, refetch } = useApiData<ServiceHealth[]>(getSystemHealth);
  return { services: data || [], loading, error, refetch };
}
