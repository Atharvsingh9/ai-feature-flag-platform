import { AnimatePresence, motion } from "framer-motion";
import { X, Clock, Gauge, Cpu, DollarSign, User, CheckCircle2, AlertTriangle } from "lucide-react";
import { formatDateTime, formatLatency } from "../../utils/formatters";

interface EvaluationData {
  id: string;
  prompt: string;
  response: string;
  promptVersion: string;
  model: string;
  latencyMs: number;
  judgeScore: number;
  qualityScore: number;
  tokenUsage: { prompt: number; completion: number; total: number };
  cost: number;
  executionTimeMs: number;
  timestamp: string;
  userMetadata: Record<string, string>;
  decision: "pass" | "fail";
}

interface EvaluationInspectorProps {
  open: boolean;
  evaluation: EvaluationData | null;
  onClose: () => void;
}

export function EvaluationInspector({ open, evaluation, onClose }: EvaluationInspectorProps) {
  return (
    <AnimatePresence>
      {open && evaluation && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-start justify-end bg-ink-900/20 backdrop-blur-sm"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label="Evaluation inspector"
        >
          <motion.div
            initial={{ x: 480, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 480, opacity: 0 }}
            transition={{ type: "spring", damping: 30, stiffness: 260 }}
            className="h-full w-full max-w-xl overflow-y-auto bg-white shadow-soft"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-ink-300/10 bg-white/80 px-6 py-4 backdrop-blur-xl">
              <div>
                <h3 className="font-display text-base font-semibold text-ink-900">Evaluation Inspector</h3>
                <p className="text-xs text-ink-500">ID: {evaluation.id}</p>
              </div>
              <button
                onClick={onClose}
                className="focus-ring rounded-lg p-2 text-ink-500 hover:bg-black/5"
                aria-label="Close inspector"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="rounded-xl2 bg-surface-bg p-4">
                <p className="text-xs font-semibold text-ink-500 mb-2">Prompt</p>
                <p className="text-sm text-ink-700 whitespace-pre-wrap">{evaluation.prompt || "No prompt data"}</p>
              </div>

              <div className="rounded-xl2 bg-surface-bg p-4">
                <p className="text-xs font-semibold text-ink-500 mb-2">Response</p>
                <p className="text-sm text-ink-700 whitespace-pre-wrap">{evaluation.response || "No response data"}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl2 bg-surface-bg p-3">
                  <p className="text-[10px] text-ink-500 uppercase tracking-wider">Prompt Version</p>
                  <p className="mt-1 text-sm font-medium text-ink-900">{evaluation.promptVersion}</p>
                </div>
                <div className="rounded-xl2 bg-surface-bg p-3">
                  <p className="text-[10px] text-ink-500 uppercase tracking-wider">Model</p>
                  <p className="mt-1 text-sm font-medium text-ink-900">{evaluation.model}</p>
                </div>
                <div className="rounded-xl2 bg-surface-bg p-3">
                  <p className="text-[10px] text-ink-500 uppercase tracking-wider">Latency</p>
                  <p className="mt-1 flex items-center gap-1 text-sm font-medium text-warning">
                    <Clock className="h-3.5 w-3.5" />
                    {formatLatency(evaluation.latencyMs)}
                  </p>
                </div>
                <div className="rounded-xl2 bg-surface-bg p-3">
                  <p className="text-[10px] text-ink-500 uppercase tracking-wider">Judge Score</p>
                  <p className={`mt-1 flex items-center gap-1 text-sm font-medium ${evaluation.judgeScore >= 4.0 ? "text-success" : "text-error"}`}>
                    <Gauge className="h-3.5 w-3.5" />
                    {evaluation.judgeScore.toFixed(2)}
                  </p>
                </div>
                <div className="rounded-xl2 bg-surface-bg p-3">
                  <p className="text-[10px] text-ink-500 uppercase tracking-wider">Quality Score</p>
                  <p className={`mt-1 flex items-center gap-1 text-sm font-medium ${evaluation.qualityScore >= 4.0 ? "text-success" : evaluation.qualityScore >= 3.5 ? "text-warning" : "text-error"}`}>
                    {evaluation.qualityScore.toFixed(2)}
                  </p>
                </div>
                <div className="rounded-xl2 bg-surface-bg p-3">
                  <p className="text-[10px] text-ink-500 uppercase tracking-wider">Decision</p>
                  <p className={`mt-1 flex items-center gap-1 text-sm font-medium ${evaluation.decision === "pass" ? "text-success" : "text-error"}`}>
                    {evaluation.decision === "pass" ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertTriangle className="h-3.5 w-3.5" />}
                    {evaluation.decision === "pass" ? "Pass" : "Fail"}
                  </p>
                </div>
              </div>

              <div className="rounded-xl2 bg-surface-bg p-4">
                <p className="text-xs font-semibold text-ink-500 mb-3">Token Usage</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-ink-500">Prompt</span>
                    <span className="text-xs font-medium text-ink-900">{evaluation.tokenUsage.prompt.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-ink-500">Completion</span>
                    <span className="text-xs font-medium text-ink-900">{evaluation.tokenUsage.completion.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between border-t border-ink-300/10 pt-2">
                    <span className="text-xs font-semibold text-ink-700">Total</span>
                    <span className="text-xs font-semibold text-ink-900">{evaluation.tokenUsage.total.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl2 bg-surface-bg p-3">
                  <p className="flex items-center gap-1 text-[10px] text-ink-500 uppercase tracking-wider">
                    <DollarSign className="h-3 w-3" /> Cost
                  </p>
                  <p className="mt-1 text-sm font-medium text-ink-900">${evaluation.cost.toFixed(6)}</p>
                </div>
                <div className="rounded-xl2 bg-surface-bg p-3">
                  <p className="flex items-center gap-1 text-[10px] text-ink-500 uppercase tracking-wider">
                    <Cpu className="h-3 w-3" /> Execution Time
                  </p>
                  <p className="mt-1 text-sm font-medium text-ink-900">{formatLatency(evaluation.executionTimeMs)}</p>
                </div>
              </div>

              <div className="rounded-xl2 bg-surface-bg p-3">
                <p className="text-[10px] text-ink-500 uppercase tracking-wider">Timestamp</p>
                <p className="mt-1 text-sm font-medium text-ink-900">{formatDateTime(evaluation.timestamp)}</p>
              </div>

              {Object.keys(evaluation.userMetadata).length > 0 && (
                <div className="rounded-xl2 bg-surface-bg p-3">
                  <p className="flex items-center gap-1 text-[10px] text-ink-500 uppercase tracking-wider mb-2">
                    <User className="h-3 w-3" /> User Metadata
                  </p>
                  <div className="space-y-1">
                    {Object.entries(evaluation.userMetadata).map(([key, val]) => (
                      <div key={key} className="flex justify-between text-xs">
                        <span className="text-ink-500">{key}</span>
                        <span className="text-ink-700">{val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export type { EvaluationData };
