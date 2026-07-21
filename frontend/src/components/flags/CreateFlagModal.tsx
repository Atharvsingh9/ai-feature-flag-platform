import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "../common/Button";
import type { FlagCreatePayload } from "../../services/flagService";

interface CreateFlagModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: FlagCreatePayload) => Promise<void>;
}

export function CreateFlagModal({ open, onClose, onSubmit }: CreateFlagModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [baselineVariant, setBaselineVariant] = useState("");
  const [experimentalVariant, setExperimentalVariant] = useState("");
  const [qualityThreshold, setQualityThreshold] = useState(4.0);
  const [shadowEnabled, setShadowEnabled] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!name.trim() || !description.trim() || !baselineVariant.trim() || !experimentalVariant.trim()) {
      setError("All fields are required");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      await onSubmit({
        name: name.trim(),
        description: description.trim(),
        baseline_variant: baselineVariant.trim(),
        experimental_variant: experimentalVariant.trim(),
        quality_threshold: qualityThreshold,
        shadow_enabled: shadowEnabled,
      });
      setName("");
      setDescription("");
      setBaselineVariant("");
      setExperimentalVariant("");
      setQualityThreshold(4.0);
      setShadowEnabled(false);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create flag");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/30 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="card w-full max-w-lg p-6"
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display text-lg font-semibold text-ink-900">Create Feature Flag</h3>
              <button onClick={onClose} className="focus-ring rounded-lg p-1 text-ink-500 hover:bg-black/5">
                <X className="h-5 w-5" />
              </button>
            </div>

            {error && (
              <div className="mb-4 rounded-xl2 bg-error-50 p-3 text-sm text-error">{error}</div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1">Name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="focus-ring w-full rounded-xl2 border border-ink-300/40 bg-white px-3 py-2 text-sm text-ink-900 placeholder:text-ink-300"
                  placeholder="e.g. smart-reply-v2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="focus-ring w-full rounded-xl2 border border-ink-300/40 bg-white px-3 py-2 text-sm text-ink-900 placeholder:text-ink-300"
                  placeholder="Brief description of this flag"
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-ink-700 mb-1">Baseline Variant</label>
                  <input
                    value={baselineVariant}
                    onChange={(e) => setBaselineVariant(e.target.value)}
                    className="focus-ring w-full rounded-xl2 border border-ink-300/40 bg-white px-3 py-2 text-sm text-ink-900 placeholder:text-ink-300"
                    placeholder="e.g. gpt-4-base"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink-700 mb-1">Experimental Variant</label>
                  <input
                    value={experimentalVariant}
                    onChange={(e) => setExperimentalVariant(e.target.value)}
                    className="focus-ring w-full rounded-xl2 border border-ink-300/40 bg-white px-3 py-2 text-sm text-ink-900 placeholder:text-ink-300"
                    placeholder="e.g. gpt-4-turbo"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1">
                  Quality Threshold <span className="text-ink-500">({qualityThreshold.toFixed(1)})</span>
                </label>
                <input
                  type="range"
                  min={0}
                  max={5}
                  step={0.1}
                  value={qualityThreshold}
                  onChange={(e) => setQualityThreshold(Number(e.target.value))}
                  className="w-full"
                />
              </div>
              <label className="flex items-center gap-2 text-sm text-ink-700">
                <input
                  type="checkbox"
                  checked={shadowEnabled}
                  onChange={(e) => setShadowEnabled(e.target.checked)}
                  className="rounded border-ink-300"
                />
                Enable shadow mode
              </label>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <Button variant="secondary" size="sm" onClick={onClose}>Cancel</Button>
              <Button variant="primary" size="sm" onClick={handleSubmit} disabled={submitting}>
                {submitting ? "Creating..." : "Create Flag"}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
