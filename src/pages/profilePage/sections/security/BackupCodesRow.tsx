import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { KeyRound } from "lucide-react";
import { axiosInstance } from "../../../../context/AuthContext";
import { SmallBtn } from "../../components/SmallBtn";
import { VerifyCodeForm } from "./VerifyCodeForm";
import { BackupCodesPanel } from "./BackupCodesPanel";

interface BackupCodesRowProps {
  onSuccess: (message: string) => void;
}

const extractApiMessage = (err: unknown): string | null =>
  (err as { response?: { data?: { message?: string } } })?.response?.data
    ?.message ?? null;

// Shown only while 2FA is enabled. Regenerating requires the current TOTP
// code and invalidates every previously issued backup code.
export const BackupCodesRow = ({ onSuccess }: BackupCodesRowProps) => {
  const [confirmMode, setConfirmMode] = useState(false);
  const [code, setCode] = useState("");
  const [codes, setCodes] = useState<string[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const regenerateMutation = useMutation({
    mutationFn: async (totpCode: string) => {
      const { data } = await axiosInstance.post<{ backupCodes: string[] }>(
        "/auth/2fa/backup-codes/regenerate",
        { code: totpCode },
      );
      return data;
    },
  });

  const reset = () => {
    setConfirmMode(false);
    setCode("");
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const data = await regenerateMutation.mutateAsync(code);
      reset();
      setCodes(data.backupCodes);
    } catch (err: unknown) {
      setError(extractApiMessage(err) ?? "Invalid code. Please try again.");
    }
  };

  return (
    <div className="border-b border-black/[0.06] dark:border-white/[0.05]">
      <div className="flex items-start justify-between gap-6 py-5">
        <div className="flex-1">
          <div className="text-[14px] font-medium text-[#1a201c] dark:text-[#e8ece9] mb-1">
            Backup codes
          </div>
          <div className="text-[13px] text-[#5a625e] dark:text-[#a0a8a3] leading-[1.5] max-w-[380px]">
            One-time codes that let you sign in if you lose your authenticator.
            Regenerating replaces all previous codes.
          </div>
        </div>
        {!confirmMode && !codes && (
          <SmallBtn onClick={() => setConfirmMode(true)}>
            <KeyRound size={13} />
            Regenerate
          </SmallBtn>
        )}
      </div>

      {confirmMode && (
        <VerifyCodeForm
          variant="enable"
          code={code}
          onCodeChange={setCode}
          onSubmit={(e) => void handleSubmit(e)}
          onCancel={reset}
          loading={regenerateMutation.isPending}
          error={error}
          prompt="Enter the current 6-digit code from your authenticator app to generate a new set of backup codes."
          submitLabel="Generate new codes"
          loadingLabel="Generating…"
          leftIcon={<KeyRound size={14} />}
        />
      )}

      {codes && (
        <BackupCodesPanel
          codes={codes}
          onDone={() => {
            setCodes(null);
            onSuccess(
              "New backup codes generated. Previous codes no longer work.",
            );
          }}
        />
      )}
    </div>
  );
};
