import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { RegistrationSuccess } from "../../components/RegistrationSuccess.js";
import { registrationSchema } from "../../schemas/index.js";
import GoogleButton from "../../components/GoogleButton.js";
import type { registrationTypes } from "../../types/registrationTypes.js";
import { Mail, Lock, User } from "lucide-react";

export const RegistrationPage = () => {
  const [responseError, setResponseError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [responseMessage, setResponseMessage] = useState<string>("");
  const {
    register,

    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({ resolver: yupResolver(registrationSchema) });

  const navigate = useNavigate();

  const onSubmit = async (data: registrationTypes) => {
    const url = import.meta.env.VITE_API_URL;
    console.log("Registration data:", data);
    const userData = {
      firstname: data.firstName,
      lastname: data.lastName,
      email: data.email,
      password: data.password,
      passwordRepeat: data.repeatPassword,
    };

    try {
      setResponseError(null);
      const response = await axios.post(`${url}/auth/signup`, userData);
      console.log("Registration response:", response.data);
      setResponseMessage("Registration successful!");
      reset();
    } catch (error: any) {
      const message = error?.response?.data?.message;
      if (Array.isArray(message)) {
        setResponseError(message[0]);
      } else if (typeof message === "string") {
        setResponseError(message);
      } else {
        setResponseError("Registration failed. Please try again.");
      }
    }
  };

  useEffect(() => {
    if (showModal) navigate("/login");
  }, [showModal]);

  return (
    <div className="min-h-screen flex flex-col justify-center py-6 sm:py-8 md:py-12 px-4 sm:px-6 md:px-8 lg:px-12 dark:bg-gray-900">
      <div className="w-full max-w-md lg:max-w-xl mx-auto">
        {responseMessage && !showModal ? (
          <RegistrationSuccess
            message="Registration successful! Please check your email to verify your account."
            onClose={() => setShowModal(true)}
          />
        ) : (
          ""
        )}
        <h1
          onClick={() => navigate("/")}
          className="block cursor-pointer text-center font-roboto font-medium text-xl sm:text-2xl mb-8 sm:mb-12 md:mb-16 dark:text-white"
        >
          workspacebridge
        </h1>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mb-5 flex flex-col gap-3 sm:gap-4 border border-slate-400 dark:border-gray-600 rounded-lg px-4 sm:px-5 md:px-6 py-5 sm:py-6 shadow-sm dark:bg-gray-800"
        >
          <h1 className="text-lg sm:text-xl md:text-2xl font-semibold dark:text-white">Create account</h1>

          {/* Row 1: First Name + Last Name */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
            <div className="w-full">
              <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                First Name
              </label>
              <div className="relative">
                <User
                  className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={16}
                />
                <input
                  className={`w-full pl-8 sm:pl-10 pr-3 py-2 sm:py-2.5 text-sm sm:text-base border rounded-md focus:outline-none focus:ring-2 focus:ring-[#5a8a6b] dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 ${
                    errors.firstName ? "border-red-500" : "border-slate-400 dark:border-gray-600"
                  }`}
                  type="text"
                  id="firstName"
                  {...register("firstName")}
                  name="firstName"
                  placeholder="Enter your first name"
                />
              </div>
              {errors.firstName && (
                <div className="text-xs sm:text-sm text-red-500 mt-1">{errors.firstName.message}</div>
              )}
            </div>

            <div className="w-full">
              <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Last Name
              </label>
              <div className="relative">
                <User
                  className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={16}
                />
                <input
                  className={`w-full pl-8 sm:pl-10 pr-3 py-2 sm:py-2.5 text-sm sm:text-base border rounded-md focus:outline-none focus:ring-2 focus:ring-[#5a8a6b] dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 ${
                    errors.lastName ? "border-red-500" : "border-slate-400 dark:border-gray-600"
                  }`}
                  type="text"
                  id="lastName"
                  {...register("lastName")}
                  name="lastName"
                  placeholder="Enter your last name"
                />
              </div>
              {errors.lastName && (
                <div className="text-xs sm:text-sm text-red-500 mt-1">{errors.lastName.message}</div>
              )}
            </div>
          </div>

          {/* Row 2: Email (full width) */}
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

          {/* Row 3: Password + Repeat Password */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
            <div className="w-full">
              <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Password
              </label>
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
                <div className="text-xs sm:text-sm text-red-500 mt-1">{errors.password.message}</div>
              )}
            </div>

            <div className="w-full">
              <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Repeat Password
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={16}
                />
                <input
                  className={`w-full pl-8 sm:pl-10 pr-3 py-2 sm:py-2.5 text-sm sm:text-base border rounded-md focus:outline-none focus:ring-2 focus:ring-[#5a8a6b] dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 ${
                    errors.repeatPassword ? "border-red-500" : "border-slate-400 dark:border-gray-600"
                  }`}
                  type="password"
                  id="repeatPassword"
                  {...register("repeatPassword")}
                  name="repeatPassword"
                  placeholder="Repeat your password"
                />
              </div>
              {errors.repeatPassword && (
                <div className="text-xs sm:text-sm text-red-500 mt-1">{errors.repeatPassword.message}</div>
              )}
            </div>
          </div>

          <button className="cursor-pointer w-full bg-[#5a8a6b] text-white py-2 sm:py-2.5 px-4 text-sm sm:text-base rounded-md hover:bg-[#4a7a5b] transition-colors font-medium">
            Submit
          </button>
          <GoogleButton />
        </form>

        <div className="mt-5">
          <button
            onClick={() => navigate("/login")}
            className="cursor-pointer mb-5 w-full rounded-xl bg-gradient-to-r from-transparent via-slate-200 dark:via-gray-700 to-transparent px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm hover:via-slate-300 dark:hover:via-gray-600 transition-colors dark:text-gray-300"
          >
            Already have an account? Sign in
          </button>
        </div>

        <div className="">
          <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-slate-200 dark:via-gray-700 to-transparent"></div>
        </div>
      </div>
    </div>
  );
};
