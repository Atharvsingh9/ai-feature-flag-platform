import { Clock, TrendingUp, Zap, ShieldCheck } from "lucide-react";
import type { RolloutEvent } from "../../types/rollout";
import { ProgressBar } from "../common/ProgressBar";
import { Badge } from "../common/Badge";
import { formatDate } from "../../utils/formatters";

const QUALITY_LABEL: Record<string, string> = {
  healthy: "active",
  at_risk: "paused",
  failing: "rolled_back",
};

export function StageCard({ rollout }: { rollout: RolloutEvent }) {
  return (
    <div className="card p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="font-display text-base font-semibold text-ink-900">{rollout.flagName}</h3>
          <p className="text-xs text-ink-500">Started {formatDate(rollout.startedAt)}</p>
        </div>
        <Badge status={QUALITY_LABEL[rollout.qualityStatus]} label={rollout.qualityStatus.replace("_", " ")} />
      </div>

      <div className="mb-5">
        <div className="mb-1.5 flex justify-between text-xs text-ink-500">
          <span>Overall progress</span>
          <span>{rollout.progress}%</span>
        </div>
        <ProgressBar value={rollout.progress} />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { icon: TrendingUp, label: "Traffic", value: `${rollout.trafficPercentage}%` },
          { icon: Clock, label: "Remaining", value: `${rollout.remainingMinutes}m` },
          { icon: Zap, label: "Est. done", value: formatDate(rollout.estimatedCompletion) },
          { icon: ShieldCheck, label: "Auto-advance", value: rollout.autoAdvance ? "On" : "Off" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl2 bg-surface-bg p-3">
            <s.icon className="h-3.5 w-3.5 text-ink-500" />
            <p className="mt-1.5 text-sm font-semibold text-ink-900">{s.value}</p>
            <p className="text-[11px] text-ink-500">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
