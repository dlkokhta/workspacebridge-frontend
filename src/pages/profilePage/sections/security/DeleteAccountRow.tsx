import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Trash2 } from "lucide-react";
import { axiosInstance, useAuth } from "../../../../context/AuthContext";
import { SmallBtn } from "../../components/SmallBtn";
import { useSignInMethods } from "./useSignInMethods";

const extractApiMessage = (err: unknown): string | null =>
  (err as { response?: { data?: { message?: string } } })?.response?.data
    ?.message ?? null;

// Permanently deletes the account (hard delete). Credential accounts re-confirm
// with their password; OAuth-only accounts just type the confirmation word.
// On success the access token is cleared and the user is sent to /login.
export const DeleteAccountRow = () => {
  const navigate = useNavigate();
  const { setAccessToken } = useAuth();
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Only fetch sign-in methods once the danger form is open. `hasPassword`
  // (not the profile `method`) decides whether a password is required, so a
  // Google user who later set a password is still asked to confirm it.
  const { query } = useSignInMethods(open);
  const needsPassword = query.data?.hasPassword ?? false;

  const mutation = useMutation({
    mutationFn: async () => {
      await axiosInstance.delete("/user/me", {
        data: needsPassword ? { password } : {},
      });
    },
  });

  const canDelete =
    confirmText === "DELETE" && (!needsPassword || password.length > 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canDelete) return;
    setError(null);
    try {
      await mutation.mutateAsync();
      setAccessToken(null);
      navigate("/login");
    } catch (err: unknown) {
      setError(extractApiMessage(err) ?? "Failed to delete account");
    }
  };

  return (
    <div className="border-b border-black/[0.06] dark:border-white/[0.05]">
      <div className="flex items-start justify-between gap-6 py-5">
        <div className="flex-1">
          <div className="text-[14px] font-medium text-[#c25a4a] dark:text-[#e07b6b] mb-1">
            Delete account
          </div>
          <div className="text-[13px] text-[#5a625e] dark:text-[#a0a8a3] leading-[1.5] max-w-[380px]">
            Permanently delete your account and all of its data, including the
            workspaces you own. This can't be undone.
          </div>
        </div>
        <SmallBtn
          variant="danger"
          onClick={() => {
            setOpen((v) => !v);
            setError(null);
            setPassword("");
            setConfirmText("");
          }}
        >
          {open ? "Cancel" : "Delete account"}
        </SmallBtn>
      </div>
      {open && (
        <form onSubmit={handleSubmit} className="pb-5 space-y-3 max-w-[380px]">
          {needsPassword && (
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Current password"
                autoComplete="current-password"
                className="w-full h-[42px] pl-3.5 pr-10 rounded-lg border border-black/[0.08] dark:border-white/[0.07] bg-white dark:bg-[#151a17] text-[13px] text-[#1a201c] dark:text-[#e8ece9] placeholder-[#4a514d] outline-none hover:border-black/[0.14] dark:hover:border-white/[0.14] focus:border-[#c25a4a] focus:ring-2 focus:ring-[#c25a4a]/20 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#858c87] dark:text-[#6e7672] cursor-pointer"
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          )}
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="Type DELETE to confirm"
            autoComplete="off"
            className="w-full h-[42px] px-3.5 rounded-lg border border-black/[0.08] dark:border-white/[0.07] bg-white dark:bg-[#151a17] text-[13px] text-[#1a201c] dark:text-[#e8ece9] placeholder-[#4a514d] outline-none hover:border-black/[0.14] dark:hover:border-white/[0.14] focus:border-[#c25a4a] focus:ring-2 focus:ring-[#c25a4a]/20 transition-all"
          />
          {error && <p className="text-[12px] text-red-500">{error}</p>}
          <button
            type="submit"
            disabled={!canDelete || mutation.isPending}
            className="h-10 px-5 flex items-center gap-2 rounded-lg bg-[#c25a4a] hover:bg-[#ad4d3e] text-white text-[13px] font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <Trash2 size={14} />
            {mutation.isPending ? "Deleting…" : "Permanently delete"}
          </button>
        </form>
      )}
    </div>
  );
};
