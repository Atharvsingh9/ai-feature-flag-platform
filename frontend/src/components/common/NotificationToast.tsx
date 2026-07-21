import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, X } from "lucide-react";

interface ToastProps {
  open: boolean;
  message: string;
  onClose: () => void;
}

export function NotificationToast({ open, message, onClose }: ToastProps) {
  return (
    <div className="pointer-events-none fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="glass pointer-events-auto flex items-center gap-3 rounded-xl2 border border-black/5 px-4 py-3 shadow-soft"
          >
            <CheckCircle2 className="h-5 w-5 text-success" />
            <span className="text-sm font-medium text-ink-900">{message}</span>
            <button onClick={onClose} className="ml-2 text-ink-500 hover:text-ink-900">
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
