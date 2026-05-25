import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import { axiosInstance, useAuth } from "../../../context/AuthContext";
import type { InviteInfo } from "../hooks/useInvite";

interface AcceptInviteFormProps {
  token: string;
  invite: InviteInfo;
  onAccepted: () => void;
}

interface AcceptResponse {
  accessToken: string;
  user: { id: string; email: string; role: string };
  workspaceId: string;
}

const extractApiMessage = (err: unknown): string | null =>
  (err as { response?: { data?: { message?: string } } })?.response?.data
    ?.message ?? null;

export const AcceptInviteForm = ({
  token,
  invite,
  onAccepted,
}: AcceptInviteFormProps) => {
  const navigate = useNavigate();
  const { setAccessToken } = useAuth();
  const [clientEmail, setClientEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const acceptMutation = useMutation({
    mutationFn: async (vars: { password: string; email?: string }) => {
      const { data } = await axiosInstance.post<AcceptResponse>(
        `/invite/${token}/accept`,
        {
          password: vars.password,
          ...(vars.email ? { email: vars.email } : {}),
        },
      );
      return data;
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setError(null);
    try {
      const data = await acceptMutation.mutateAsync({
        password,
        email: invite.email ? undefined : clientEmail,
      });
      setAccessToken(data.accessToken);
      onAccepted();
    } catch (err: unknown) {
      setError(extractApiMessage(err) ?? "Something went wrong. Please try again.");
    }
  };

  const submitting = acceptMutation.isPending;
  const requiresEmail = !invite.email;
  const submitDisabled =
    submitting || !password || !confirm || (requiresEmail && !clientEmail);

  return (
    <div>
      {/* Workspace card */}
      <div className="flex items-center gap-3 mb-7 px-4 py-3.5 rounded-xl border border-black/[0.08] dark:border-white/[0.07] bg-white dark:bg-[#151a17]">
        <span
          className="w-10 h-10 rounded-lg flex items-center justify-center text-[16px] font-semibold text-white shrink-0"
          style={{ background: invite.workspace.color }}
        >
          {invite.workspace.name[0].toUpperCase()}
        </span>
        <div className="flex flex-col min-w-0">
          <span className="text-[14px] font-semibold text-[#1a201c] dark:text-[#e8ece9] truncate">
            {invite.workspace.name}
          </span>
          {invite.workspace.description && (
            <span className="text-[12px] text-[#858c87] dark:text-[#6e7672] truncate">
              {invite.workspace.description}
            </span>
          )}
        </div>
      </div>

      <span className="block text-[11px] uppercase tracking-[0.08em] font-medium text-[#5a8a6b] mb-3">
        You're invited
      </span>
      <h1 className="text-[28px] font-semibold tracking-[-0.025em] text-[#1a201c] dark:text-[#e8ece9] mb-2">
        Set up your account
      </h1>
      <p className="text-[14px] text-[#5a625e] dark:text-[#a0a8a3] mb-7">
        {invite.email ? (
          <>
            You were invited as{" "}
            <strong className="text-[#1a201c] dark:text-[#e8ece9] font-medium">
              {invite.email}
            </strong>
            . Create a password to get started.
          </>
        ) : (
          "Create a password to get access to the workspace."
        )}
      </p>

      <form onSubmit={handleSubmit} className="space-y-3">
        {requiresEmail && (
          <input
            type="email"
            value={clientEmail}
            onChange={(e) => setClientEmail(e.target.value)}
            placeholder="Your email address"
            autoFocus
            required
            className="w-full h-[42px] px-3.5 rounded-lg border border-black/[0.08] dark:border-white/[0.07] bg-white dark:bg-[#151a17] text-[14px] text-[#1a201c] dark:text-[#e8ece9] placeholder-[#858c87] dark:placeholder-[#6e7672] outline-none hover:border-black/[0.14] dark:hover:border-white/[0.14] focus:border-[#5a8a6b] focus:ring-2 focus:ring-[#5a8a6b]/20 transition-all"
          />
        )}
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Create a password"
            autoFocus={!requiresEmail}
            minLength={8}
            required
            className="w-full h-[42px] pl-3.5 pr-10 rounded-lg border border-black/[0.08] dark:border-white/[0.07] bg-white dark:bg-[#151a17] text-[14px] text-[#1a201c] dark:text-[#e8ece9] placeholder-[#858c87] dark:placeholder-[#6e7672] outline-none hover:border-black/[0.14] dark:hover:border-white/[0.14] focus:border-[#5a8a6b] focus:ring-2 focus:ring-[#5a8a6b]/20 transition-all"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#858c87] dark:text-[#6e7672] cursor-pointer"
          >
            {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>

        <div className="relative">
          <input
            type={showConfirm ? "text" : "password"}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Confirm password"
            required
            className="w-full h-[42px] pl-3.5 pr-10 rounded-lg border border-black/[0.08] dark:border-white/[0.07] bg-white dark:bg-[#151a17] text-[14px] text-[#1a201c] dark:text-[#e8ece9] placeholder-[#858c87] dark:placeholder-[#6e7672] outline-none hover:border-black/[0.14] dark:hover:border-white/[0.14] focus:border-[#5a8a6b] focus:ring-2 focus:ring-[#5a8a6b]/20 transition-all"
          />
          <button
            type="button"
            onClick={() => setShowConfirm((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#858c87] dark:text-[#6e7672] cursor-pointer"
          >
            {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>

        {error && <p className="text-[13px] text-red-500">{error}</p>}

        <button
          type="submit"
          disabled={submitDisabled}
          className="w-full h-11 mt-2 flex items-center justify-center gap-2 rounded-lg bg-[#5a8a6b] hover:bg-[#4f7a5e] text-white text-[14px] font-medium transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {submitting ? (
            "Joining…"
          ) : (
            <>
              Join workspace <ArrowRight size={15} />
            </>
          )}
        </button>
      </form>

      <p className="mt-5 text-center text-[12px] text-[#858c87] dark:text-[#6e7672]">
        Already have an account?{" "}
        <button
          onClick={() => navigate("/login")}
          className="text-[#5a8a6b] hover:underline cursor-pointer"
        >
          Sign in
        </button>
      </p>
    </div>
  );
};
