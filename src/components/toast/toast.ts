import { toastBus } from "./toastBus";
import type { ToastOptions } from "./types";

// Imperative toast API usable from anywhere — components, hooks, the axios
// interceptor or React Query caches. Inside components prefer useToast(), which
// returns this same object plus dismiss().
export const toast = {
  success: (message: string, options?: ToastOptions) =>
    toastBus.emit({ type: "success", message, ...options }),
  error: (message: string, options?: ToastOptions) =>
    toastBus.emit({ type: "error", message, ...options }),
  info: (message: string, options?: ToastOptions) =>
    toastBus.emit({ type: "info", message, ...options }),
};
