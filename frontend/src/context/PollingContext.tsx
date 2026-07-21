import { createContext, useContext, useEffect, useState, useCallback, useRef, type ReactNode } from "react";

interface PollingContextValue {
  tick: number;
  setInterval: (ms: number) => void;
  pause: () => void;
  resume: () => void;
  active: boolean;
}

const PollingContext = createContext<PollingContextValue | null>(null);

export function PollingProvider({ children, defaultInterval = 5000 }: { children: ReactNode; defaultInterval?: number }) {
  const [tick, setTick] = useState(0);
  const [intervalMs, setIntervalMs] = useState(defaultInterval);
  const [active, setActive] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!active) return;
    intervalRef.current = setInterval(() => {
      setTick((t) => t + 1);
    }, intervalMs);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [intervalMs, active]);

  const pause = useCallback(() => setActive(false), []);
  const resume = useCallback(() => setActive(true), []);

  return (
    <PollingContext.Provider value={{ tick, setInterval: setIntervalMs, pause, resume, active }}>
      {children}
    </PollingContext.Provider>
  );
}

export function usePolling() {
  const ctx = useContext(PollingContext);
  if (!ctx) throw new Error("usePolling must be used within PollingProvider");
  return ctx;
}
