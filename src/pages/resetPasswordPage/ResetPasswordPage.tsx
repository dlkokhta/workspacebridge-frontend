import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import axios from "axios";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useState } from "react";
import { Lock } from "lucide-react";
import { resetPasswordSchema } from "../../schemas";
import { ROUTES } from "../../constants";

export const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const url = import.meta.env.VITE_API_URL;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: {
    password: string;
    passwordRepeat: string;
  }) => {
    setServerError(null);

    if (!token) {
      setServerError("Invalid or missing reset token.");
      return;
    }

    try {
      await axios.post(`${url}/auth/reset-password`, {
        token,
        password: data.password,
        passwordRepeat: data.passwordRepeat,
      });
      setSuccess(true);
    } catch (error: any) {
      setServerError(
        error?.response?.data?.message ??
          "An error occurred. Please try again."
      );
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 dark:bg-gray-900">
        <div className="w-full max-w-md mx-auto border border-slate-400 dark:border-gray-600 rounded-lg px-6 py-8 shadow-sm text-center dark:bg-gray-800">
          <h2 className="text-xl font-semibold mb-2 text-red-500">
            Invalid link
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">
            This password reset link is invalid or has expired.
          </p>
          <button
            onClick={() => navigate(ROUTES.PasswordRecovery)}
            className="cursor-pointer text-sky-500 hover:text-sky-600 text-sm"
          >
            Request a new link
          </button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 dark:bg-gray-900">
        <div className="w-full max-w-md mx-auto border border-slate-400 dark:border-gray-600 rounded-lg px-6 py-8 shadow-sm text-center dark:bg-gray-800">
          <div className="text-4xl mb-4">✅</div>
          <h2 className="text-xl font-semibold mb-2 dark:text-white">Password reset!</h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">
            Your password has been changed successfully. You can now log in with
            your new password.
          </p>
          <button
            onClick={() => navigate(ROUTES.Login)}
            className="cursor-pointer w-full bg-blue-500 text-white py-2.5 px-4 text-sm rounded-md hover:bg-blue-600 transition-colors font-medium"
          >
            Go to login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 md:px-8 dark:bg-gray-900">
      <div className="w-full max-w-md mx-auto">
        <h1
          onClick={() => navigate("/")}
          className="cursor-pointer text-center font-roboto font-medium text-xl sm:text-2xl mb-12 dark:text-white"
        >
          workspacebridge
        </h1>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-4 border border-slate-400 dark:border-gray-600 rounded-lg px-6 py-6 shadow-sm dark:bg-gray-800 "
        >
          <h2 className="text-xl font-semibold dark:text-white">Set new password</h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Enter your new password below.
          </p>

          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              New password
            </label>
            <div className="relative">
              <Lock
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={16}
              />
              <input
                type="password"
                {...register("password")}
                placeholder="Enter new password"
                className={`w-full pl-10 pr-3 py-2.5 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 ${
                  errors.password ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                }`}
              />
            </div>
            {errors.password && (
              <p className="text-xs text-red-500 mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Confirm new password
            </label>
            <div className="relative">
              <Lock
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={16}
              />
              <input
                type="password"
                {...register("passwordRepeat")}
                placeholder="Confirm new password"
                className={`w-full pl-10 pr-3 py-2.5 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 ${
                  errors.passwordRepeat ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                }`}
              />
            </div>
            {errors.passwordRepeat && (
              <p className="text-xs text-red-500 mt-1">
                {errors.passwordRepeat.message}
              </p>
            )}
          </div>

          {serverError && (
            <p className="text-xs text-red-500">{serverError}</p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-500 text-white py-2.5 px-4 text-sm rounded-md hover:bg-blue-600 transition-colors font-medium disabled:opacity-60 cursor-pointer"
          >
            {isSubmitting ? "Resetting..." : "Reset password"}
          </button>
        </form>
      </div>
    </div>
  );
};
