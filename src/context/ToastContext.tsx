import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { ToastViewport } from "../components/toast/ToastViewport";
import { toast as toastApi } from "../components/toast/toast";
import { toastBus } from "../components/toast/toastBus";
import type { Toast, ToastInput } from "../components/toast/types";

// Oldest toasts are dropped once this many are on screen, so a burst of errors
// can't bury the UI.
const MAX_VISIBLE = 4;

interface ToastContextValue {
  toast: typeof toastApi;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const createId = (): string =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback((input: ToastInput) => {
    setToasts((prev) => [...prev, { ...input, id: createId() }].slice(-MAX_VISIBLE));
  }, []);

  // Bridge imperative toast() calls (including from non-React code) into state.
  useEffect(() => toastBus.subscribe(push), [push]);

  const value = useMemo(() => ({ toast: toastApi, dismiss }), [dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextValue => {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return ctx;
};
