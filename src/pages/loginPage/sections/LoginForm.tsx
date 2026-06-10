import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { loginSchema } from "../../../schemas";
import type { loginTypes } from "../../../types/loginTypes";

interface LoginResponse {
  requiresTwoFactor?: boolean;
  tempToken?: string;
  accessToken: string;
  user: { role: "ADMIN" | "CLIENT" | "FREELANCER" };
}

const extractApiMessage = (err: unknown): string | null =>
  (err as { response?: { data?: { message?: string } } })?.response?.data
    ?.message ?? null;

const dashboardForRole = (role: LoginResponse["user"]["role"]): string => {
  if (role === "ADMIN") return "/adminPanel";
  if (role === "CLIENT") return "/portal";
  return "/dashboard";
};

export const LoginForm = () => {
  const navigate = useNavigate();
  const { setAccessToken } = useAuth();
  const [responseError, setResponseError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({ resolver: yupResolver(loginSchema) });

  const url = import.meta.env.VITE_API_URL;

  const onSubmit = async (data: loginTypes) => {
    try {
      const response = await axios.post<LoginResponse>(
        `${url}/auth/login`,
        {
          email: data.email,
          password: data.password,
          rememberMe: !!data.rememberMe,
        },
        { withCredentials: true },
      );

      if (response.data.requiresTwoFactor) {
        navigate("/auth/2fa-verify", {
          state: { tempToken: response.data.tempToken },
        });
        return;
      }

      setAccessToken(response.data.accessToken);
      navigate(dashboardForRole(response.data.user.role));
      reset();
    } catch (error: unknown) {
      setResponseError(
        extractApiMessage(error) ?? "An error occurred. Please try again.",
      );
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      {/* Email */}
      <div className="mb-4">
        <label className="block text-[12px] font-medium text-[#5a625e] dark:text-[#a0a8a3] mb-1.5 tracking-[0.01em]">
          Email
        </label>
        <input
          {...register("email")}
          type="email"
          placeholder="you@studio.com"
          className={`w-full h-[42px] px-3.5 rounded-lg border bg-white dark:bg-[#151a17] text-[13px] text-[#1a201c] dark:text-[#e8ece9] placeholder-[#4a514d] dark:placeholder-[#4a514d] outline-none transition-all
            ${errors.email
              ? "border-red-400 dark:border-red-500 focus:border-red-400 dark:focus:border-red-500 focus:ring-2 focus:ring-red-400/20"
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
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-[12px] font-medium text-[#5a625e] dark:text-[#a0a8a3] tracking-[0.01em]">
            Password
          </label>
          <Link
            to="/passwordRecovery"
            className="text-[12px] text-[#5a8a6b] hover:text-[#4f7a5e] transition-colors"
          >
            Forgot?
          </Link>
        </div>
        <div className="relative">
          <input
            {...register("password")}
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            className={`w-full h-[42px] pl-3.5 pr-10 rounded-lg border bg-white dark:bg-[#151a17] text-[13px] text-[#1a201c] dark:text-[#e8ece9] placeholder-[#4a514d] dark:placeholder-[#4a514d] outline-none transition-all
              ${errors.password
                ? "border-red-400 dark:border-red-500 focus:border-red-400 dark:focus:border-red-500 focus:ring-2 focus:ring-red-400/20"
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
        {errors.password && (
          <p className="mt-1.5 text-[12px] text-red-500">{errors.password.message}</p>
        )}
      </div>

      {/* Remember me */}
      <label className="flex items-center gap-2 mb-6 cursor-pointer select-none">
        <input
          {...register("rememberMe")}
          type="checkbox"
          className="h-3.5 w-3.5 rounded border-black/[0.2] dark:border-white/[0.2] accent-[#5a8a6b] cursor-pointer"
        />
        <span className="text-[12px] text-[#5a625e] dark:text-[#a0a8a3]">
          Keep me signed in for 30 days
        </span>
      </label>

      <button
        type="submit"
        className="w-full h-11 flex items-center justify-center gap-2 rounded-lg bg-[#5a8a6b] hover:bg-[#4f7a5e] active:bg-[#446b52] text-white text-[13px] font-medium transition-colors cursor-pointer"
      >
        Sign in <ArrowRight size={15} />
      </button>
    </form>
  );
};
