import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import { axiosInstance, useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { Moon, Sun } from "lucide-react";

interface InviteInfo {
  email: string | null;
  workspace: {
    id: string;
    name: string;
    color: string;
    description: string | null;
  };
}

type PageState = "loading" | "ready" | "invalid" | "accepting" | "done";

export const InvitePage = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { setAccessToken } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [pageState, setPageState] = useState<PageState>("loading");
  const [invite, setInvite] = useState<InviteInfo | null>(null);
  const [invalidMsg, setInvalidMsg] = useState("");

  const [clientEmail, setClientEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setInvalidMsg("Invalid invite link.");
      setPageState("invalid");
      return;
    }
    axiosInstance
      .get<InviteInfo>(`/invite/${token}`)
      .then((r) => {
        setInvite(r.data);
        setPageState("ready");
      })
      .catch((err) => {
        const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
        setInvalidMsg(msg ?? "This invite link is invalid or has expired.");
        setPageState("invalid");
      });
  }, [token]);

  const handleAccept = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setError(null);
    setPageState("accepting");
    try {
      const res = await axiosInstance.post<{
        accessToken: string;
        user: { id: string; email: string; role: string };
        workspaceId: string;
      }>(`/invite/${token}/accept`, {
        password,
        ...(invite?.email ? {} : { email: clientEmail }),
      });
      setAccessToken(res.data.accessToken);
      setPageState("done");
      setTimeout(() => navigate("/portal"), 800);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg ?? "Something went wrong. Please try again.");
      setPageState("ready");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fafaf7] dark:bg-[#0e1310]">
      <header className="flex items-center justify-between px-8 py-5 border-b border-black/[0.06] dark:border-white/[0.05]">
        <div className="flex items-center gap-2 text-[14px] font-semibold tracking-[-0.02em] text-[#1a201c] dark:text-[#e8ece9]">
          <span className="w-[22px] h-[22px] rounded-[6px] bg-[#5a8a6b] text-white flex items-center justify-center">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </span>
          WorkspaceBridge
        </div>
        <button
          onClick={toggleTheme}
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-black/[0.08] dark:border-white/[0.07] bg-white dark:bg-[#1c221e] text-[#5a625e] dark:text-[#a0a8a3] hover:bg-[#f6f6f1] dark:hover:bg-[#222b26] transition-colors"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
        </button>
      </header>

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-[440px]">

          {/* Loading */}
          {pageState === "loading" && (
            <p className="text-center text-[#858c87] dark:text-[#6e7672] text-[14px]">Checking invite…</p>
          )}

          {/* Invalid */}
          {pageState === "invalid" && (
            <div className="text-center">
              <div className="w-14 h-14 mx-auto mb-5 rounded-2xl bg-red-50 dark:bg-red-900/20 text-red-400 flex items-center justify-center">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
              </div>
              <h1 className="text-[24px] font-semibold tracking-[-0.02em] text-[#1a201c] dark:text-[#e8ece9] mb-2">Invite unavailable</h1>
              <p className="text-[14px] text-[#858c87] dark:text-[#6e7672] mb-6">{invalidMsg}</p>
              <button
                onClick={() => navigate("/login")}
                className="h-10 px-5 inline-flex items-center gap-2 rounded-lg bg-[#5a8a6b] hover:bg-[#4f7a5e] text-white text-[13px] font-medium transition-colors"
              >
                Go to login
              </button>
            </div>
          )}

          {/* Ready / Accepting */}
          {(pageState === "ready" || pageState === "accepting") && invite && (
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
                  <span className="text-[14px] font-semibold text-[#1a201c] dark:text-[#e8ece9] truncate">{invite.workspace.name}</span>
                  {invite.workspace.description && (
                    <span className="text-[12px] text-[#858c87] dark:text-[#6e7672] truncate">{invite.workspace.description}</span>
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
                {invite.email
                  ? <>You were invited as <strong className="text-[#1a201c] dark:text-[#e8ece9] font-medium">{invite.email}</strong>. Create a password to get started.</>
                  : "Create a password to get access to the workspace."}
              </p>

              <form onSubmit={handleAccept} className="space-y-3">
                {!invite.email && (
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
                    autoFocus
                    minLength={8}
                    required
                    className="w-full h-[42px] pl-3.5 pr-10 rounded-lg border border-black/[0.08] dark:border-white/[0.07] bg-white dark:bg-[#151a17] text-[14px] text-[#1a201c] dark:text-[#e8ece9] placeholder-[#858c87] dark:placeholder-[#6e7672] outline-none hover:border-black/[0.14] dark:hover:border-white/[0.14] focus:border-[#5a8a6b] focus:ring-2 focus:ring-[#5a8a6b]/20 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#858c87] dark:text-[#6e7672]"
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
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#858c87] dark:text-[#6e7672]"
                  >
                    {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>

                {error && <p className="text-[13px] text-red-500">{error}</p>}

                <button
                  type="submit"
                  disabled={pageState === "accepting" || !password || !confirm || (!invite.email && !clientEmail)}
                  className="w-full h-11 mt-2 flex items-center justify-center gap-2 rounded-lg bg-[#5a8a6b] hover:bg-[#4f7a5e] text-white text-[14px] font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {pageState === "accepting" ? "Joining…" : <> Join workspace <ArrowRight size={15} /> </>}
                </button>
              </form>

              <p className="mt-5 text-center text-[12px] text-[#858c87] dark:text-[#6e7672]">
                Already have an account?{" "}
                <button onClick={() => navigate("/login")} className="text-[#5a8a6b] hover:underline">Sign in</button>
              </p>
            </div>
          )}

          {/* Done */}
          {pageState === "done" && (
            <div className="text-center">
              <div className="w-14 h-14 mx-auto mb-5 rounded-2xl bg-[#5a8a6b]/10 text-[#5a8a6b] flex items-center justify-center">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h1 className="text-[24px] font-semibold tracking-[-0.02em] text-[#1a201c] dark:text-[#e8ece9] mb-2">You're in!</h1>
              <p className="text-[14px] text-[#858c87] dark:text-[#6e7672]">Redirecting to your workspace…</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
