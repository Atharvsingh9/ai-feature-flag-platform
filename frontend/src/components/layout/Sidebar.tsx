import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutGrid,
  Flag,
  Rocket,
  Activity,
  SplitSquareHorizontal,
  History,
  Settings,
  ChevronsLeft,
  Sparkles,
  TestTube2,
  Bell,
  Network,
  HeartPulse,
  Play,
  BarChart3,
  BookOpen,
  MonitorPlay,
} from "lucide-react";
import { cn } from "../../utils/cn";

const ITEMS = [
  { label: "Dashboard", path: "/", icon: LayoutGrid },
  { label: "Feature Flags", path: "/flags", icon: Flag },
  { label: "Rollouts", path: "/rollouts", icon: Rocket },
  { label: "Shadow Mode", path: "/shadow", icon: TestTube2 },
  { label: "Quality", path: "/quality", icon: Activity },
  { label: "Canary", path: "/canary", icon: SplitSquareHorizontal },
  { label: "Analytics", path: "/analytics", icon: BarChart3 },
  { label: "Rollback History", path: "/rollbacks", icon: History },
  { label: "Slack Notifications", path: "/slack", icon: Bell },
  { label: "Simulation", path: "/simulation", icon: Play },
  { label: "Documentation", path: "/docs", icon: BookOpen },
  { label: "Architecture", path: "/architecture", icon: Network },
  { label: "System Health", path: "/health", icon: HeartPulse },
  { label: "Demo App", path: "/demo", icon: MonitorPlay },
  { label: "Settings", path: "/settings", icon: Settings },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  return (
    <motion.aside
      animate={{ width: collapsed ? 84 : 264 }}
      transition={{ type: "spring", stiffness: 260, damping: 28 }}
      className="sticky top-0 z-20 flex h-screen shrink-0 flex-col border-r border-black/[0.04] bg-white/70 backdrop-blur-xl"
    >
      <div className="flex items-center gap-3 px-5 py-6">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl2 bg-primary text-white shadow-glow">
          <Sparkles className="h-4.5 w-4.5" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <p className="whitespace-nowrap font-display text-sm font-semibold text-ink-900">Aegis Flags</p>
            <p className="whitespace-nowrap text-[11px] text-ink-500">AI Rollout Platform</p>
          </div>
        )}
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/"}
            className={({ isActive }) =>
              cn(
                "focus-ring group relative flex items-center gap-3 rounded-xl2 px-3 py-2.5 text-sm font-medium transition-colors",
                isActive ? "bg-primary-50 text-primary" : "text-ink-500 hover:bg-black/[0.03] hover:text-ink-900"
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.span
                    layoutId="active-nav-pill"
                    className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-primary"
                  />
                )}
                <item.icon className="h-[18px] w-[18px] shrink-0" />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-3">
        <button
          onClick={onToggle}
          className="focus-ring flex w-full items-center justify-center gap-2 rounded-xl2 border border-ink-300/40 py-2.5 text-ink-500 hover:bg-black/[0.03]"
        >
          <motion.span animate={{ rotate: collapsed ? 180 : 0 }} transition={{ duration: 0.25 }}>
            <ChevronsLeft className="h-4 w-4" />
          </motion.span>
        </button>
      </div>
    </motion.aside>
  );
}
