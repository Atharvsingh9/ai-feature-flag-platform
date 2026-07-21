import { memo } from "react";
import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { cn } from "../../utils/cn";

interface StatCardProps {
  label: string;
  value: string;
  delta?: string;
  trend?: "up" | "down" | "flat";
  goodIsUp?: boolean;
  icon: ReactNode;
  accent?: "primary" | "success" | "warning" | "error";
  index?: number;
}

const accentMap = {
  primary: "bg-primary-50 text-primary",
  success: "bg-success-50 text-success",
  warning: "bg-warning-50 text-warning",
  error: "bg-error-50 text-error",
};

export const StatCard = memo(function StatCard({
  label, value, delta, trend, goodIsUp = true, icon, accent = "primary", index = 0,
}: StatCardProps) {
  const isGood = trend === "flat" ? null : goodIsUp ? trend === "up" : trend === "down";
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.35 }}
      whileHover={{ y: -3 }}
      className="card group p-5"
      role="region"
      aria-label={label}
    >
      <div className="flex items-center justify-between">
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl2 transition-transform group-hover:scale-105", accentMap[accent])} aria-hidden="true">
          {icon}
        </div>
        {delta && (
          <div className={cn("flex items-center gap-0.5 text-xs font-medium", isGood === null ? "text-ink-500" : isGood ? "text-success" : "text-error")} aria-label={`${delta}`}>
            {trend === "up" ? <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" /> : trend === "down" ? <ArrowDownRight className="h-3.5 w-3.5" aria-hidden="true" /> : null}
            {delta}
          </div>
        )}
      </div>
      <p className="mt-4 font-display text-2xl font-semibold text-ink-900">{value}</p>
      <p className="mt-1 text-sm text-ink-500">{label}</p>
    </motion.div>
  );
});
