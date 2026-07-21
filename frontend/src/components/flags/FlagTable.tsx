import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Trash2, TestTube2 } from "lucide-react";
import type { FeatureFlag } from "../../types/flag";
import { FlagStatusBadge } from "./FlagStatusBadge";
import { ProgressBar } from "../common/ProgressBar";
import { formatDate } from "../../utils/formatters";
import { cn } from "../../utils/cn";

interface FlagTableProps {
  flags: FeatureFlag[];
  onDelete?: (id: string) => void;
}

export function FlagTable({ flags, onDelete }: FlagTableProps) {
  const navigate = useNavigate();

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[860px] text-left text-sm">
          <thead>
            <tr className="border-b border-ink-300/20 text-xs uppercase tracking-wide text-ink-500">
              <th className="px-5 py-3.5 font-medium">Flag Name</th>
              <th className="px-5 py-3.5 font-medium">Status</th>
              <th className="px-5 py-3.5 font-medium">Rollout %</th>
              <th className="px-5 py-3.5 font-medium">Quality</th>
              <th className="px-5 py-3.5 font-medium">Stage</th>
              <th className="px-5 py-3.5 font-medium">Created</th>
              <th className="px-5 py-3.5 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {flags.map((flag, i) => (
              <motion.tr
                key={flag.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => navigate(`/flags/${flag.id}`)}
                className="group cursor-pointer border-b border-ink-300/10 transition-colors last:border-0 hover:bg-primary-50/40"
              >
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-ink-900">{flag.name}</span>
                    {flag.shadowMode && (
                      <span title="Shadow mode enabled">
                        <TestTube2 className="h-3.5 w-3.5 text-warning" />
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-ink-500">{flag.key}</p>
                </td>
                <td className="px-5 py-4">
                  <FlagStatusBadge status={flag.status} />
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-20">
                      <ProgressBar value={flag.rolloutPercentage} height="h-1.5" />
                    </div>
                    <span className="text-xs text-ink-500">{flag.rolloutPercentage}%</span>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <span
                    className={cn(
                      "font-medium",
                      flag.qualityScore >= flag.qualityThreshold ? "text-success" : "text-error"
                    )}
                  >
                    {flag.qualityScore.toFixed(2)}
                  </span>
                  <span className="text-ink-500"> /5</span>
                </td>
                <td className="px-5 py-4 text-ink-700">{flag.currentStage}</td>
                <td className="px-5 py-4 text-ink-500">{formatDate(flag.createdAt)}</td>
                <td className="px-5 py-4 text-right">
                  {onDelete && (
                    <button
                      onClick={(e) => { e.stopPropagation(); onDelete(flag.id); }}
                      className="focus-ring rounded-lg p-1.5 text-ink-500 opacity-0 transition-opacity hover:bg-error-50 hover:text-error group-hover:opacity-100"
                      title="Delete flag"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
      {flags.length === 0 && (
        <div className="p-10 text-center text-sm text-ink-500">No flags match your filters.</div>
      )}
    </div>
  );
}
