import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import axios from "axios";
import { ArrowRight } from "lucide-react";
import { registrationSchema } from "../../../schemas/index.js";
import type { registrationTypes } from "../../../types/registrationTypes.js";
import { PasswordField } from "../components/PasswordField";
import { PasswordStrengthMeter } from "../components/PasswordStrengthMeter";
import { TextField } from "../components/TextField";
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
      <div className="grid grid-cols-2 gap-3 mb-4">
        <TextField
          label="First name"
          registration={register("firstName")}
          error={errors.firstName}
          inputProps={{ placeholder: "Devon" }}
        />
        <TextField
          label="Last name"
          registration={register("lastName")}
          error={errors.lastName}
          inputProps={{ placeholder: "Park" }}
        />
      </div>

      <div className="mb-4">
        <TextField
          label="Work email"
          registration={register("email")}
          error={errors.email}
          extraError={responseError}
          inputProps={{ type: "email", placeholder: "you@studio.com" }}
        />
      </div>

      <div className="mb-4">
        <PasswordField
          label="Password"
          placeholder="At least 8 characters"
          registration={register("password")}
          error={errors.password}
          onValueChange={setPw}
          belowInput={pw && <PasswordStrengthMeter score={score} />}
        />
      </div>

      <div className="mb-4">
        <PasswordField
          label="Confirm password"
          placeholder="Repeat your password"
          registration={register("repeatPassword")}
          error={errors.repeatPassword}
        />
      </div>

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
