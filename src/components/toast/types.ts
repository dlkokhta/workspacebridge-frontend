export type ToastType = "success" | "error" | "info";

export interface ToastOptions {
  /** Optional bold heading shown above the message. */
  title?: string;
  /** Auto-dismiss delay in ms. Pass 0 to keep the toast until dismissed. */
  duration?: number;
}

export interface ToastInput extends ToastOptions {
  type: ToastType;
  message: string;
}

export interface Toast extends ToastInput {
  id: string;
}
