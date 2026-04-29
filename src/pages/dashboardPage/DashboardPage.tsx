import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Bell, LogOut, Moon, Plus, Search, Settings, Sun } from "lucide-react";
import { axiosInstance, useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

interface UserProfile {
  id: string;
  firstname: string | null;
  lastname: string | null;
  email: string;
  picture: string | null;
}

interface Workspace {
  id: string;
  name: string;
  description: string | null;
  color: string;
  status: "ACTIVE" | "COMPLETED" | "ARCHIVED";
  createdAt: string;
}

const STATUS_LABEL: Record<Workspace["status"], string> = {
  ACTIVE: "Active",
  COMPLETED: "Completed",
  ARCHIVED: "Archived",
};

const STATUS_STYLE: Record<Workspace["status"], string> = {
  ACTIVE: "bg-[#5a8a6b]/10 text-[#3e6a4d] dark:text-[#6db383] border-[#5a8a6b]/30",
  COMPLETED: "bg-[#7a9bbf]/10 text-[#4a6a8a] dark:text-[#7a9bbf] border-[#7a9bbf]/30",
  ARCHIVED: "bg-black/[0.06] dark:bg-white/[0.05] text-[#858c87] dark:text-[#6e7672] border-black/[0.08] dark:border-white/[0.07]",
};

export const DashboardPage = () => {
  const navigate = useNavigate();
  const { setAccessToken } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [profileRes, wsRes] = await Promise.all([
          axiosInstance.get<UserProfile>("/user/me"),
          axiosInstance.get<Workspace[]>("/workspace"),
        ]);
        setProfile(profileRes.data);
        setWorkspaces(wsRes.data);
      } catch {
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await axiosInstance.post("/auth/logout");
    } catch {
      // ignore
    } finally {
      setAccessToken(null);
      navigate("/login");
    }
  };

  const getInitials = () => {
    if (profile?.firstname && profile?.lastname) return `${profile.firstname[0]}${profile.lastname[0]}`.toUpperCase();
    if (profile?.firstname) return profile.firstname[0].toUpperCase();
    if (profile?.email) return profile.email[0].toUpperCase();
    return "?";
  };

  const activeCount = workspaces.filter((w) => w.status === "ACTIVE").length;
  const completedCount = workspaces.filter((w) => w.status === "COMPLETED").length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fafaf7] dark:bg-[#0e1310]">
        <p className="text-[#5a625e] dark:text-[#a0a8a3] text-sm">Loading…</p>
      </div>
    );
  }

  return (
    <div className="h-screen grid grid-cols-1 lg:grid-cols-[248px_1fr] bg-[#fafaf7] dark:bg-[#0e1310] overflow-hidden">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col bg-[#f3f3ee] dark:bg-[#0a0f0c] border-r border-black/[0.06] dark:border-white/[0.05] overflow-hidden">
        <div className="flex items-center justify-between px-4 pt-[18px] pb-3">
          <Link to="/dashboard" className="flex items-center gap-2 text-[14px] font-semibold tracking-[-0.02em] text-[#1a201c] dark:text-[#e8ece9]">
            <span className="w-[22px] h-[22px] rounded-[6px] bg-[#5a8a6b] text-white flex items-center justify-center">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </span>
            WorkspaceBridge
          </Link>
          <button className="w-7 h-7 flex items-center justify-center rounded-md text-[#858c87] dark:text-[#6e7672] hover:bg-black/[0.05] dark:hover:bg-white/[0.05] transition-colors" title="Search">
            <Search size={14} />
          </button>
        </div>

        <div className="px-3">
          <div className="flex items-center gap-2 px-2.5 py-2 bg-white dark:bg-[#151a17] border border-black/[0.08] dark:border-white/[0.07] rounded-lg text-[#858c87] dark:text-[#6e7672] text-[12px]">
            <Search size={13} />
            <span>Search workspaces</span>
            <span className="ml-auto font-mono text-[10px] text-[#b5bbb7] dark:text-[#4a514d]">⌘K</span>
          </div>
        </div>

        <div className="px-3 pt-2 pb-1 flex items-center justify-between">
          <div className="text-[11px] uppercase tracking-[0.08em] font-medium text-[#858c87] dark:text-[#6e7672]">Workspaces</div>
          <button onClick={() => navigate("/onboarding")} className="text-[#5a625e] dark:text-[#a0a8a3] hover:text-[#1a201c] dark:hover:text-[#e8ece9]" title="New workspace">
            <Plus size={14} />
          </button>
        </div>

        <div className="px-2 flex-1 overflow-y-auto">
          {workspaces.length === 0 && (
            <button onClick={() => navigate("/onboarding")} className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-[12px] text-[#5a8a6b] hover:bg-[#5a8a6b]/10 transition-colors">
              <Plus size={13} /> New workspace
            </button>
          )}
          {workspaces.map((w) => (
            <div
              key={w.id}
              onClick={() => navigate(`/workspace/${w.id}`)}
              className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg cursor-pointer text-[13px] text-[#5a625e] dark:text-[#a0a8a3] hover:bg-black/[0.04] dark:hover:bg-white/[0.04] hover:text-[#1a201c] dark:hover:text-[#e8ece9] transition-colors"
            >
              <span className="w-[22px] h-[22px] rounded-md flex items-center justify-center text-[10px] font-semibold text-white shrink-0" style={{ background: w.color }}>
                {w.name[0].toUpperCase()}
              </span>
              <span className="flex flex-col min-w-0 flex-1">
                <span className="font-medium truncate">{w.name}</span>
                {w.description && <span className="text-[11px] text-[#858c87] dark:text-[#6e7672] truncate">{w.description}</span>}
              </span>
            </div>
          ))}
        </div>

        <div className="px-3 py-3 border-t border-black/[0.06] dark:border-white/[0.05]">
          <Link
            to="/profile"
            className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] text-[#5a625e] dark:text-[#a0a8a3] hover:bg-black/[0.04] dark:hover:bg-white/[0.04] hover:text-[#1a201c] dark:hover:text-[#e8ece9] transition-colors mb-0.5"
          >
            <span className="w-[22px] h-[22px] rounded-md flex items-center justify-center bg-[#f3f3ee] dark:bg-[#1c221e] text-[#5a625e] dark:text-[#a0a8a3] shrink-0">
              <Settings size={12} />
            </span>
            <span className="font-medium">Settings</span>
          </Link>
          <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px]">
            <span className="w-[22px] h-[22px] rounded-full flex items-center justify-center bg-[#5a8a6b] text-white text-[10px] font-semibold shrink-0">
              {getInitials()}
            </span>
            <span className="flex flex-col min-w-0 flex-1">
              <span className="font-medium text-[#1a201c] dark:text-[#e8ece9] truncate">
                {profile?.firstname || profile?.lastname
                  ? `${profile?.firstname ?? ""} ${profile?.lastname ?? ""}`.trim()
                  : profile?.email}
              </span>
              <span className="text-[11px] text-[#858c87] dark:text-[#6e7672]">Free plan</span>
            </span>
            <button
              onClick={handleLogout}
              title="Sign out"
              className="shrink-0 w-[22px] h-[22px] flex items-center justify-center rounded-md text-[#858c87] dark:text-[#6e7672] hover:bg-black/[0.06] dark:hover:bg-white/[0.06] hover:text-[#c25a4a] dark:hover:text-[#e07b6b] transition-colors"
            >
              <LogOut size={13} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex flex-col overflow-hidden min-w-0">
        {/* Topbar */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-black/[0.06] dark:border-white/[0.05] bg-[#fafaf7] dark:bg-[#0e1310]">
          <div>
            <div className="text-[11px] uppercase tracking-[0.08em] font-medium text-[#858c87] dark:text-[#6e7672]">WorkspaceBridge</div>
            <div className="text-[16px] font-semibold mt-0.5 text-[#1a201c] dark:text-[#e8ece9]">Dashboard</div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("/onboarding")}
              className="h-8 px-3 inline-flex items-center gap-1.5 rounded-lg bg-[#5a8a6b] hover:bg-[#4f7a5e] text-white text-[12px] font-medium transition-colors"
            >
              <Plus size={13} />
              New workspace
            </button>
            <button
              onClick={toggleTheme}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-black/[0.08] dark:border-white/[0.07] bg-white dark:bg-[#1c221e] text-[#5a625e] dark:text-[#a0a8a3] hover:bg-[#f6f6f1] dark:hover:bg-[#222b26] transition-colors"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
            </button>
            <button
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-black/[0.08] dark:border-white/[0.07] bg-white dark:bg-[#1c221e] text-[#5a625e] dark:text-[#a0a8a3] hover:bg-[#f6f6f1] dark:hover:bg-[#222b26] transition-colors"
              aria-label="Notifications"
            >
              <Bell size={14} />
            </button>
            <div className="w-8 h-8 rounded-full bg-[#5a8a6b] text-white flex items-center justify-center text-[12px] font-medium">
              {getInitials()}
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { label: "Total workspaces", value: workspaces.length },
              { label: "Active", value: activeCount },
              { label: "Completed", value: completedCount },
            ].map((stat) => (
              <div key={stat.label} className="px-4 py-3.5 rounded-xl border border-black/[0.08] dark:border-white/[0.07] bg-white dark:bg-[#151a17]">
                <div className="text-[24px] font-semibold tracking-[-0.02em] text-[#1a201c] dark:text-[#e8ece9]">{stat.value}</div>
                <div className="text-[12px] text-[#858c87] dark:text-[#6e7672] mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Section header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[14px] font-semibold text-[#1a201c] dark:text-[#e8ece9]">All workspaces</h2>
          </div>

          {/* Empty state */}
          {workspaces.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-14 h-14 rounded-2xl bg-[#5a8a6b]/10 text-[#5a8a6b] flex items-center justify-center mb-4">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
              </div>
              <p className="text-[15px] font-medium text-[#1a201c] dark:text-[#e8ece9] mb-1">No workspaces yet</p>
              <p className="text-[13px] text-[#858c87] dark:text-[#6e7672] mb-5 max-w-[260px]">
                Create your first workspace to start collaborating with a client.
              </p>
              <button
                onClick={() => navigate("/onboarding")}
                className="h-9 px-4 inline-flex items-center gap-1.5 rounded-lg bg-[#5a8a6b] hover:bg-[#4f7a5e] text-white text-[13px] font-medium transition-colors"
              >
                <Plus size={14} />
                Create workspace
              </button>
            </div>
          )}

          {/* Workspace grid */}
          {workspaces.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {workspaces.map((w) => (
                <button
                  key={w.id}
                  onClick={() => navigate(`/workspace/${w.id}`)}
                  className="text-left rounded-xl border border-black/[0.08] dark:border-white/[0.07] bg-white dark:bg-[#151a17] overflow-hidden hover:border-black/[0.14] dark:hover:border-white/[0.14] hover:shadow-sm transition-all group"
                >
                  {/* Color bar */}
                  <div className="h-1.5 w-full" style={{ background: w.color }} />
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <span
                        className="w-9 h-9 rounded-lg flex items-center justify-center text-[14px] font-semibold text-white shrink-0"
                        style={{ background: w.color }}
                      >
                        {w.name[0].toUpperCase()}
                      </span>
                      <span className={`inline-flex items-center h-[20px] px-2 rounded-full border text-[10px] font-medium ${STATUS_STYLE[w.status]}`}>
                        {STATUS_LABEL[w.status]}
                      </span>
                    </div>
                    <div className="text-[14px] font-semibold text-[#1a201c] dark:text-[#e8ece9] group-hover:text-[#5a8a6b] transition-colors truncate mb-0.5">
                      {w.name}
                    </div>
                    {w.description ? (
                      <div className="text-[12px] text-[#858c87] dark:text-[#6e7672] truncate">{w.description}</div>
                    ) : (
                      <div className="text-[12px] text-[#b5bbb7] dark:text-[#4a514d]">No description</div>
                    )}
                    <div className="mt-3 pt-3 border-t border-black/[0.06] dark:border-white/[0.05] text-[11px] text-[#858c87] dark:text-[#6e7672]">
                      Created {new Date(w.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </div>
                  </div>
                </button>
              ))}

              {/* New workspace card */}
              <button
                onClick={() => navigate("/onboarding")}
                className="text-left rounded-xl border border-dashed border-black/[0.12] dark:border-white/[0.09] hover:border-[#5a8a6b]/50 hover:bg-[#5a8a6b]/[0.03] transition-all group min-h-[140px] flex flex-col items-center justify-center gap-2 p-4"
              >
                <div className="w-9 h-9 rounded-lg border-2 border-dashed border-black/[0.12] dark:border-white/[0.09] group-hover:border-[#5a8a6b]/50 flex items-center justify-center text-[#858c87] dark:text-[#6e7672] group-hover:text-[#5a8a6b] transition-colors">
                  <Plus size={16} />
                </div>
                <span className="text-[13px] font-medium text-[#858c87] dark:text-[#6e7672] group-hover:text-[#5a8a6b] transition-colors">
                  New workspace
                </span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
