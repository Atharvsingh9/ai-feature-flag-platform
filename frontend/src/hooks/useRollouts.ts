import { useApiData } from "./useApiData";
import { getRollouts } from "../services/rolloutService";

export function useRollouts() {
  const { data, loading, error, refetch } = useApiData(getRollouts);
  return { rollouts: data || [], loading, error, refetch };
}
