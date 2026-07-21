import { useEffect, useState, useCallback, useRef } from "react";

export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useApiData<T>(
  fetcher: () => Promise<T>,
  deps: unknown[] = [],
  enabled = true
): AsyncState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const activeRef = useRef(true);
  const mountedRef = useRef(false);

  const fetch = useCallback(() => {
    if (!enabled) return;
    setLoading(true);
    setError(null);
    activeRef.current = true;
    fetcher()
      .then((result) => {
        if (activeRef.current) {
          setData(result);
          setLoading(false);
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
    mountedRef.current = true;
    fetch();
    return () => {
      activeRef.current = false;
      mountedRef.current = false;
    };
  }, [fetch]);

  return { data, loading, error, refetch: fetch };
}
