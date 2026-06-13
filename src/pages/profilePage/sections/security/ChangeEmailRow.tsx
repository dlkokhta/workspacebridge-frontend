import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Eye, EyeOff } from "lucide-react";
import { axiosInstance } from "../../../../context/AuthContext";
import { SmallBtn } from "../../components/SmallBtn";

interface ChangeEmailRowProps {
  currentEmail: string;
  onSuccess: (message: string) => void;
}

const extractApiMessage = (err: unknown): string | null =>
  (err as { response?: { data?: { message?: string } } })?.response?.data
    ?.message ?? null;

// Starts an email change. The account email isn't touched until the user
// confirms the link sent to the NEW address; the OLD address gets an alert.
export const ChangeEmailRow = ({
  currentEmail,
  onSuccess,
}: ChangeEmailRowProps) => {
  const [showForm, setShowForm] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async (vars: { newEmail: string; password: string }) => {
      await axiosInstance.post("/auth/change-email", vars);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await mutation.mutateAsync({ newEmail, password });
      setShowForm(false);
      setNewEmail("");
      setPassword("");
      onSuccess(
        "Check your new inbox — a confirmation link is on its way. Your email changes once you confirm it.",
      );
    } catch (err: unknown) {
      setError(extractApiMessage(err) ?? "Failed to start email change");
    }
  };

  const saving = mutation.isPending;

  return (
    <div className="border-b border-black/[0.06] dark:border-white/[0.05]">
      <div className="flex items-start justify-between gap-6 py-5">
        <div className="flex-1">
          <div className="text-[14px] font-medium text-[#1a201c] dark:text-[#e8ece9] mb-1">
            Email address
          </div>
          <div className="text-[13px] text-[#5a625e] dark:text-[#a0a8a3] leading-[1.5] max-w-[380px]">
            Currently <span className="font-medium">{currentEmail}</span>. We'll
            send a confirmation link to the new address before switching.
          </div>
        </div>
        <SmallBtn
          onClick={() => {
            setShowForm((v) => !v);
            setError(null);
          }}
        >
          {showForm ? "Cancel" : "Change email"}
        </SmallBtn>
      </div>
      {showForm && (
        <form onSubmit={handleSubmit} className="pb-5 space-y-3 max-w-[380px]">
          <input
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            placeholder="New email address"
            autoComplete="email"
            className="w-full h-[42px] px-3.5 rounded-lg border border-black/[0.08] dark:border-white/[0.07] bg-white dark:bg-[#151a17] text-[13px] text-[#1a201c] dark:text-[#e8ece9] placeholder-[#4a514d] outline-none hover:border-black/[0.14] dark:hover:border-white/[0.14] focus:border-[#5a8a6b] focus:ring-2 focus:ring-[#5a8a6b]/20 transition-all"
          />
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Current password"
              autoComplete="current-password"
              className="w-full h-[42px] pl-3.5 pr-10 rounded-lg border border-black/[0.08] dark:border-white/[0.07] bg-white dark:bg-[#151a17] text-[13px] text-[#1a201c] dark:text-[#e8ece9] placeholder-[#4a514d] outline-none hover:border-black/[0.14] dark:hover:border-white/[0.14] focus:border-[#5a8a6b] focus:ring-2 focus:ring-[#5a8a6b]/20 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#858c87] dark:text-[#6e7672] cursor-pointer"
            >
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          {error && <p className="text-[12px] text-red-500">{error}</p>}
          <button
            type="submit"
            disabled={saving}
            className="h-10 px-5 flex items-center gap-2 rounded-lg bg-[#5a8a6b] hover:bg-[#4f7a5e] text-white text-[13px] font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving ? "Sending…" : "Send confirmation link"}
          </button>
        </form>
      )}
    </div>
  );
};
