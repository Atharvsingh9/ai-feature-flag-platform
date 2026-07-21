import { useEffect, useState, useCallback, useRef } from "react";

export interface PollingState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
  isPolling: boolean;
}

export function usePollingData<T>(
  fetcher: () => Promise<T>,
  intervalMs = 5000,
  deps: unknown[] = [],
  enabled = true
): PollingState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const activeRef = useRef(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetch = useCallback(() => {
    if (!enabled) return;
    activeRef.current = true;
    fetcher()
      .then((result) => {
        if (activeRef.current) {
          setData(result);
          setLoading(false);
          setError(null);
        }
      })
      .catch((err: unknown) => {
        if (activeRef.current) {
          const msg = err instanceof Error ? err.message : "An unexpected error occurred";
          setError(msg);
          setLoading(false);
        }
      });
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetch();
    setIsPolling(true);
    intervalRef.current = setInterval(fetch, intervalMs);
    return () => {
      activeRef.current = false;
      setIsPolling(false);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetch, intervalMs]);

  return { data, loading, error, refetch: fetch, isPolling };
}
