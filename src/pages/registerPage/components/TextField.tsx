import type { InputHTMLAttributes } from "react";
import type { FieldError, UseFormRegisterReturn } from "react-hook-form";

interface TextFieldProps {
  label: string;
  registration: UseFormRegisterReturn;
  error?: FieldError;
  extraError?: string | null;
  inputProps?: InputHTMLAttributes<HTMLInputElement>;
}

export const TextField = ({
  label,
  registration,
  error,
  extraError,
  inputProps,
}: TextFieldProps) => {
  const hasError = Boolean(error);
  const message = error?.message ?? (hasError ? undefined : extraError);

  return (
    <div>
      <label className="block text-[12px] font-medium text-[#5a625e] dark:text-[#a0a8a3] mb-1.5 tracking-[0.01em]">
        {label}
      </label>
      <input
        {...registration}
        {...inputProps}
        className={`w-full h-[42px] px-3.5 rounded-lg border bg-white dark:bg-[#151a17] text-[13px] text-[#1a201c] dark:text-[#e8ece9] placeholder-[#4a514d] dark:placeholder-[#4a514d] outline-none transition-all
          ${hasError
            ? "border-red-400 dark:border-red-500 focus:ring-2 focus:ring-red-400/20"
            : "border-black/[0.08] dark:border-white/[0.07] hover:border-black/[0.14] dark:hover:border-white/[0.14] focus:border-[#5a8a6b] focus:ring-2 focus:ring-[#5a8a6b]/20"
          }`}
      />
      {message && <p className="mt-1.5 text-[12px] text-red-500">{message}</p>}
    </div>
  );
};
