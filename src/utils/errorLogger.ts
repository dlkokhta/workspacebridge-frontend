import { axiosInstance } from "../context/AuthContext";

export type ClientErrorSource =
  | "window.onerror"
  | "unhandledrejection"
  | "react-error-boundary";

interface ClientErrorPayload {
  source: ClientErrorSource;
  message: string;
  stack?: string;
  componentStack?: string;
}

const MAX_PER_MINUTE = 20; // hard cap so a render loop can't flood the backend
const DEDUPE_WINDOW_MS = 10_000;
const seen = new Map<string, number>();
let windowStart = Date.now();
let sentInWindow = 0;
let lastErrorMessage: string | null = null;

/** Most recent captured client error message — attached as context to a manual
 *  bug report so the tester doesn't have to retype what they saw. */
export const getLastClientError = (): string | null => lastErrorMessage;

const truncate = (value: string | undefined, max: number) =>
  value ? value.slice(0, max) : undefined;

/**
 * Best-effort POST of a captured client error to the backend so testers' crashes
 * are visible without them reporting anything. Deduped (same message within 10s)
 * and capped per minute; failures are swallowed and never re-thrown.
 */
export const logClientError = (payload: ClientErrorPayload): void => {
  try {
    lastErrorMessage = payload.message; // record even if deduped/capped below
    const now = Date.now();
    if (now - windowStart > 60_000) {
      windowStart = now;
      sentInWindow = 0;
    }
    if (sentInWindow >= MAX_PER_MINUTE) return;

    const signature = `${payload.source}:${payload.message}`;
    const last = seen.get(signature);
    if (last && now - last < DEDUPE_WINDOW_MS) return;
    if (seen.size > 100) seen.clear(); // bound memory
    seen.set(signature, now);
    sentInWindow += 1;

    void axiosInstance
      .post(
        "/feedback/error-log",
        {
          source: payload.source,
          message: truncate(payload.message, 2000) || "Unknown error",
          stack: truncate(payload.stack, 8000),
          url: window.location.pathname + window.location.search,
          componentStack: truncate(payload.componentStack, 8000),
        },
        { skipAuthRedirect: true },
      )
      .catch(() => {
        /* telemetry is best-effort — ignore failures */
      });
  } catch {
    /* never let logging break the app */
  }
};

let installed = false;

/** Register global handlers for uncaught errors and promise rejections. */
export const installGlobalErrorLogging = (): void => {
  if (installed || typeof window === "undefined") return;
  installed = true;

  window.addEventListener("error", (event: ErrorEvent) => {
    logClientError({
      source: "window.onerror",
      message: event.message || event.error?.message || "Unknown error",
      stack: event.error?.stack,
    });
  });

  window.addEventListener(
    "unhandledrejection",
    (event: PromiseRejectionEvent) => {
      const reason: unknown = event.reason;
      logClientError({
        source: "unhandledrejection",
        message:
          reason instanceof Error ? reason.message : String(reason ?? "Unknown"),
        stack: reason instanceof Error ? reason.stack : undefined,
      });
    },
  );
};
