import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, MailCheck } from "lucide-react";
import { forgotPasswordSchema } from "../../schemas";
import { ROUTES } from "../../constants";

export const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const url = import.meta.env.VITE_API_URL;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: { email: string }) => {
    setServerError(null);
    try {
      await axios.post(`${url}/auth/forgot-password`, { email: data.email });
      setSubmitted(true);
    } catch {
      setServerError("An error occurred. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 md:px-8 bg-[#fafaf7] dark:bg-[#0e1310]">
      <div className="w-full max-w-md mx-auto">
        <h1
          onClick={() => navigate("/")}
          className="cursor-pointer text-center font-medium text-xl sm:text-2xl mb-12 text-[#1a201c] dark:text-[#e8ece9]"
        >
          workspacebridge
        </h1>

        {submitted ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="rounded-2xl bg-white dark:bg-[#151a17] border border-black/[0.06] dark:border-white/[0.06] shadow-xl px-6 py-8 text-center"
          >
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[#5a8a6b]/10 dark:bg-[#5a8a6b]/15">
              <MailCheck className="h-7 w-7 text-[#5a8a6b]" />
            </div>
            <h2 className="text-[18px] font-semibold text-[#1a201c] dark:text-[#e8ece9]">
              Check your email
            </h2>
            <p className="mt-2 mb-7 text-[14px] leading-[1.55] text-[#5a625e] dark:text-[#a0a8a3]">
              If an account with that email exists, we've sent a password reset
              link. It expires in 1 hour.
            </p>
            <button
              type="button"
              onClick={() => navigate(ROUTES.Login)}
              className="text-[13px] font-medium text-[#5a8a6b] hover:text-[#4f7a5e] transition-colors cursor-pointer"
            >
              Back to login
            </button>
          </motion.div>
        ) : (
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-4 rounded-2xl bg-white dark:bg-[#151a17] border border-black/[0.06] dark:border-white/[0.06] shadow-xl px-6 py-7"
          >
            <h2 className="text-[18px] font-semibold text-[#1a201c] dark:text-[#e8ece9]">
              Forgot your password?
            </h2>
            <p className="-mt-2 text-[14px] leading-[1.55] text-[#5a625e] dark:text-[#a0a8a3]">
              Enter your email address and we'll send you a link to reset your
              password.
            </p>

            <div className="w-full">
              <label className="block text-[12px] font-medium text-[#5a625e] dark:text-[#a0a8a3] mb-1.5 tracking-[0.01em]">
                Email
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#858c87]"
                  size={16}
                />
                <input
                  type="email"
                  {...register("email")}
                  placeholder="Enter your email"
                  className={`w-full h-[42px] pl-10 pr-3.5 rounded-lg border bg-white dark:bg-[#151a17] text-[13px] text-[#1a201c] dark:text-[#e8ece9] placeholder-[#4a514d] outline-none transition-all
                    ${
                      errors.email
                        ? "border-red-400 dark:border-red-500 focus:ring-2 focus:ring-red-400/20"
                        : "border-black/[0.08] dark:border-white/[0.07] hover:border-black/[0.14] dark:hover:border-white/[0.14] focus:border-[#5a8a6b] focus:ring-2 focus:ring-[#5a8a6b]/20"
                    }`}
                />
              </div>
              {errors.email && (
                <p className="mt-1.5 text-[12px] text-red-500">
                  {errors.email.message}
                </p>
              )}
              {serverError && (
                <p className="mt-1.5 text-[12px] text-red-500">{serverError}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-11 flex items-center justify-center rounded-lg bg-[#5a8a6b] hover:bg-[#4f7a5e] active:bg-[#446b52] text-white text-[13px] font-medium transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Sending…" : "Send reset link"}
            </button>

            <button
              type="button"
              onClick={() => navigate(ROUTES.Login)}
              className="text-[13px] font-medium text-[#5a8a6b] hover:text-[#4f7a5e] transition-colors cursor-pointer text-center"
            >
              Back to login
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
