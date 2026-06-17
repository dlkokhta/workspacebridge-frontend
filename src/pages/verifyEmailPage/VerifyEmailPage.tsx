import { useEffect, useRef, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import axios from "axios";

type Status = "loading" | "success" | "error";

export const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<Status>("loading");
  const [message, setMessage] = useState("");
  const hasFired = useRef(false);

  const url = import.meta.env.VITE_API_URL;

  useEffect(() => {
    // Guard against React StrictMode double-invocation in development
    if (hasFired.current) return;
    hasFired.current = true;

    const token = searchParams.get("token");

    if (!token) {
      setStatus("error");
      setMessage("No verification token found in the URL.");
      return;
    }

    axios
      .get(`${url}/auth/verify-email`, { params: { token } })
      .then((res) => {
        setStatus("success");
        setMessage(res.data.message);
      })
      .catch((err) => {
        setStatus("error");
        setMessage(
          err.response?.data?.message ?? "Verification failed. Please try again."
        );
      });
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fafaf7] dark:bg-[#0e1310] px-4 py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.18, ease: "easeOut" }}
        className="w-full max-w-md rounded-2xl bg-white dark:bg-[#151a17] border border-black/[0.06] dark:border-white/[0.06] shadow-xl px-6 py-10 sm:px-10 sm:py-12 text-center"
      >
        {status === "loading" && (
          <>
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[#5a8a6b]/10 dark:bg-[#5a8a6b]/15">
              <Loader2 className="h-7 w-7 text-[#5a8a6b] animate-spin" />
            </div>
            <h2 className="text-[18px] font-semibold text-[#1a201c] dark:text-[#e8ece9]">
              Verifying your email…
            </h2>
            <p className="mt-2 text-[14px] leading-[1.55] text-[#5a625e] dark:text-[#a0a8a3]">
              Please wait a moment.
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[#5a8a6b]/10 dark:bg-[#5a8a6b]/15">
              <CheckCircle2 className="h-7 w-7 text-[#5a8a6b]" />
            </div>
            <h2 className="text-[18px] font-semibold text-[#1a201c] dark:text-[#e8ece9]">
              Email verified
            </h2>
            <p className="mt-2 mb-7 text-[14px] leading-[1.55] text-[#5a625e] dark:text-[#a0a8a3]">
              {message}
            </p>
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="w-full h-11 flex items-center justify-center rounded-lg bg-[#5a8a6b] hover:bg-[#4f7a5e] active:bg-[#446b52] text-white text-[13px] font-medium transition-colors cursor-pointer"
            >
              Continue to sign in
            </button>
          </>
        )}

        {status === "error" && (
          <>
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10 dark:bg-red-500/15">
              <XCircle className="h-7 w-7 text-red-500" />
            </div>
            <h2 className="text-[18px] font-semibold text-[#1a201c] dark:text-[#e8ece9]">
              Verification failed
            </h2>
            <p className="mt-2 mb-7 text-[14px] leading-[1.55] text-[#5a625e] dark:text-[#a0a8a3]">
              {message}
            </p>
            <button
              type="button"
              onClick={() => navigate("/register")}
              className="w-full h-11 flex items-center justify-center rounded-lg bg-[#5a8a6b] hover:bg-[#4f7a5e] active:bg-[#446b52] text-white text-[13px] font-medium transition-colors cursor-pointer"
            >
              Back to register
            </button>
          </>
        )}
      </motion.div>
    </div>
  );
};
