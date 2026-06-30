import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { toast } from "../toast/toast";
import { getLastClientError } from "../../utils/errorLogger";
import { useSubmitBugReport } from "./useSubmitBugReport";
import type { BugSeverity } from "./types";

interface BugReportModalProps {
  onClose: () => void;
}

const SEVERITIES: { value: BugSeverity; label: string }[] = [
  { value: "LOW", label: "Low" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HIGH", label: "High" },
];

export const BugReportModal = ({ onClose }: BugReportModalProps) => {
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState<BugSeverity>("MEDIUM");
  const { mutate, isPending } = useSubmitBugReport();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const handleSubmit = () => {
    const trimmed = description.trim();
    if (!trimmed || isPending) return;
    mutate(
      {
        description: trimmed,
        severity,
        url: window.location.pathname + window.location.search,
        lastError: getLastClientError() ?? undefined,
      },
      {
        onSuccess: () => {
          toast.success("Thanks — your report was sent.");
          onClose();
        },
      },
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[420px] rounded-xl border border-black/[0.08] bg-white p-6 shadow-xl dark:border-white/[0.07] dark:bg-[#151a17]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-1 flex items-center justify-between">
          <h2 className="text-[15px] font-semibold text-[#1a201c] dark:text-[#e8ece9]">
            Report a bug
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex h-7 w-7 items-center justify-center rounded-md text-[#858c87] transition-colors hover:bg-black/[0.04] hover:text-[#1a201c] dark:text-[#6e7672] dark:hover:bg-white/[0.04] dark:hover:text-[#e8ece9]"
          >
            <X size={16} />
          </button>
        </div>
        <p className="mb-4 text-[13px] text-[#5a625e] dark:text-[#a0a8a3]">
          Tell us what went wrong. We'll automatically attach the page you're on.
        </p>

        <textarea
          autoFocus
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={5000}
          rows={4}
          placeholder="What happened? What did you expect?"
          className="w-full resize-none rounded-lg border border-black/[0.08] bg-[#fafaf7] px-3 py-2.5 text-[13px] text-[#1a201c] placeholder:text-[#b5bbb7] focus:border-[#5a8a6b] focus:outline-none dark:border-white/[0.07] dark:bg-[#1c221e] dark:text-[#e8ece9] dark:placeholder:text-[#4a514d]"
        />

        <div className="mb-5 mt-3">
          <div className="mb-1.5 text-[11px] font-medium uppercase tracking-[0.06em] text-[#858c87] dark:text-[#6e7672]">
            Severity
          </div>
          <div className="flex gap-1.5">
            {SEVERITIES.map((s) => (
              <button
                key={s.value}
                type="button"
                onClick={() => setSeverity(s.value)}
                className={`h-8 flex-1 rounded-lg border text-[12px] font-medium transition-colors ${
                  severity === s.value
                    ? "border-[#5a8a6b] bg-[#5a8a6b]/10 text-[#3e6a4d] dark:text-[#6db383]"
                    : "border-black/[0.08] text-[#5a625e] hover:bg-black/[0.03] dark:border-white/[0.07] dark:text-[#a0a8a3] dark:hover:bg-white/[0.03]"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="h-10 flex-1 rounded-lg border border-black/[0.08] text-[13px] font-medium text-[#5a625e] transition-colors hover:bg-black/[0.03] dark:border-white/[0.07] dark:text-[#a0a8a3] dark:hover:bg-white/[0.03]"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!description.trim() || isPending}
            className="h-10 flex-1 rounded-lg bg-[#5a8a6b] text-[13px] font-medium text-white transition-colors hover:bg-[#4f7a5e] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPending ? "Sending…" : "Send report"}
          </button>
        </div>
      </div>
    </div>
  );
};
