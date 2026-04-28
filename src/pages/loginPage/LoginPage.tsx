import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import type { loginTypes } from "../../types/loginTypes";
import { loginSchema } from "../../schemas";
import { Mail, Lock } from "lucide-react";
import GoogleButton from "../../components/GoogleButton";

export const LoginPage = () => {
  const [responseError, setResponseError] = useState<string | null>(null);
  const { setAccessToken } = useAuth();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(loginSchema),
  });

  const url = import.meta.env.VITE_API_URL;

  const onSubmit = async (data: loginTypes) => {
    const userData = {
      email: data.email,
      password: data.password,
    };

    try {
      const response = await axios.post(`${url}/auth/login`, userData, {
        withCredentials: true,
      });

      // 2FA is enabled — redirect to verification page
      if (response.data.requiresTwoFactor) {
        navigate("/auth/2fa-verify", { state: { tempToken: response.data.tempToken } });
        return;
      }

      const accessToken = response.data.accessToken;
      setAccessToken(accessToken);

      if (response.data.user.role === "ADMIN") {
        navigate("/adminPanel");
      } else {
        navigate("/profile");
      }

      reset();
    } catch (error: any) {
      if (error?.response?.data?.message) {
        setResponseError(error.response.data.message);
      } else {
        setResponseError("An error occurred. Please try again.");
      }
    }
  };

  const handleClick = (path: string) => {
    navigate(path);
  };

  return (
      <div className="min-h-screen flex flex-col justify-center py-6 sm:py-8 md:py-12 px-4 sm:px-6 md:px-8 lg:px-12 dark:bg-gray-900">
      <div className="w-full max-w-md mx-auto">
        <h1
          onClick={() => navigate("/")}
          className="cursor-pointer text-center font-roboto font-medium text-xl sm:text-2xl mb-8 sm:mb-12 md:mb-16 dark:text-white"
        >
          workspacebridge
        </h1>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mb-5 flex flex-col gap-3 sm:gap-4 border border-slate-400 dark:border-gray-600 rounded-lg px-4 sm:px-5 md:px-6 py-5 sm:py-6 shadow-sm dark:bg-gray-800"
        >
          <h1 className="text-lg sm:text-xl md:text-2xl font-semibold dark:text-white">Sign in</h1>
          <h1 className="text-xs"></h1>

          <div className="w-full">
            <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email
            </label>
            <div className="relative">
              <Mail
                className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={16}
              />
              <input
                className={`w-full pl-8 sm:pl-10 pr-3 py-2 sm:py-2.5 text-sm sm:text-base border rounded-md focus:outline-none focus:ring-2 focus:ring-[#5a8a6b] dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 ${
                  errors.email ? "border-red-500" : "border-slate-400 dark:border-gray-600"
                }`}
                type="email"
                id="email"
                {...register("email")}
                name="email"
                placeholder="Enter your email"
              />
            </div>
            {errors.email ? (
              <div className="text-xs sm:text-sm text-red-500 mt-1">{errors.email.message}</div>
            ) : (
              responseError && (
                <div className="text-xs text-red-500">{responseError}</div>
              )
            )}
          </div>

          <div className="w-full">
            <div className="flex items-center mb-1">
              <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                Password
              </label>
              <label
                className="ml-auto block cursor-pointer text-xs sm:text-sm text-[#5a8a6b] hover:text-red-500 dark:text-[#7aaa8a]"
                htmlFor="password"
                onClick={() => navigate("/passwordRecovery")}
              >
                forgot your password?
              </label>
            </div>
            <div className="relative">
              <Lock
                className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={16}
              />
              <input
                className={`w-full pl-8 sm:pl-10 pr-3 py-2 sm:py-2.5 text-sm sm:text-base border rounded-md focus:outline-none focus:ring-2 focus:ring-[#5a8a6b] dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 ${
                  errors.password ? "border-red-500" : "border-slate-400 dark:border-gray-600"
                }`}
                type="password"
                id="password"
                {...register("password")}
                name="password"
                placeholder="Enter your password"
              />
            </div>
            {errors.password && (
              <div className="text-xs sm:text-sm text-red-500 mt-1">
                {errors.password.message}
              </div>
            )}
          </div>

          <button className="cursor-pointer w-full bg-[#5a8a6b] text-white py-2 sm:py-2.5 px-4 text-sm sm:text-base rounded-md hover:bg-[#4a7a5b] transition-colors font-medium">
            Submit
          </button>
          <GoogleButton />
        </form>

        <div className="mt-5">
          <button
            onClick={() => handleClick("/register")}
            className="cursor-pointer mb-5 w-full rounded-xl bg-gradient-to-r from-transparent via-slate-200 dark:via-gray-700 to-transparent px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm hover:via-slate-300 dark:hover:via-gray-600 transition-colors dark:text-gray-300"
          >
            Create your account
          </button>
        </div>

        <div className="">
          <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-slate-200 dark:via-gray-700 to-transparent"></div>
        </div>
      </div>
    </div>
  );
};

declare global {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  interface Window {
    google?: any;
  }
}
