import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { axiosInstance, useAuth } from "../context/AuthContext";

// How long the user may stay inactive before we warn them, and how long the
// warning countdown lasts before we log them out automatically. An idle guard
// like this limits the window in which an unattended, logged-in browser can
// be abused — independent of how long the refresh token itself is valid.
const IDLE_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes of inactivity
const WARNING_COUNTDOWN_MS = 60 * 1000; // 60-second grace period

const ACTIVITY_EVENTS = [
  "mousemove",
  "mousedown",
  "keydown",
  "scroll",
  "touchstart",
] as const;

/**
 * Watches for user inactivity while authenticated. After IDLE_TIMEOUT_MS with
 * no interaction it shows a countdown modal; the user can extend the session
 * (which refreshes/rotates the token) or log out, and if the countdown runs
 * out they are logged out automatically. Renders nothing when logged out.
 */
export const SessionTimeoutWarning = () => {
  const { accessToken, setAccessToken } = useAuth();
  const navigate = useNavigate();

  const [warningActive, setWarningActive] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(
    Math.ceil(WARNING_COUNTDOWN_MS / 1000),
  );

  const lastActivityRef = useRef(Date.now());
  const warningDeadlineRef = useRef<number | null>(null);
  // Authoritative copy of "is the warning showing", written synchronously so
  // the 1s interval and the activity listener always read an up-to-date value
  // (React state lags a render behind, which the timer logic can't tolerate).
  const warningActiveRef = useRef(false);

  const logoutNow = useCallback(async () => {
    warningActiveRef.current = false;
    setWarningActive(false);
    warningDeadlineRef.current = null;
    try {
      await axiosInstance.post("/auth/logout");
    } catch {
      // best-effort: log out locally even if the request fails
    } finally {
      setAccessToken(null);
      navigate("/login");
    }
  }, [navigate, setAccessToken]);

  const stayLoggedIn = useCallback(async () => {
    warningActiveRef.current = false;
    setWarningActive(false);
    warningDeadlineRef.current = null;
    lastActivityRef.current = Date.now();
    try {
      // Refreshing both proves the session is still valid and rotates the token.
      const res = await axiosInstance.post("/auth/refresh", {});
      if (res.data?.accessToken) {
        setAccessToken(res.data.accessToken);
      }
    } catch {
      // Session is gone server-side — fall back to a clean logout.
      logoutNow();
    }
  }, [setAccessToken, logoutNow]);

  useEffect(() => {
    if (!accessToken) {
      warningActiveRef.current = false;
      setWarningActive(false);
      warningDeadlineRef.current = null;
      return;
    }

    lastActivityRef.current = Date.now();

    const onActivity = () => {
      // Once the warning is up, only an explicit choice should dismiss it —
      // a stray mouse movement must not silently keep the session alive.
      if (!warningActiveRef.current) {
        lastActivityRef.current = Date.now();
      }
    };

    ACTIVITY_EVENTS.forEach((event) =>
      window.addEventListener(event, onActivity, { passive: true }),
    );

    const interval = window.setInterval(() => {
      if (!warningActiveRef.current) {
        if (Date.now() - lastActivityRef.current >= IDLE_TIMEOUT_MS) {
          warningDeadlineRef.current = Date.now() + WARNING_COUNTDOWN_MS;
          warningActiveRef.current = true;
          setSecondsLeft(Math.ceil(WARNING_COUNTDOWN_MS / 1000));
          setWarningActive(true);
        }
        return;
      }

      const remaining = (warningDeadlineRef.current ?? 0) - Date.now();
      if (remaining <= 0) {
        logoutNow();
      } else {
        setSecondsLeft(Math.ceil(remaining / 1000));
      }
    }, 1000);

    return () => {
      window.clearInterval(interval);
      ACTIVITY_EVENTS.forEach((event) =>
        window.removeEventListener(event, onActivity),
      );
    };
  }, [accessToken, logoutNow]);

  return (
    <AnimatePresence>
      {warningActive && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/60 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="session-timeout-title"
        >
          <motion.div
            className="w-full max-w-md rounded-xl border border-black/[0.08] dark:border-white/[0.07] bg-white dark:bg-[#151a17] p-6 shadow-xl"
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
          >
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#c25a4a]/10 dark:bg-[#e07b6b]/10 text-[#c25a4a] dark:text-[#e07b6b]">
                <Clock size={20} />
              </span>
              <h2
                id="session-timeout-title"
                className="text-[16px] font-semibold text-[#1a201c] dark:text-[#e8ece9]"
              >
                Your session is about to expire
              </h2>
            </div>

            <p className="mt-3 text-[13px] leading-[1.5] text-[#5a625e] dark:text-[#a0a8a3]">
              You&apos;ve been inactive for a while. For your security
              you&apos;ll be logged out in{" "}
              <span className="font-semibold text-[#1a201c] dark:text-[#e8ece9]">
                {secondsLeft} second{secondsLeft === 1 ? "" : "s"}
              </span>
              .
            </p>

            <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
              <button
                onClick={logoutNow}
                className="cursor-pointer h-10 px-4 rounded-lg border border-black/[0.08] dark:border-white/[0.07] bg-white dark:bg-[#1c221e] text-[13px] font-medium text-[#1a201c] dark:text-[#e8ece9] hover:bg-[#f6f6f1] dark:hover:bg-[#222b26] transition-colors"
              >
                Log out now
              </button>
              <button
                onClick={stayLoggedIn}
                className="cursor-pointer h-10 px-4 rounded-lg bg-[#5a8a6b] hover:bg-[#4f7a5e] text-[13px] font-medium text-white transition-colors"
              >
                Stay logged in
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
