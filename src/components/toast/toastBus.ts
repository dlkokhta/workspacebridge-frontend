import type { ToastInput } from "./types";

type Listener = (toast: ToastInput) => void;

// Module-level bridge so non-React callers (the axios interceptor, React Query
// caches) can raise toasts. The ToastProvider registers the single live
// listener on mount; anything emitted before a provider mounts is dropped.
let listener: Listener | null = null;

export const toastBus = {
  subscribe(fn: Listener): () => void {
    listener = fn;
    return () => {
      if (listener === fn) listener = null;
    };
  },
  emit(toast: ToastInput): void {
    listener?.(toast);
  },
};
