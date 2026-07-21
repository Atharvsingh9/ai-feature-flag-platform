import { useApiData } from "./useApiData";
import { getCanaryResults } from "../services/canaryService";
import type { CanaryResult } from "../types/canary";

export function useCanary() {
  const { data, loading, error, refetch } = useApiData<CanaryResult[]>(getCanaryResults);
  return { results: data || [], loading, error, refetch };
}
