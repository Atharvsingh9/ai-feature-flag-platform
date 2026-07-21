import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2, AlertTriangle, XCircle, Info, RotateCcw,
  SplitSquareHorizontal, Bell, Rocket, X,
} from "lucide-react";
import type { NotificationType } from "../../context/NotificationContext";

interface ToastItem {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
}

const ICONS: Record<string, any> = {
  success: CheckCircle2,
  warning: AlertTriangle,
  error: XCircle,
  info: Info,
  rollback: RotateCcw,
  canary: SplitSquareHorizontal,
  slack: Bell,
  rollout: Rocket,
};

const COLORS: Record<string, string> = {
  success: "border-success/30 bg-success-50 text-success",
  warning: "border-warning/30 bg-warning-50 text-warning",
  error: "border-error/30 bg-error-50 text-error",
  info: "border-primary/30 bg-primary-50 text-primary",
  rollback: "border-error/30 bg-error-50 text-error",
  canary: "border-warning/30 bg-warning-50 text-warning",
  slack: "border-primary/30 bg-primary-50 text-primary",
  rollout: "border-success/30 bg-success-50 text-success",
};

interface NotificationCenterProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}

export function NotificationCenter({ toasts, onDismiss }: NotificationCenterProps) {
  return (
    <div className="pointer-events-none fixed bottom-6 right-6 z-50 flex flex-col gap-2" role="log" aria-label="Notifications">
      <AnimatePresence>
        {toasts.map((toast) => {
          const Icon = ICONS[toast.type] || Info;
          const colorClass = COLORS[toast.type] || "border-ink-300/30 bg-surface-bg text-ink-700";
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.95, x: 20 }}
              animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
              exit={{ opacity: 0, y: 10, scale: 0.95, x: 20 }}
              className={`pointer-events-auto flex items-start gap-3 rounded-xl2 border px-4 py-3 shadow-soft ${colorClass}`}
              role="alert"
            >
              <Icon className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{toast.title}</p>
                <p className="text-xs opacity-80">{toast.message}</p>
              </div>
              <button
                onClick={() => onDismiss(toast.id)}
                className="shrink-0 rounded-lg p-0.5 opacity-60 hover:opacity-100 focus-ring"
                aria-label="Dismiss notification"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = useCallback((type: NotificationType, title: string, message: string) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { toasts, addToast, dismiss };
}
