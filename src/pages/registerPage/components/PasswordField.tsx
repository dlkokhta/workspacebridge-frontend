import { useState, type ReactNode } from "react";
import { Eye, EyeOff } from "lucide-react";
import type { FieldError, UseFormRegisterReturn } from "react-hook-form";

interface PasswordFieldProps {
  label: string;
  placeholder: string;
  registration: UseFormRegisterReturn;
  error?: FieldError;
  // Rendered between the input and the error message — e.g. password
  // strength meter on the register form.
  belowInput?: ReactNode;
  // Optional bridge to the parent for live values (strength scoring).
  onValueChange?: (value: string) => void;
}

export const PasswordField = ({
  label,
  placeholder,
  registration,
  error,
  belowInput,
  onValueChange,
}: PasswordFieldProps) => {
  const [show, setShow] = useState(false);
  const hasError = Boolean(error);

  return (
    <div>
      <label className="block text-[12px] font-medium text-[#5a625e] dark:text-[#a0a8a3] mb-1.5 tracking-[0.01em]">
        {label}
      </label>
      <div className="relative">
        <input
          {...registration}
          type={show ? "text" : "password"}
          placeholder={placeholder}
          onChange={(e) => {
            registration.onChange(e);
            onValueChange?.(e.target.value);
          }}
          className={`w-full h-[42px] pl-3.5 pr-10 rounded-lg border bg-white dark:bg-[#151a17] text-[13px] text-[#1a201c] dark:text-[#e8ece9] placeholder-[#4a514d] dark:placeholder-[#4a514d] outline-none transition-all
            ${hasError
              ? "border-red-400 dark:border-red-500 focus:ring-2 focus:ring-red-400/20"
              : "border-black/[0.08] dark:border-white/[0.07] hover:border-black/[0.14] dark:hover:border-white/[0.14] focus:border-[#5a8a6b] focus:ring-2 focus:ring-[#5a8a6b]/20"
            }`}
        />
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#858c87] dark:text-[#6e7672] hover:text-[#5a625e] dark:hover:text-[#a0a8a3] transition-colors cursor-pointer"
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
      {belowInput}
      {error?.message && (
        <p className="mt-1.5 text-[12px] text-red-500">{error.message}</p>
      )}
    </div>
  );
};
