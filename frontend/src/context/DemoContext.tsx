import { createContext, useContext, useState, useRef, useCallback, useEffect, type ReactNode } from "react";

interface DemoContextValue {
  enabled: boolean;
  toggle: () => void;
  tick: number;
  simulationActive: boolean;
  startSimulation: () => void;
  pauseSimulation: () => void;
  resetSimulation: () => void;
}

const DemoContext = createContext<DemoContextValue | null>(null);

export function DemoProvider({ children }: { children: ReactNode }) {
  const [enabled, setEnabled] = useState(false);
  const [tick, setTick] = useState(0);
  const [simulationActive, setSimulationActive] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const simIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const toggle = useCallback(() => setEnabled((v) => !v), []);

  const startSimulation = useCallback(() => {
    setSimulationActive(true);
  }, []);

  const pauseSimulation = useCallback(() => {
    setSimulationActive(false);
  }, []);

  const resetSimulation = useCallback(() => {
    setSimulationActive(false);
    setTick(0);
  }, []);

  useEffect(() => {
    if (enabled) {
      intervalRef.current = setInterval(() => {
        setTick((t) => t + 1);
      }, 2000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [enabled]);

  useEffect(() => {
    if (simulationActive) {
      simIntervalRef.current = setInterval(() => {
        setTick((t) => t + 1);
      }, 1500);
    }
    return () => {
      if (simIntervalRef.current) clearInterval(simIntervalRef.current);
    };
  }, [simulationActive]);

  return (
    <DemoContext.Provider value={{ enabled, toggle, tick, simulationActive, startSimulation, pauseSimulation, resetSimulation }}>
      {children}
    </DemoContext.Provider>
  );
}

export function useDemo() {
  const ctx = useContext(DemoContext);
  if (!ctx) throw new Error("useDemo must be used within DemoProvider");
  return ctx;
}
