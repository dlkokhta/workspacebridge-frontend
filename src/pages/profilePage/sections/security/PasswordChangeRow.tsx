import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Eye, EyeOff } from "lucide-react";
import { axiosInstance } from "../../../../context/AuthContext";
import { SmallBtn } from "../../components/SmallBtn";

const extractApiMessage = (err: unknown): string | null =>
  (err as { response?: { data?: { message?: string } } })?.response?.data
    ?.message ?? null;

export const PasswordChangeRow = () => {
  const [showForm, setShowForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async (vars: { currentPassword: string; newPassword: string }) => {
      await axiosInstance.patch("/user/me/password", vars);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setError(null);
    setSuccess(false);
    try {
      await mutation.mutateAsync({ currentPassword, newPassword });
      setSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => {
        setSuccess(false);
        setShowForm(false);
      }, 1800);
    } catch (err: unknown) {
      setError(extractApiMessage(err) ?? "Failed to change password");
    }
  };

  const saving = mutation.isPending;

  return (
    <div className="border-b border-black/[0.06] dark:border-white/[0.05]">
      <div className="flex items-start justify-between gap-6 py-5">
        <div className="flex-1">
          <div className="text-[14px] font-medium text-[#1a201c] dark:text-[#e8ece9] mb-1">
            Password
          </div>
          <div className="text-[13px] text-[#5a625e] dark:text-[#a0a8a3] leading-[1.5] max-w-[380px]">
            Use a strong password — at least 8 characters with letters, numbers,
            and a symbol.
          </div>
        </div>
        <SmallBtn
          onClick={() => {
            setShowForm((v) => !v);
            setError(null);
            setSuccess(false);
          }}
        >
          {showForm ? "Cancel" : "Change password"}
        </SmallBtn>
      </div>
      {showForm && (
        <form onSubmit={handleSubmit} className="pb-5 space-y-3 max-w-[380px]">
          <div className="relative">
            <input
              type={showCurrent ? "text" : "password"}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Current password"
              className="w-full h-[42px] pl-3.5 pr-10 rounded-lg border border-black/[0.08] dark:border-white/[0.07] bg-white dark:bg-[#151a17] text-[13px] text-[#1a201c] dark:text-[#e8ece9] placeholder-[#4a514d] outline-none hover:border-black/[0.14] dark:hover:border-white/[0.14] focus:border-[#5a8a6b] focus:ring-2 focus:ring-[#5a8a6b]/20 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowCurrent((v) => !v)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#858c87] dark:text-[#6e7672] cursor-pointer"
            >
              {showCurrent ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          <div className="relative">
            <input
              type={showNew ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New password"
              className="w-full h-[42px] pl-3.5 pr-10 rounded-lg border border-black/[0.08] dark:border-white/[0.07] bg-white dark:bg-[#151a17] text-[13px] text-[#1a201c] dark:text-[#e8ece9] placeholder-[#4a514d] outline-none hover:border-black/[0.14] dark:hover:border-white/[0.14] focus:border-[#5a8a6b] focus:ring-2 focus:ring-[#5a8a6b]/20 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowNew((v) => !v)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#858c87] dark:text-[#6e7672] cursor-pointer"
            >
              {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm new password"
            className="w-full h-[42px] px-3.5 rounded-lg border border-black/[0.08] dark:border-white/[0.07] bg-white dark:bg-[#151a17] text-[13px] text-[#1a201c] dark:text-[#e8ece9] placeholder-[#4a514d] outline-none hover:border-black/[0.14] dark:hover:border-white/[0.14] focus:border-[#5a8a6b] focus:ring-2 focus:ring-[#5a8a6b]/20 transition-all"
          />
          {error && <p className="text-[12px] text-red-500">{error}</p>}
          {success && (
            <p className="text-[12px] text-[#4a8a5e] dark:text-[#6db383]">
              Password changed.
            </p>
          )}
          <button
            type="submit"
            disabled={saving}
            className="h-10 px-5 flex items-center gap-2 rounded-lg bg-[#5a8a6b] hover:bg-[#4f7a5e] text-white text-[13px] font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving ? "Updating…" : "Update password"}
          </button>
        </form>
      )}
    </div>
  );
};
