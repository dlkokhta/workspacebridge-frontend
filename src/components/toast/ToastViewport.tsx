import { createPortal } from "react-dom";
import { AnimatePresence } from "framer-motion";
import { ToastItem } from "./ToastItem";
import type { Toast } from "./types";

interface ToastViewportProps {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}

// Fixed top-right stack, portalled to <body> so it sits above every layout and
// is unaffected by transformed ancestors. The container ignores pointer events
// so it never blocks the UI; individual toasts re-enable them.
export const ToastViewport = ({ toasts, onDismiss }: ToastViewportProps) =>
  createPortal(
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[60] flex flex-col items-end gap-2 p-4 sm:inset-x-auto sm:right-0">
      <div className="flex w-full max-w-sm flex-col gap-2">
        <AnimatePresence initial={false}>
          {toasts.map((toast) => (
            <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
          ))}
        </AnimatePresence>
      </div>
    </div>,
    document.body,
  );
