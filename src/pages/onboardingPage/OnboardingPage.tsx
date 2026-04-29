import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Check, Copy, Moon, Sun } from "lucide-react";
import { axiosInstance } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

const COLORS = ["#5a8a6b", "#7a9bbf", "#b5803a", "#9a7ab8", "#c25a4a", "#4f7aa3"];

const MOCK_INVITE_LINK = "workspacebridge.app/join/wn-7k4a-9x2m";

export const OnboardingPage = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const [step, setStep] = useState(1);

  // Step 1
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [color, setColor] = useState(COLORS[0]);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);

  // Step 2
  const [email, setEmail] = useState("");
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(MOCK_INVITE_LINK).catch(() => undefined);
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };

  const handleCreate = async () => {
    if (!name.trim()) return;
    setCreating(true);
    setCreateError(null);
    try {
      const res = await axiosInstance.post<{ id: string }>("/workspace", {
        name: name.trim(),
        description: desc.trim() || undefined,
        color,
      });
      setWorkspaceId(res.data.id);
      setStep(2);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setCreateError(msg ?? "Failed to create workspace. Please try again.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fafaf7] dark:bg-[#0e1310]">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-5 border-b border-black/[0.06] dark:border-white/[0.05]">
        <Link
          to="/"
          className="flex items-center gap-2 text-[14px] font-semibold tracking-[-0.02em] text-[#1a201c] dark:text-[#e8ece9]"
        >
          <span className="w-[22px] h-[22px] rounded-[6px] bg-[#5a8a6b] text-white flex items-center justify-center">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </span>
          WorkspaceBridge
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-[12px] text-[#858c87] dark:text-[#6e7672]">Step {step} of 3</span>
          <button
            onClick={toggleTheme}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-black/[0.08] dark:border-white/[0.07] bg-white dark:bg-[#1c221e] text-[#5a625e] dark:text-[#a0a8a3] hover:bg-[#f6f6f1] dark:hover:bg-[#222b26] transition-colors"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
          </button>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-[520px]">
          {/* Progress bar */}
          <div className="flex gap-1.5 mb-8">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex-1 h-[3px] rounded-full transition-colors duration-300"
                style={{ background: i <= step ? "#5a8a6b" : "rgba(0,0,0,0.08)" }}
                data-dark-bg={i <= step ? undefined : "rgba(255,255,255,0.07)"}
              />
            ))}
          </div>

          {/* Step 1 — Create workspace */}
          {step === 1 && (
            <div>
              <span className="block text-[11px] uppercase tracking-[0.08em] font-medium text-[#5a8a6b] mb-3">
                Step 1 · Workspace
              </span>
              <h1 className="text-[32px] font-semibold tracking-[-0.025em] text-[#1a201c] dark:text-[#e8ece9] mb-2">
                Create a workspace
              </h1>
              <p className="text-[15px] text-[#5a625e] dark:text-[#a0a8a3] mb-7">
                One workspace per client project. You can rename or archive it later.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-[12px] font-medium text-[#5a625e] dark:text-[#a0a8a3] mb-1.5">
                    Workspace name
                  </label>
                  <input
                    type="text"
                    autoFocus
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" && name.trim()) handleCreate(); }}
                    placeholder="e.g. Northwind Studio"
                    className="w-full h-[42px] px-3.5 rounded-lg border border-black/[0.08] dark:border-white/[0.07] bg-white dark:bg-[#151a17] text-[14px] text-[#1a201c] dark:text-[#e8ece9] placeholder-[#858c87] dark:placeholder-[#6e7672] outline-none hover:border-black/[0.14] dark:hover:border-white/[0.14] focus:border-[#5a8a6b] focus:ring-2 focus:ring-[#5a8a6b]/20 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-medium text-[#5a625e] dark:text-[#a0a8a3] mb-1.5">
                    Project description <span className="font-normal opacity-60">(optional)</span>
                  </label>
                  <textarea
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                    placeholder="Brand identity · Q3 2026"
                    rows={2}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-black/[0.08] dark:border-white/[0.07] bg-white dark:bg-[#151a17] text-[14px] text-[#1a201c] dark:text-[#e8ece9] placeholder-[#858c87] dark:placeholder-[#6e7672] outline-none hover:border-black/[0.14] dark:hover:border-white/[0.14] focus:border-[#5a8a6b] focus:ring-2 focus:ring-[#5a8a6b]/20 transition-all resize-none"
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-medium text-[#5a625e] dark:text-[#a0a8a3] mb-2">
                    Color
                  </label>
                  <div className="flex gap-2">
                    {COLORS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setColor(c)}
                        className="w-8 h-8 rounded-lg transition-all"
                        style={{
                          background: c,
                          outline: color === c ? `2px solid ${c}` : "2px solid transparent",
                          outlineOffset: 2,
                        }}
                        aria-label={c}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Preview pill */}
              {name.trim() && (
                <div className="mt-5 flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-black/[0.08] dark:border-white/[0.07] bg-white dark:bg-[#151a17] w-fit">
                  <span
                    className="w-[22px] h-[22px] rounded-md flex items-center justify-center text-[10px] font-semibold text-white shrink-0"
                    style={{ background: color }}
                  >
                    {name.trim()[0].toUpperCase()}
                  </span>
                  <div className="flex flex-col">
                    <span className="text-[13px] font-medium text-[#1a201c] dark:text-[#e8ece9]">{name.trim()}</span>
                    {desc.trim() && <span className="text-[11px] text-[#858c87] dark:text-[#6e7672]">{desc.trim()}</span>}
                  </div>
                </div>
              )}

              {createError && (
                <p className="mt-4 text-[13px] text-red-500">{createError}</p>
              )}
              <button
                onClick={handleCreate}
                disabled={!name.trim() || creating}
                className="w-full h-11 mt-6 flex items-center justify-center gap-2 rounded-lg bg-[#5a8a6b] hover:bg-[#4f7a5e] active:bg-[#446b52] text-white text-[14px] font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {creating ? "Creating…" : <> Continue <ArrowRight size={15} /> </>}
              </button>
            </div>
          )}

          {/* Step 2 — Invite client */}
          {step === 2 && (
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

                <div className="flex items-center gap-2.5 px-3 py-2.5 bg-white dark:bg-[#151a17] border border-black/[0.08] dark:border-white/[0.07] rounded-xl">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#858c87] dark:text-[#6e7672] shrink-0">
                    <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
                    <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
                  </svg>
                  <span className="font-mono text-[12px] text-[#5a625e] dark:text-[#a0a8a3] flex-1 truncate">
                    {MOCK_INVITE_LINK}
                  </span>
                  <button
                    onClick={handleCopy}
                    className="h-7 px-2.5 inline-flex items-center gap-1.5 rounded-md bg-[#f3f3ee] dark:bg-[#1c221e] border border-black/[0.08] dark:border-white/[0.07] text-[11px] font-medium text-[#1a201c] dark:text-[#e8ece9] hover:bg-[#ebebе6] dark:hover:bg-[#222b26] transition-colors shrink-0"
                  >
                    {copied ? <><Check size={12} /> Copied</> : <><Copy size={12} /> Copy</>}
                  </button>
                </div>
              </div>

              <div className="flex gap-2.5 mt-7">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 h-11 rounded-lg border border-black/[0.08] dark:border-white/[0.07] text-[14px] font-medium text-[#5a625e] dark:text-[#a0a8a3] hover:bg-black/[0.03] dark:hover:bg-white/[0.03] transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="flex-[2] h-11 flex items-center justify-center gap-2 rounded-lg bg-[#5a8a6b] hover:bg-[#4f7a5e] text-white text-[14px] font-medium transition-colors"
                >
                  Send invite <ArrowRight size={15} />
                </button>
              </div>
              <p className="mt-4 text-center text-[12px] text-[#858c87] dark:text-[#6e7672]">
                You can also skip and invite later.{" "}
                <button onClick={() => setStep(3)} className="text-[#5a8a6b] hover:underline">Skip</button>
              </p>
            </div>
          )}

          {/* Step 3 — Success */}
          {step === 3 && (
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-[#5a8a6b]/10 text-[#5a8a6b] flex items-center justify-center">
                <Check size={28} />
              </div>
              <h1 className="text-[32px] font-semibold tracking-[-0.025em] text-[#1a201c] dark:text-[#e8ece9] mb-2">
                You're all set
              </h1>
              <p className="text-[15px] text-[#5a625e] dark:text-[#a0a8a3] mb-8 max-w-[360px] mx-auto leading-relaxed">
                <strong className="text-[#1a201c] dark:text-[#e8ece9] font-medium">{name || "Your workspace"}</strong> is ready.
                {email.trim() && (
                  <> We sent an invite to{" "}
                    <strong className="text-[#1a201c] dark:text-[#e8ece9] font-medium">{email}</strong>.
                  </>
                )}
              </p>
              <button
                onClick={() => navigate(`/workspace/${workspaceId}`)}
                className="inline-flex items-center gap-2 h-11 px-6 rounded-lg bg-[#5a8a6b] hover:bg-[#4f7a5e] text-white text-[14px] font-medium transition-colors"
              >
                Open workspace <ArrowRight size={15} />
              </button>
              <p className="mt-8 text-[13px] text-[#858c87] dark:text-[#6e7672]">
                Need to invite more people?{" "}
                <button className="text-[#5a8a6b] hover:underline">Add team members</button>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
