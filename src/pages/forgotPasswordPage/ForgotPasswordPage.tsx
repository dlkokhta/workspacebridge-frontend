import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Mail } from "lucide-react";
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

  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 md:px-8 dark:bg-gray-900">
        <div className="w-full max-w-md mx-auto">
          <h1
            onClick={() => navigate("/")}
            className="cursor-pointer text-center font-roboto font-medium text-xl sm:text-2xl mb-12 dark:text-white"
          >
            workspacebridge
          </h1>
          <div className="border border-slate-400 dark:border-gray-600 rounded-lg px-6 py-8 shadow-sm text-center dark:bg-gray-800">
            <div className="text-4xl mb-4">📧</div>
            <h2 className="text-xl font-semibold mb-2 dark:text-white">Check your email</h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">
              If an account with that email exists, we've sent a password reset
              link. It expires in 1 hour.
            </p>
            <button
              onClick={() => navigate(ROUTES.Login)}
              className="cursor-pointer text-sky-500 hover:text-sky-600 text-sm"
            >
              Back to login
            </button>
          </div>
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
          className="flex flex-col gap-4 border border-slate-400 dark:border-gray-600 rounded-lg px-6 py-6 shadow-sm dark:bg-gray-800"
        >
          <h2 className="text-xl font-semibold dark:text-white">Forgot your password?</h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Enter your email address and we'll send you a link to reset your
            password.
          </p>

          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email
            </label>
            <div className="relative">
              <Mail
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={16}
              />
              <input
                type="email"
                {...register("email")}
                placeholder="Enter your email"
                className={`w-full pl-10 pr-3 py-2.5 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 ${
                  errors.email ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                }`}
              />
            </div>
            {errors.email && (
              <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>
            )}
            {serverError && (
              <p className="text-xs text-red-500 mt-1">{serverError}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="cursor-pointer w-full bg-blue-500 text-white py-2.5 px-4 text-sm rounded-md hover:bg-blue-600 transition-colors font-medium disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Sending..." : "Send reset link"}
          </button>

          <button
            type="button"
            onClick={() => navigate(ROUTES.Login)}
            className="cursor-pointer text-sky-500 hover:text-sky-600 text-sm text-center"
          >
            Back to login
          </button>
        </form>
      </div>
    </div>
  );
};
