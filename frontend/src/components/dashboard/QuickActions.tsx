import { Plus, Rocket, RotateCcw, FileBarChart, Play, TestTube2, Bell, Network, BarChart3, BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ACTIONS = [
  { label: "Create Flag", icon: Plus, path: "/flags" },
  { label: "View Rollouts", icon: Rocket, path: "/rollouts" },
  { label: "Shadow Mode", icon: TestTube2, path: "/shadow" },
  { label: "Live Simulation", icon: Play, path: "/simulation" },
  { label: "Analytics", icon: BarChart3, path: "/analytics" },
  { label: "Quality Report", icon: FileBarChart, path: "/quality" },
  { label: "Slack Alerts", icon: Bell, path: "/slack" },
  { label: "Documentation", icon: BookOpen, path: "/docs" },
  { label: "Rollback History", icon: RotateCcw, path: "/rollbacks" },
  { label: "Architecture", icon: Network, path: "/architecture" },
];

export function QuickActions() {
  const navigate = useNavigate();
  return (
    <div className="grid grid-cols-2 gap-2.5">
      {ACTIONS.map((a) => (
        <button
          key={a.label}
          onClick={() => navigate(a.path)}
          className="focus-ring group flex flex-col items-start gap-2.5 rounded-xl2 border border-ink-300/30 p-3 text-left transition-colors hover:border-primary/30 hover:bg-primary-50"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary-50 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
            <a.icon className="h-4 w-4" />
          </div>
          <span className="text-xs font-medium text-ink-900">{a.label}</span>
        </button>
      ))}
    </div>
  );
}
