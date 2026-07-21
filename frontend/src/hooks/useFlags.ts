import { useApiData } from "./useApiData";
import { getFlags } from "../services/flagService";
import type { FeatureFlag } from "../types/flag";

export function useFlags() {
  const { data, loading, error, refetch } = useApiData<FeatureFlag[]>(getFlags);
  return { flags: data || [], loading, error, refetch };
}
