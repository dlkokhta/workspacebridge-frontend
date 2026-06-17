import { useEffect } from "react";
import { motion } from "framer-motion";
import { MailCheck } from "lucide-react";

interface RegistrationSuccessProps {
  message: string;
  onClose: () => void;
}

export const RegistrationSuccess = ({
  message,
  onClose,
}: RegistrationSuccessProps) => {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="registration-success-title"
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.18, ease: "easeOut" }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-2xl bg-white dark:bg-[#151a17] border border-black/[0.06] dark:border-white/[0.06] shadow-xl p-7 text-center"
      >
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[#5a8a6b]/10 dark:bg-[#5a8a6b]/15">
          <MailCheck className="h-7 w-7 text-[#5a8a6b]" />
        </div>

        <h2
          id="registration-success-title"
          className="text-[18px] font-semibold text-[#1a201c] dark:text-[#e8ece9]"
        >
          Check your inbox
        </h2>
        <p className="mt-2 text-[14px] leading-[1.55] text-[#5a625e] dark:text-[#a0a8a3]">
          {message}
        </p>

        <button
          type="button"
          onClick={onClose}
          className="mt-6 w-full h-11 flex items-center justify-center rounded-lg bg-[#5a8a6b] hover:bg-[#4f7a5e] active:bg-[#446b52] text-white text-[13px] font-medium transition-colors cursor-pointer"
        >
          Continue to sign in
        </button>
      </motion.div>
    </div>
  );
};
