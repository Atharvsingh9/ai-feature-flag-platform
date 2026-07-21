import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Rocket, SplitSquareHorizontal, RotateCcw, TestTube2, Flag, Activity, Search, Bell } from "lucide-react";
import { cn } from "../../utils/cn";

const ICONS: Record<string, any> = {
  rollout: Rocket,
  canary: SplitSquareHorizontal,
  rollback: RotateCcw,
  shadow: TestTube2,
  flag: Flag,
  quality: Activity,
  slack: Bell,
};

const COLORS: Record<string, string> = {
  rollout: "bg-primary-50 text-primary",
  canary: "bg-success-50 text-success",
  rollback: "bg-error-50 text-error",
  shadow: "bg-warning-50 text-warning",
  flag: "bg-primary-50 text-primary",
  quality: "bg-ink-300/20 text-ink-700",
  slack: "bg-ink-300/20 text-ink-700",
};

const CATEGORIES = ["all", "rollout", "canary", "rollback", "shadow", "flag", "quality", "slack"];

function timeAgo(iso: string) {
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 60) return `${mins}m ago`;
  return `${Math.round(mins / 60)}h ago`;
}

interface ActivityFeedProps {
  compact?: boolean;
  showFilters?: boolean;
}

export function ActivityFeed({ compact, showFilters }: ActivityFeedProps) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  const items = useMemo(() => {
    return []
      .filter((item: any) => category === "all" || item.type === category)
      .filter((item: any) => !search || item.text.toLowerCase().includes(search.toLowerCase()))
      .slice(0, compact ? 5 : 50);
  }, [search, category, compact]);

  return (
    <div>
      {showFilters && (
        <div className="mb-3 space-y-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search activity..."
              className="focus-ring w-full rounded-xl2 border border-ink-300/40 bg-white py-1.5 pl-8 pr-3 text-xs text-ink-900 placeholder:text-ink-500"
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={cn(
                  "rounded-pill px-2.5 py-1 text-[10px] font-medium transition-colors",
                  category === cat
                    ? "bg-primary text-white"
                    : "bg-surface-bg text-ink-500 hover:bg-ink-300/20"
                )}
              >
                {cat === "all" ? "All" : cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>
        </div>
      )}
      <div className={cn("space-y-1", !compact && "max-h-[400px] overflow-y-auto")}>
        {items.length === 0 && (
          <p className="py-4 text-center text-sm text-ink-500">No activity found.</p>
        )}
        {items.map((item: any, i: number) => {
          const Icon = ICONS[item.type] || Activity;
          const colorClass = COLORS[item.type] || "bg-ink-300/20 text-ink-700";
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              className="flex items-start gap-3 rounded-xl2 p-2.5 hover:bg-surface-bg"
            >
              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${colorClass}`}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-ink-900">{item.text}</p>
                <p className="text-xs text-ink-500">{timeAgo(item.time)}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
