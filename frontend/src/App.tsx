import { useState, lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Sidebar } from "./components/layout/Sidebar";
import { Navbar } from "./components/layout/Navbar";
import { DemoProvider } from "./context/DemoContext";
import { NotificationProvider } from "./context/NotificationContext";
import { PollingProvider } from "./context/PollingContext";
import { LoadingSpinner } from "./components/common/LoadingSpinner";
import Dashboard from "./pages/Dashboard";
import FeatureFlags from "./pages/FeatureFlags";
import FlagDetails from "./pages/FlagDetails";
import Rollouts from "./pages/Rollouts";
import ShadowMode from "./pages/ShadowMode";
import QualityMonitoring from "./pages/QualityMonitoring";
import CanaryAnalysis from "./pages/CanaryAnalysis";
import RollbackHistory from "./pages/RollbackHistory";
import SlackNotifications from "./pages/SlackNotifications";
import Architecture from "./pages/Architecture";
import SystemHealthPage from "./pages/SystemHealth";
import RolloutSimulation from "./pages/RolloutSimulation";
import SettingsPage from "./pages/Settings";
import DemoApp from "./pages/DemoApp";

const Analytics = lazy(() => import("./pages/Analytics"));
const Documentation = lazy(() => import("./pages/Documentation"));

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.2 }}
      >
        <Suspense fallback={<div className="flex h-[60vh] items-center justify-center"><LoadingSpinner label="Loading..." /></div>}>
          <Routes location={location}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/flags" element={<FeatureFlags />} />
            <Route path="/flags/:id" element={<FlagDetails />} />
            <Route path="/rollouts" element={<Rollouts />} />
            <Route path="/shadow" element={<ShadowMode />} />
            <Route path="/quality" element={<QualityMonitoring />} />
            <Route path="/canary" element={<CanaryAnalysis />} />
            <Route path="/rollbacks" element={<RollbackHistory />} />
            <Route path="/slack" element={<SlackNotifications />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/docs" element={<Documentation />} />
            <Route path="/architecture" element={<Architecture />} />
            <Route path="/health" element={<SystemHealthPage />} />
            <Route path="/simulation" element={<RolloutSimulation />} />
            <Route path="/demo" element={<DemoApp />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </Suspense>
      </motion.div>
    </AnimatePresence>
  );
}

export default function App() {
  const [collapsed, setCollapsed] = useState(false);
  const [dark, setDark] = useState(false);

  return (
    <BrowserRouter>
      <DemoProvider>
        <NotificationProvider>
          <PollingProvider defaultInterval={5000}>
            <div className={dark ? "dark" : ""}>
              <div className="flex min-h-screen bg-surface-bg">
                <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((v) => !v)} />
                <div className="flex min-h-screen flex-1 flex-col">
                  <Navbar dark={dark} onToggleDark={() => setDark((v) => !v)} />
                  <main className="flex-1 p-6">
                    <AnimatedRoutes />
                  </main>
                </div>
              </div>
            </div>
          </PollingProvider>
        </NotificationProvider>
      </DemoProvider>
    </BrowserRouter>
  );
}
