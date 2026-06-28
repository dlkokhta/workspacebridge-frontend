import { useState } from "react";
import { ArrowRight, Check, Copy, Link2 } from "lucide-react";
import { axiosInstance } from "../../../context/AuthContext";
import { extractApiMessage } from "../utils/extractApiMessage";

interface InviteClientStepProps {
  /**
   * Persists the workspace (exactly once) and resolves its id. Called lazily —
   * only when the user takes a committing action here — so leaving onboarding
   * without acting never creates a workspace.
   */
  ensureWorkspace: () => Promise<string>;
  onBack: () => void;
  onComplete: (payload: { email: string; sent: boolean }) => void;
}

export const InviteClientStep = ({
  ensureWorkspace,
  onBack,
  onComplete,
}: InviteClientStepProps) => {
  const [email, setEmail] = useState("");
  const [copied, setCopied] = useState(false);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [linkLoading, setLinkLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateLink = async () => {
    setError(null);
    setLinkLoading(true);
    try {
      const id = await ensureWorkspace();
      const { data } = await axiosInstance.post<{ link: string }>(
        `/workspace/${id}/invite/link`,
      );
      setInviteLink(data.link);
    } catch (err: unknown) {
      setError(
        extractApiMessage(err) ?? "Failed to generate link. Please try again.",
      );
    } finally {
      setLinkLoading(false);
    }
  };

  const handleCopy = () => {
    if (!inviteLink) return;
    navigator.clipboard.writeText(inviteLink).catch(() => undefined);
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };

  const handleSubmit = async () => {
    const trimmed = email.trim();
    setError(null);
    setSubmitting(true);
    try {
      const id = await ensureWorkspace();
      if (trimmed) {
        await axiosInstance.post(`/workspace/${id}/invite`, { email: trimmed });
        onComplete({ email: trimmed, sent: true });
      } else {
        onComplete({ email: "", sent: false });
      }
    } catch (err: unknown) {
      setError(
        extractApiMessage(err) ?? "Failed to continue. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const hasEmail = email.trim().length > 0;

  return (
    <div>
      <span className="block text-[11px] uppercase tracking-[0.08em] font-medium text-[#5a8a6b] mb-3">
        Step 2 · Invite
      </span>
      <h1 className="text-[32px] font-semibold tracking-[-0.025em] text-[#1a201c] dark:text-[#e8ece9] mb-2">
        Invite your client
      </h1>
      <p className="text-[15px] text-[#5a625e] dark:text-[#a0a8a3] mb-7">
        Send a magic link — no app, no signup, no password.
      </p>

      <div className="space-y-5">
        <div>
          <label className="block text-[12px] font-medium text-[#5a625e] dark:text-[#a0a8a3] mb-1.5">
            Client email
          </label>
          <input
            type="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="sara@northwindstudio.com"
            className="w-full h-[42px] px-3.5 rounded-lg border border-black/[0.08] dark:border-white/[0.07] bg-white dark:bg-[#151a17] text-[14px] text-[#1a201c] dark:text-[#e8ece9] placeholder-[#858c87] dark:placeholder-[#6e7672] outline-none hover:border-black/[0.14] dark:hover:border-white/[0.14] focus:border-[#5a8a6b] focus:ring-2 focus:ring-[#5a8a6b]/20 transition-all"
          />
        </div>

        <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.08em] text-[#858c87] dark:text-[#6e7672]">
          <div className="flex-1 h-px bg-black/[0.06] dark:bg-white/[0.05]" />
          Or share a link
          <div className="flex-1 h-px bg-black/[0.06] dark:bg-white/[0.05]" />
        </div>

        {inviteLink ? (
          <div className="flex items-center gap-2.5 px-3 py-2.5 bg-white dark:bg-[#151a17] border border-black/[0.08] dark:border-white/[0.07] rounded-xl">
            <Link2
              size={15}
              className="text-[#858c87] dark:text-[#6e7672] shrink-0"
            />
            <span className="font-mono text-[12px] text-[#5a625e] dark:text-[#a0a8a3] flex-1 truncate">
              {inviteLink}
            </span>
            <button
              onClick={handleCopy}
              className="h-7 px-2.5 inline-flex items-center gap-1.5 rounded-md bg-[#f3f3ee] dark:bg-[#1c221e] border border-black/[0.08] dark:border-white/[0.07] text-[11px] font-medium text-[#1a201c] dark:text-[#e8ece9] hover:bg-[#ebebe6] dark:hover:bg-[#222b26] transition-colors shrink-0 cursor-pointer"
            >
              {copied ? (
                <>
                  <Check size={12} /> Copied
                </>
              ) : (
                <>
                  <Copy size={12} /> Copy
                </>
              )}
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleGenerateLink}
            disabled={linkLoading}
            className="w-full h-[42px] inline-flex items-center justify-center gap-2 rounded-lg border border-black/[0.08] dark:border-white/[0.07] bg-white dark:bg-[#151a17] text-[13px] font-medium text-[#1a201c] dark:text-[#e8ece9] hover:bg-black/[0.02] dark:hover:bg-white/[0.03] transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            {linkLoading ? (
              "Generating…"
            ) : (
              <>
                <Link2 size={14} /> Generate shareable link
              </>
            )}
          </button>
        )}
      </div>

      {error && <p className="mt-3 text-[13px] text-red-500">{error}</p>}

      <div className="flex gap-2.5 mt-7">
        <button
          onClick={onBack}
          disabled={submitting}
          className="flex-1 h-11 rounded-lg border border-black/[0.08] dark:border-white/[0.07] text-[14px] font-medium text-[#5a625e] dark:text-[#a0a8a3] hover:bg-black/[0.03] dark:hover:bg-white/[0.03] transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          Back
        </button>
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="flex-[2] h-11 flex items-center justify-center gap-2 rounded-lg bg-[#5a8a6b] hover:bg-[#4f7a5e] text-white text-[14px] font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          {submitting ? (
            hasEmail ? (
              "Sending…"
            ) : (
              "Finishing…"
            )
          ) : hasEmail ? (
            <>
              Send invite <ArrowRight size={15} />
            </>
          ) : (
            <>
              Continue <ArrowRight size={15} />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
