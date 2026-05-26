import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { SmallBtn } from "../../components/SmallBtn";

interface DisableTwoFactorFormProps {
  code: string;
  password: string;
  onCodeChange: (next: string) => void;
  onPasswordChange: (next: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  loading: boolean;
  error: string | null;
}

export const DisableTwoFactorForm = ({
  code,
  password,
  onCodeChange,
  onPasswordChange,
  onSubmit,
  onCancel,
  loading,
  error,
}: DisableTwoFactorFormProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const submitDisabled = loading || code.length !== 6 || password.length === 0;

  return (
    <form onSubmit={onSubmit} className="pb-5 space-y-4 max-w-[380px]">
      <p className="text-[13px] text-[#5a625e] dark:text-[#a0a8a3]">
        Confirm your password and enter the 6-digit code from your
        authenticator app to disable 2FA.
      </p>

      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => onPasswordChange(e.target.value)}
          placeholder="Current password"
          autoFocus
          className="w-full h-[42px] pl-3.5 pr-10 rounded-lg border border-black/[0.08] dark:border-white/[0.07] bg-white dark:bg-[#151a17] text-[13px] text-[#1a201c] dark:text-[#e8ece9] placeholder-[#4a514d] outline-none focus:border-[#c25a4a] focus:ring-2 focus:ring-[#c25a4a]/20 transition-all"
        />
        <button
          type="button"
          onClick={() => setShowPassword((v) => !v)}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#858c87] dark:text-[#6e7672] cursor-pointer"
        >
          {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      </div>

      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        maxLength={6}
        value={code}
        onChange={(e) => onCodeChange(e.target.value.replace(/\D/g, ""))}
        placeholder="000000"
        className="w-full h-[44px] px-3.5 rounded-lg border border-black/[0.08] dark:border-white/[0.07] bg-white dark:bg-[#151a17] text-center text-[18px] tracking-[0.4em] font-mono text-[#1a201c] dark:text-[#e8ece9] outline-none focus:border-[#c25a4a] focus:ring-2 focus:ring-[#c25a4a]/20 transition-all"
      />

      {error && <p className="text-[12px] text-red-500">{error}</p>}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={submitDisabled}
          className="h-10 px-5 flex items-center gap-2 rounded-lg bg-[#c25a4a] hover:bg-[#a84d3f] text-white text-[13px] font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? "Disabling…" : "Confirm disable"}
        </button>
        <SmallBtn onClick={onCancel}>Cancel</SmallBtn>
      </div>
    </form>
  );
};
