import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import axios from "axios";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import { registrationSchema } from "../../../schemas/index.js";
import type { registrationTypes } from "../../../types/registrationTypes.js";
import { PasswordStrengthMeter } from "../components/PasswordStrengthMeter";
import { passwordScore } from "../utils/passwordScore";

interface RegistrationFormProps {
  onSuccess: (message: string) => void;
}

const extractApiMessage = (err: unknown): string | null => {
  const message = (err as { response?: { data?: { message?: string | string[] } } })
    ?.response?.data?.message;
  if (Array.isArray(message)) return message[0] ?? null;
  if (typeof message === "string") return message;
  return null;
};

export const RegistrationForm = ({ onSuccess }: RegistrationFormProps) => {
  const [responseError, setResponseError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeat, setShowRepeat] = useState(false);
  const [agree, setAgree] = useState(true);
  const [pw, setPw] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({ resolver: yupResolver(registrationSchema) });

  const url = import.meta.env.VITE_API_URL;

  const onSubmit = async (data: registrationTypes) => {
    try {
      setResponseError(null);
      await axios.post(`${url}/auth/signup`, {
        firstname: data.firstName,
        lastname: data.lastName,
        email: data.email,
        password: data.password,
        passwordRepeat: data.repeatPassword,
      });
      reset();
      onSuccess("Registration successful!");
    } catch (error: unknown) {
      setResponseError(
        extractApiMessage(error) ?? "Registration failed. Please try again.",
      );
    }
  };

  const score = passwordScore(pw);

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      {/* First + Last */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <label className="block text-[12px] font-medium text-[#5a625e] dark:text-[#a0a8a3] mb-1.5 tracking-[0.01em]">
            First name
          </label>
          <input
            {...register("firstName")}
            placeholder="Devon"
            className={`w-full h-[42px] px-3.5 rounded-lg border bg-white dark:bg-[#151a17] text-[13px] text-[#1a201c] dark:text-[#e8ece9] placeholder-[#4a514d] dark:placeholder-[#4a514d] outline-none transition-all
              ${errors.firstName
                ? "border-red-400 dark:border-red-500 focus:ring-2 focus:ring-red-400/20"
                : "border-black/[0.08] dark:border-white/[0.07] hover:border-black/[0.14] dark:hover:border-white/[0.14] focus:border-[#5a8a6b] focus:ring-2 focus:ring-[#5a8a6b]/20"
              }`}
          />
          {errors.firstName && (
            <p className="mt-1.5 text-[12px] text-red-500">{errors.firstName.message}</p>
          )}
        </div>
        <div>
          <label className="block text-[12px] font-medium text-[#5a625e] dark:text-[#a0a8a3] mb-1.5 tracking-[0.01em]">
            Last name
          </label>
          <input
            {...register("lastName")}
            placeholder="Park"
            className={`w-full h-[42px] px-3.5 rounded-lg border bg-white dark:bg-[#151a17] text-[13px] text-[#1a201c] dark:text-[#e8ece9] placeholder-[#4a514d] dark:placeholder-[#4a514d] outline-none transition-all
              ${errors.lastName
                ? "border-red-400 dark:border-red-500 focus:ring-2 focus:ring-red-400/20"
                : "border-black/[0.08] dark:border-white/[0.07] hover:border-black/[0.14] dark:hover:border-white/[0.14] focus:border-[#5a8a6b] focus:ring-2 focus:ring-[#5a8a6b]/20"
              }`}
          />
          {errors.lastName && (
            <p className="mt-1.5 text-[12px] text-red-500">{errors.lastName.message}</p>
          )}
        </div>
      </div>

      {/* Email */}
      <div className="mb-4">
        <label className="block text-[12px] font-medium text-[#5a625e] dark:text-[#a0a8a3] mb-1.5 tracking-[0.01em]">
          Work email
        </label>
        <input
          {...register("email")}
          type="email"
          placeholder="you@studio.com"
          className={`w-full h-[42px] px-3.5 rounded-lg border bg-white dark:bg-[#151a17] text-[13px] text-[#1a201c] dark:text-[#e8ece9] placeholder-[#4a514d] dark:placeholder-[#4a514d] outline-none transition-all
            ${errors.email
              ? "border-red-400 dark:border-red-500 focus:ring-2 focus:ring-red-400/20"
              : "border-black/[0.08] dark:border-white/[0.07] hover:border-black/[0.14] dark:hover:border-white/[0.14] focus:border-[#5a8a6b] focus:ring-2 focus:ring-[#5a8a6b]/20"
            }`}
        />
        {errors.email && (
          <p className="mt-1.5 text-[12px] text-red-500">{errors.email.message}</p>
        )}
        {!errors.email && responseError && (
          <p className="mt-1.5 text-[12px] text-red-500">{responseError}</p>
        )}
      </div>

      {/* Password */}
      <div className="mb-4">
        <label className="block text-[12px] font-medium text-[#5a625e] dark:text-[#a0a8a3] mb-1.5 tracking-[0.01em]">
          Password
        </label>
        <div className="relative">
          <input
            {...register("password")}
            type={showPassword ? "text" : "password"}
            placeholder="At least 8 characters"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            className={`w-full h-[42px] pl-3.5 pr-10 rounded-lg border bg-white dark:bg-[#151a17] text-[13px] text-[#1a201c] dark:text-[#e8ece9] placeholder-[#4a514d] dark:placeholder-[#4a514d] outline-none transition-all
              ${errors.password
                ? "border-red-400 dark:border-red-500 focus:ring-2 focus:ring-red-400/20"
                : "border-black/[0.08] dark:border-white/[0.07] hover:border-black/[0.14] dark:hover:border-white/[0.14] focus:border-[#5a8a6b] focus:ring-2 focus:ring-[#5a8a6b]/20"
              }`}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#858c87] dark:text-[#6e7672] hover:text-[#5a625e] dark:hover:text-[#a0a8a3] transition-colors cursor-pointer"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {pw && <PasswordStrengthMeter score={score} />}
        {errors.password && (
          <p className="mt-1.5 text-[12px] text-red-500">{errors.password.message}</p>
        )}
      </div>

      {/* Repeat password */}
      <div className="mb-4">
        <label className="block text-[12px] font-medium text-[#5a625e] dark:text-[#a0a8a3] mb-1.5 tracking-[0.01em]">
          Confirm password
        </label>
        <div className="relative">
          <input
            {...register("repeatPassword")}
            type={showRepeat ? "text" : "password"}
            placeholder="Repeat your password"
            className={`w-full h-[42px] pl-3.5 pr-10 rounded-lg border bg-white dark:bg-[#151a17] text-[13px] text-[#1a201c] dark:text-[#e8ece9] placeholder-[#4a514d] dark:placeholder-[#4a514d] outline-none transition-all
              ${errors.repeatPassword
                ? "border-red-400 dark:border-red-500 focus:ring-2 focus:ring-red-400/20"
                : "border-black/[0.08] dark:border-white/[0.07] hover:border-black/[0.14] dark:hover:border-white/[0.14] focus:border-[#5a8a6b] focus:ring-2 focus:ring-[#5a8a6b]/20"
              }`}
          />
          <button
            type="button"
            onClick={() => setShowRepeat((v) => !v)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#858c87] dark:text-[#6e7672] hover:text-[#5a625e] dark:hover:text-[#a0a8a3] transition-colors cursor-pointer"
          >
            {showRepeat ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {errors.repeatPassword && (
          <p className="mt-1.5 text-[12px] text-red-500">{errors.repeatPassword.message}</p>
        )}
      </div>

      {/* Terms */}
      <label className="flex items-start gap-2.5 mt-5 text-[12px] text-[#5a625e] dark:text-[#a0a8a3] cursor-pointer leading-[1.5]">
        <input
          type="checkbox"
          checked={agree}
          onChange={(e) => setAgree(e.target.checked)}
          className="mt-0.5 accent-[#5a8a6b]"
        />
        <span>
          I agree to the{" "}
          <a href="#" className="text-[#1a201c] dark:text-[#e8ece9] underline decoration-black/[0.16] dark:decoration-white/[0.14]">
            Terms
          </a>{" "}
          and{" "}
          <a href="#" className="text-[#1a201c] dark:text-[#e8ece9] underline decoration-black/[0.16] dark:decoration-white/[0.14]">
            Privacy Policy
          </a>
          .
        </span>
      </label>

      <button
        type="submit"
        disabled={!agree}
        className="w-full h-11 mt-6 flex items-center justify-center gap-2 rounded-lg bg-[#5a8a6b] hover:bg-[#4f7a5e] active:bg-[#446b52] text-white text-[13px] font-medium transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Create account <ArrowRight size={15} />
      </button>
    </form>
  );
};
