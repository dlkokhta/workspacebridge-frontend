import { SmallBtn } from "../../components/SmallBtn";

interface VerifyCodeFormProps {
  code: string;
  onCodeChange: (next: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  loading: boolean;
  error: string | null;
  variant: "enable" | "disable";
  qrCode?: string | null;
  prompt: string;
  submitLabel: string;
  loadingLabel: string;
  leftIcon?: React.ReactNode;
}

export const VerifyCodeForm = ({
  code,
  onCodeChange,
  onSubmit,
  onCancel,
  loading,
  error,
  variant,
  qrCode,
  prompt,
  submitLabel,
  loadingLabel,
  leftIcon,
}: VerifyCodeFormProps) => {
  const focusRing =
    variant === "enable"
      ? "focus:border-[#5a8a6b] focus:ring-2 focus:ring-[#5a8a6b]/20"
      : "focus:border-[#c25a4a] focus:ring-2 focus:ring-[#c25a4a]/20";
  const submitBg =
    variant === "enable"
      ? "bg-[#5a8a6b] hover:bg-[#4f7a5e]"
      : "bg-[#c25a4a] hover:bg-[#a84d3f]";

  return (
    <form onSubmit={onSubmit} className="pb-5 space-y-4 max-w-[380px]">
      <p className="text-[13px] text-[#5a625e] dark:text-[#a0a8a3]">{prompt}</p>
      {qrCode && (
        <div className="flex justify-center py-2">
          <img
            src={qrCode}
            alt="2FA QR code"
            className="w-44 h-44 rounded-lg border border-black/[0.08] dark:border-white/[0.07] bg-white p-2"
          />
        </div>
      )}
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        maxLength={6}
        value={code}
        onChange={(e) => onCodeChange(e.target.value.replace(/\D/g, ""))}
        placeholder="000000"
        autoFocus={variant === "disable"}
        className={`w-full h-[44px] px-3.5 rounded-lg border border-black/[0.08] dark:border-white/[0.07] bg-white dark:bg-[#151a17] text-center text-[18px] tracking-[0.4em] font-mono text-[#1a201c] dark:text-[#e8ece9] outline-none transition-all ${focusRing}`}
      />
      {error && <p className="text-[12px] text-red-500">{error}</p>}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading || code.length !== 6}
          className={`h-10 px-5 flex items-center gap-2 rounded-lg text-white text-[13px] font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${submitBg}`}
        >
          {leftIcon}
          {loading ? loadingLabel : submitLabel}
        </button>
        <SmallBtn onClick={onCancel}>Cancel</SmallBtn>
      </div>
    </form>
  );
};
