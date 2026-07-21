import { CheckCircle2, XCircle } from "lucide-react";
import type { CanaryResult } from "../../types/canary";
import { MetricComparison } from "./MetricComparison";
import { ConfidenceCard } from "./ConfidenceCard";
import { cn } from "../../utils/cn";
import { formatDateTime } from "../../utils/formatters";

export function CanaryComparison({ result }: { result: CanaryResult }) {
  const passed = result.decision === "passed";
  return (
    <div className="card p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-display text-base font-semibold text-ink-900">{result.flagName}</h3>
          <p className="text-xs text-ink-500">Analyzed {formatDateTime(result.analyzedAt)}</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-ink-500">
          <span className="rounded-pill bg-surface-bg px-3 py-1">Baseline</span>
          <span>vs</span>
          <span className="rounded-pill bg-primary-50 px-3 py-1 text-primary">Experimental</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <MetricComparison rows={result.rows} />
        </div>
        <div className="flex flex-col gap-4">
          <ConfidenceCard confidence={result.confidence} significant={result.statisticallySignificant} />
          <div
            className={cn(
              "flex items-center gap-3 rounded-xl2 border p-4",
              passed ? "border-success/30 bg-success-50" : "border-error/30 bg-error-50"
            )}
          >
            {passed ? <CheckCircle2 className="h-6 w-6 text-success" /> : <XCircle className="h-6 w-6 text-error" />}
            <div>
              <p className={cn("font-display text-sm font-semibold", passed ? "text-success" : "text-error")}>
                Canary {passed ? "Passed" : "Failed"}
              </p>
              <p className="text-xs text-ink-500">{result.statisticallySignificant ? "Result is significant" : "Awaiting more samples"}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
