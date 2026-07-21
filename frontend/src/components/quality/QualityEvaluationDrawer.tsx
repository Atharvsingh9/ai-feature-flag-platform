import { AnimatePresence, motion } from "framer-motion";
import { X, Gauge, MessageSquare, ThumbsUp, AlertTriangle, CheckCircle2 } from "lucide-react";
import type { QualityPoint } from "../../types/quality";
import { formatDateTime, formatLatency } from "../../utils/formatters";

interface DrawerProps {
  open: boolean;
  point: QualityPoint | null;
  onClose: () => void;
}

export function QualityEvaluationDrawer({ open, point, onClose }: DrawerProps) {
  return (
    <AnimatePresence>
      {open && point && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-start justify-end bg-ink-900/20 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            transition={{ type: "spring", damping: 30, stiffness: 260 }}
            className="h-full w-full max-w-lg overflow-y-auto bg-white p-6 shadow-soft"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-display text-lg font-semibold text-ink-900">Quality Evaluation</h3>
                <p className="text-sm text-ink-500">{formatDateTime(point.timestamp)}</p>
              </div>
              <button onClick={onClose} className="focus-ring rounded-lg p-2 text-ink-500 hover:bg-black/5">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-5">
              <div className="rounded-xl2 bg-surface-bg p-4">
                <p className="flex items-center gap-2 text-xs font-semibold text-ink-500 mb-2">
                  <MessageSquare className="h-3.5 w-3.5" /> Original User Prompt
                </p>
                <p className="text-sm text-ink-700">
                  Summarize the quarterly financial report highlighting revenue growth, cost reductions, and key risks.
                </p>
              </div>

              <div className="rounded-xl2 bg-surface-bg p-4">
                <p className="flex items-center gap-2 text-xs font-semibold text-ink-500 mb-2">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Generated Response
                </p>
                <p className="text-sm text-ink-700">
                  Q3 revenue grew 23% YoY to $1.2B driven by enterprise expansion. Operating costs reduced 12% through
                  infrastructure optimization. Key risks include supply chain disruptions and FX volatility.
                </p>
              </div>

              <div className="rounded-xl2 bg-surface-bg p-4">
                <p className="flex items-center gap-2 text-xs font-semibold text-ink-500 mb-2">
                  <Gauge className="h-3.5 w-3.5" /> Judge Prompt
                </p>
                <p className="text-sm text-ink-700">
                  Evaluate the response on accuracy, completeness, clarity, and conciseness. Score from 1-5 where 5 is excellent.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl2 bg-surface-bg p-4 text-center">
                  <p className="text-xs text-ink-500">Judge Score</p>
                  <p className={`font-display text-2xl font-semibold mt-1 ${point.judgeScore >= 4.0 ? "text-success" : point.judgeScore >= 3.0 ? "text-warning" : "text-error"}`}>
                    {point.judgeScore.toFixed(2)}
                  </p>
                </div>
                <div className="rounded-xl2 bg-surface-bg p-4 text-center">
                  <p className="text-xs text-ink-500">Latency</p>
                  <p className="font-display text-2xl font-semibold mt-1 text-warning">{formatLatency(point.latencyMs)}</p>
                </div>
              </div>

              <div className="rounded-xl2 bg-surface-bg p-4">
                <p className="flex items-center gap-2 text-xs font-semibold text-ink-500 mb-2">
                  <ThumbsUp className="h-3.5 w-3.5" /> User Feedback
                </p>
                <div className="flex items-center gap-2">
                  <span className={`text-lg font-semibold ${point.userFeedback >= 85 ? "text-success" : "text-warning"}`}>
                    {point.userFeedback.toFixed(1)}
                  </span>
                  <span className="text-xs text-ink-500">/ 100</span>
                </div>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-pill bg-ink-300/20">
                  <div
                    className={`h-full rounded-pill transition-all ${point.userFeedback >= 85 ? "bg-success" : point.userFeedback >= 70 ? "bg-warning" : "bg-error"}`}
                    style={{ width: `${point.userFeedback}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-xl2 bg-surface-bg p-4">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl2 ${point.errorRate > 2 ? "bg-error-50" : "bg-success-50"}`}>
                  {point.errorRate > 2 ? <AlertTriangle className="h-5 w-5 text-error" /> : <CheckCircle2 className="h-5 w-5 text-success" />}
                </div>
                <div>
                  <p className="text-xs text-ink-500">Errors</p>
                  <p className={`text-sm font-medium ${point.errorRate > 2 ? "text-error" : "text-success"}`}>
                    {point.errorRate.toFixed(2)}% error rate
                  </p>
                </div>
              </div>

              <div className="rounded-xl2 border border-ink-300/10 p-4">
                <p className="text-xs font-semibold text-ink-500 mb-3">Quality Breakdown</p>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-ink-500">Judge Score</span>
                      <span className="font-medium text-ink-900">{(point.judgeScore / 5 * 100).toFixed(0)}%</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-pill bg-ink-300/20">
                      <div className="h-full rounded-pill bg-primary" style={{ width: `${point.judgeScore / 5 * 100}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-ink-500">Latency</span>
                      <span className="font-medium text-ink-900">{point.latencyMs}ms</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-pill bg-ink-300/20">
                      <div className={`h-full rounded-pill ${point.latencyMs > 500 ? "bg-error" : point.latencyMs > 350 ? "bg-warning" : "bg-success"}`}
                        style={{ width: `${Math.min(100, (point.latencyMs / 600) * 100)}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-ink-500">User Feedback</span>
                      <span className="font-medium text-ink-900">{point.userFeedback.toFixed(0)}%</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-pill bg-ink-300/20">
                      <div className={`h-full rounded-pill ${point.userFeedback >= 85 ? "bg-success" : "bg-warning"}`}
                        style={{ width: `${point.userFeedback}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-ink-500">Error Rate</span>
                      <span className="font-medium text-ink-900">{point.errorRate.toFixed(2)}%</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-pill bg-ink-300/20">
                      <div className={`h-full rounded-pill ${point.errorRate > 2 ? "bg-error" : "bg-success"}`}
                        style={{ width: `${Math.min(100, point.errorRate * 20)}%` }} />
                    </div>
                  </div>
                  <div className="pt-2 border-t border-ink-300/10">
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-ink-700">Overall Score</span>
                      <span className={`${point.quality >= 4.0 ? "text-success" : "text-warning"}`}>{point.quality.toFixed(2)} / 5.0</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-pill bg-ink-300/20">
                      <div className={`h-full rounded-pill ${point.quality >= 4.0 ? "bg-success" : point.quality >= 3.0 ? "bg-warning" : "bg-error"}`}
                        style={{ width: `${(point.quality / 5) * 100}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
