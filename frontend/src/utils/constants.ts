export const STAGES = ["1%", "5%", "25%", "50%", "100%"] as const;

export const STATUS_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  active: { bg: "bg-success-50", text: "text-success", dot: "bg-success" },
  rolling_out: { bg: "bg-primary-50", text: "text-primary", dot: "bg-primary" },
  paused: { bg: "bg-warning-50", text: "text-warning", dot: "bg-warning" },
  rolled_back: { bg: "bg-error-50", text: "text-error", dot: "bg-error" },
  draft: { bg: "bg-ink-300/20", text: "text-ink-500", dot: "bg-ink-500" },
  completed: { bg: "bg-primary-50", text: "text-primary", dot: "bg-primary" },
};

export const NAV_ITEMS = [
  { label: "Dashboard", path: "/" },
  { label: "Feature Flags", path: "/flags" },
  { label: "Rollouts", path: "/rollouts" },
  { label: "Shadow Mode", path: "/shadow" },
  { label: "Quality", path: "/quality" },
  { label: "Canary", path: "/canary" },
  { label: "Analytics", path: "/analytics" },
  { label: "Rollback History", path: "/rollbacks" },
  { label: "Slack Notifications", path: "/slack" },
  { label: "Simulation", path: "/simulation" },
  { label: "Demo App", path: "/demo" },
  { label: "Documentation", path: "/docs" },
  { label: "Architecture", path: "/architecture" },
  { label: "System Health", path: "/health" },
  { label: "Settings", path: "/settings" },
];
