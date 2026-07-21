import { useApiData } from "./useApiData";
import { getShadowTests, getShadowOverview, getShadowQualitySeries } from "../services/shadowService";
import type { ShadowTest, ShadowOverview, ShadowQualityPoint } from "../types/shadow";
import { useMemo } from "react";

export function useShadowTests() {
  const tests = useApiData<ShadowTest[]>(getShadowTests);
  const overview = useApiData<ShadowOverview>(getShadowOverview);
  const series = useApiData<ShadowQualityPoint[]>(getShadowQualitySeries);

  const loading = tests.loading || overview.loading || series.loading;
  const error = tests.error || overview.error || series.error;
  const refetch = () => { tests.refetch(); overview.refetch(); series.refetch(); };

  const combined = useMemo(() => ({
    tests: tests.data || [],
    overview: overview.data || null,
    series: series.data || [],
    loading,
    error,
    refetch,
  }), [tests.data, overview.data, series.data, loading, error]);

  return combined;
}
