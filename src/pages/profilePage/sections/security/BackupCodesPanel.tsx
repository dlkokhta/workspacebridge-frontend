import { useState } from "react";
import { Check, Copy, Download } from "lucide-react";
import { SmallBtn } from "../../components/SmallBtn";

interface BackupCodesPanelProps {
  codes: string[];
  onDone: () => void;
}

// One-time display of freshly issued 2FA backup codes — the server only
// stores hashes, so this is the user's single chance to save them.
export const BackupCodesPanel = ({ codes, onDone }: BackupCodesPanelProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(codes.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob(
      [`WorkspaceBridge backup codes\n\n${codes.join("\n")}\n`],
      { type: "text/plain" },
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "workspacebridge-backup-codes.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="pb-5 space-y-3 max-w-[380px]">
      <p className="text-[13px] text-[#5a625e] dark:text-[#a0a8a3]">
        Save these one-time backup codes somewhere safe. Each code signs you in
        once if you lose access to your authenticator app — they won't be shown
        again.
      </p>
      <div className="grid grid-cols-2 gap-2 p-4 rounded-lg border border-black/[0.08] dark:border-white/[0.07] bg-[#f6f6f1] dark:bg-[#151a17]">
        {codes.map((code) => (
          <span
            key={code}
            className="font-mono text-[13px] tracking-wide text-[#1a201c] dark:text-[#e8ece9]"
          >
            {code}
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <SmallBtn onClick={() => void handleCopy()}>
          {copied ? <Check size={13} /> : <Copy size={13} />}
          {copied ? "Copied" : "Copy"}
        </SmallBtn>
        <SmallBtn onClick={handleDownload}>
          <Download size={13} />
          Download
        </SmallBtn>
        <SmallBtn variant="primary" onClick={onDone}>
          I've saved them
        </SmallBtn>
      </div>
    </div>
  );
};
