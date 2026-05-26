import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ShieldCheck } from "lucide-react";
import { axiosInstance } from "../../../../context/AuthContext";
import {
  currentUserKey,
  type UserProfile,
} from "../../../../hooks/useCurrentUser";
import { SmallBtn } from "../../components/SmallBtn";
import { DisableTwoFactorForm } from "./DisableTwoFactorForm";
import { VerifyCodeForm } from "./VerifyCodeForm";

interface TwoFactorRowProps {
  profile: UserProfile;
  onSuccess: (message: string) => void;
}

const extractApiMessage = (err: unknown): string | null =>
  (err as { response?: { data?: { message?: string } } })?.response?.data
    ?.message ?? null;

export const TwoFactorRow = ({ profile, onSuccess }: TwoFactorRowProps) => {
  const queryClient = useQueryClient();
  const [setupMode, setSetupMode] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const generateMutation = useMutation({
    mutationFn: async () => {
      const { data } = await axiosInstance.post<{ qrCodeDataURL: string }>(
        "/auth/2fa/generate",
      );
      return data;
    },
  });

  const enableMutation = useMutation({
    mutationFn: async (verifyCode: string) => {
      await axiosInstance.post("/auth/2fa/enable", { code: verifyCode });
    },
    onSuccess: () => {
      queryClient.setQueryData<UserProfile>(currentUserKey, (prev) =>
        prev ? { ...prev, isTwoFactorEnabled: true } : prev,
      );
    },
  });

  const disableMutation = useMutation({
    mutationFn: async (vars: { code: string; password: string }) => {
      await axiosInstance.post("/auth/2fa/disable", vars);
    },
    onSuccess: () => {
      queryClient.setQueryData<UserProfile>(currentUserKey, (prev) =>
        prev ? { ...prev, isTwoFactorEnabled: false } : prev,
      );
    },
  });

  const loading =
    generateMutation.isPending ||
    enableMutation.isPending ||
    disableMutation.isPending;

  const handleGenerate = async () => {
    setError(null);
    try {
      const data = await generateMutation.mutateAsync();
      setQrCode(data.qrCodeDataURL);
      setSetupMode(true);
    } catch (err: unknown) {
      setError(extractApiMessage(err) ?? "Failed to generate QR code");
    }
  };

  const handleEnable = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await enableMutation.mutateAsync(code);
      resetSetup();
      onSuccess("2FA enabled. Your account is now protected.");
    } catch (err: unknown) {
      setError(extractApiMessage(err) ?? "Invalid code. Please try again.");
    }
  };

  const handleDisable = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await disableMutation.mutateAsync({ code, password });
      resetSetup();
      onSuccess("2FA has been disabled.");
    } catch (err: unknown) {
      setError(
        extractApiMessage(err) ?? "Invalid password or code. Please try again.",
      );
    }
  };

  const resetSetup = () => {
    setSetupMode(false);
    setQrCode(null);
    setCode("");
    setPassword("");
    setError(null);
  };

  return (
    <div className="border-b border-black/[0.06] dark:border-white/[0.05]">
      <div className="flex items-start justify-between gap-6 py-5">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[14px] font-medium text-[#1a201c] dark:text-[#e8ece9]">
              Two-factor authentication
            </span>
            {profile.isTwoFactorEnabled ? (
              <span className="inline-flex items-center gap-1.5 h-[20px] px-2 rounded-full bg-[#5a8a6b]/10 border border-[#5a8a6b]/30 text-[10px] font-medium text-[#3e6a4d] dark:text-[#6db383]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#4a8a5e] dark:bg-[#6db383]" />
                Enabled
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 h-[20px] px-2 rounded-full bg-[#f3f3ee] dark:bg-[#1c221e] border border-black/[0.08] dark:border-white/[0.07] text-[10px] font-medium text-[#5a625e] dark:text-[#a0a8a3]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#858c87] dark:bg-[#6e7672]" />
                Disabled
              </span>
            )}
          </div>
          <div className="text-[13px] text-[#5a625e] dark:text-[#a0a8a3] leading-[1.5] max-w-[380px]">
            Add a second step at sign-in using an authenticator app like Google
            Authenticator or Authy.
          </div>
        </div>
        {!setupMode &&
          (profile.isTwoFactorEnabled ? (
            <SmallBtn
              variant="danger"
              onClick={() => {
                setSetupMode(true);
                setError(null);
                setCode("");
              }}
            >
              Disable 2FA
            </SmallBtn>
          ) : (
            <SmallBtn variant="primary" onClick={handleGenerate} disabled={loading}>
              <ShieldCheck size={13} />
              {loading ? "Loading…" : "Enable 2FA"}
            </SmallBtn>
          ))}
      </div>

      {setupMode && !profile.isTwoFactorEnabled && (
        <VerifyCodeForm
          variant="enable"
          code={code}
          onCodeChange={setCode}
          onSubmit={handleEnable}
          onCancel={resetSetup}
          loading={loading}
          error={error}
          qrCode={qrCode}
          prompt="Scan this QR code with your authenticator app, then enter the 6-digit code to confirm."
          submitLabel="Confirm & enable"
          loadingLabel="Verifying…"
          leftIcon={<ShieldCheck size={14} />}
        />
      )}

      {setupMode && profile.isTwoFactorEnabled && (
        <DisableTwoFactorForm
          code={code}
          password={password}
          onCodeChange={setCode}
          onPasswordChange={setPassword}
          onSubmit={handleDisable}
          onCancel={resetSetup}
          loading={loading}
          error={error}
        />
      )}
    </div>
  );
};
