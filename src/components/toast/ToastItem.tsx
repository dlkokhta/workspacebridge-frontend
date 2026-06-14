import { useEffect } from "react";
import { motion } from "framer-motion";
import { AlertCircle, CheckCircle2, Info, X, type LucideIcon } from "lucide-react";
import type { Toast, ToastType } from "./types";

const ICONS: Record<ToastType, LucideIcon> = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
};

// Accent colour per toast type, kept within the fixed Tailwind palette.
const ACCENT: Record<ToastType, string> = {
  success: "text-[#5a8a6b] dark:text-[#7fae8d]",
  error: "text-[#c25a4a] dark:text-[#e07b6b]",
  info: "text-[#5a625e] dark:text-[#a0a8a3]",
};

const DEFAULT_DURATION = 5000;

interface ToastItemProps {
  toast: Toast;
  onDismiss: (id: string) => void;
}

export const ToastItem = ({ toast, onDismiss }: ToastItemProps) => {
  const Icon = ICONS[toast.type];
  const duration = toast.duration ?? DEFAULT_DURATION;

  useEffect(() => {
    if (duration <= 0) return;
    const timer = window.setTimeout(() => onDismiss(toast.id), duration);
    return () => window.clearTimeout(timer);
  }, [toast.id, duration, onDismiss]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 24, scale: 0.97 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 24, scale: 0.97 }}
      transition={{ duration: 0.18 }}
      role="status"
      aria-live="polite"
      className="pointer-events-auto flex w-full items-start gap-3 rounded-xl border border-black/[0.08] dark:border-white/[0.07] bg-white dark:bg-[#151a17] p-4 shadow-lg"
    >
      <span className={`mt-px shrink-0 ${ACCENT[toast.type]}`}>
        <Icon size={18} />
      </span>
      <div className="min-w-0 flex-1">
        {toast.title && (
          <p className="text-[13px] font-semibold text-[#1a201c] dark:text-[#e8ece9]">
            {toast.title}
          </p>
        )}
        <p className="text-[13px] leading-[1.45] break-words text-[#5a625e] dark:text-[#a0a8a3]">
          {toast.message}
        </p>
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        aria-label="Dismiss notification"
        className="shrink-0 cursor-pointer text-[#9aa39d] hover:text-[#1a201c] dark:text-[#6b736e] dark:hover:text-[#e8ece9] transition-colors"
      >
        <X size={15} />
      </button>
    </motion.div>
  );
};
