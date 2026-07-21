import type { ReactNode } from "react";
import { motion } from "framer-motion";

interface ChartCardProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function ChartCard({ title, subtitle, action, children, className }: ChartCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`card p-5 ${className ?? ""}`}
    >
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h3 className="font-display text-sm font-semibold text-ink-900">{title}</h3>
          {subtitle && <p className="text-xs text-ink-500">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </motion.div>
  );
}
