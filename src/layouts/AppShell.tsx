import { useEffect } from "react";
import { Outlet, useNavigate, Link } from "react-router-dom";
import { LayoutDashboard, LogOut, Plus, Search, Settings, ShieldCheck } from "lucide-react";
import { axiosInstance, useAuth } from "../context/AuthContext";
import { useCurrentUser, type UserProfile } from "../hooks/useCurrentUser";
import { useWorkspaces, type Workspace } from "../hooks/useWorkspaces";
import { SearchPalette } from "../components/search/SearchPalette";
import { useSearchPalette } from "../components/search/useSearchPalette";

export interface AppShellContext {
  profile: UserProfile | null;
  workspaces: Workspace[];
  refetchWorkspaces: () => Promise<void>;
}

export const AppShell = () => {
  const navigate = useNavigate();
  const { setAccessToken } = useAuth();
  const { open: searchOpen, setOpen: setSearchOpen, close: closeSearch } =
    useSearchPalette();

  const profileQuery = useCurrentUser();
  const workspacesQuery = useWorkspaces();

  const profile = profileQuery.data ?? null;
  const workspaces = workspacesQuery.data ?? [];
  const loading = profileQuery.isLoading || workspacesQuery.isLoading;

  // If either fetch fails after auth retries, the session is unrecoverable —
  // bounce to login.
  useEffect(() => {
    if (profileQuery.error || workspacesQuery.error) {
      navigate("/login");
    }
  }, [profileQuery.error, workspacesQuery.error, navigate]);

  const refetchWorkspaces = async () => {
    await workspacesQuery.refetch();
  };

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
    if (profile?.firstname && profile?.lastname)
      return `${profile.firstname[0]}${profile.lastname[0]}`.toUpperCase();
    if (profile?.firstname) return profile.firstname[0].toUpperCase();
    if (profile?.email) return profile.email[0].toUpperCase();
    return "?";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fafaf7] dark:bg-[#0e1310]">
        <p className="text-[#5a625e] dark:text-[#a0a8a3] text-sm">Loading…</p>
      </div>
    );
  }

  const context: AppShellContext = { profile, workspaces, refetchWorkspaces };

  return (
    <div className="h-screen grid grid-cols-1 lg:grid-cols-[248px_1fr] bg-[#fafaf7] dark:bg-[#0e1310] overflow-hidden">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col bg-[#f3f3ee] dark:bg-[#0a0f0c] border-r border-black/[0.06] dark:border-white/[0.05] overflow-hidden">
        {/* Logo */}
        <div className="flex items-center justify-between px-4 pt-[18px] pb-3">
          <Link
            to="/dashboard"
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
          <button
            onClick={() => setSearchOpen(true)}
            className="w-7 h-7 flex items-center justify-center rounded-md text-[#858c87] dark:text-[#6e7672] hover:bg-black/[0.05] dark:hover:bg-white/[0.05] transition-colors cursor-pointer"
            title="Search (⌘K)"
          >
            <Search size={14} />
          </button>
        </div>

        {/* Search bar */}
        <div className="px-3">
          <button
            onClick={() => setSearchOpen(true)}
            className="w-full flex items-center gap-2 px-2.5 py-2 bg-white dark:bg-[#151a17] border border-black/[0.08] dark:border-white/[0.07] rounded-lg text-[#858c87] dark:text-[#6e7672] text-[12px] hover:border-[#5a8a6b]/40 transition-colors cursor-pointer"
          >
            <Search size={13} />
            <span>Search everything</span>
            <span className="ml-auto font-mono text-[10px] text-[#b5bbb7] dark:text-[#4a514d]">⌘K</span>
          </button>
        </div>

        {/* Workspaces label */}
        <div className="px-3 pt-2 pb-1 flex items-center justify-between">
          <div className="text-[11px] uppercase tracking-[0.08em] font-medium text-[#858c87] dark:text-[#6e7672]">
            Workspaces
          </div>
          <button
            onClick={() => navigate("/onboarding")}
            className="text-[#5a625e] dark:text-[#a0a8a3] hover:text-[#1a201c] dark:hover:text-[#e8ece9] cursor-pointer"
            title="New workspace"
          >
            <Plus size={14} />
          </button>
        </div>

        {/* Workspace list */}
        <div className="px-2 flex-1 overflow-y-auto">
          {workspaces.length === 0 && (
            <button
              onClick={() => navigate("/onboarding")}
              className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-[12px] text-[#5a8a6b] hover:bg-[#5a8a6b]/10 transition-colors cursor-pointer"
            >
              <Plus size={13} /> New workspace
            </button>
          )}
          {workspaces.map((w) => (
            <div
              key={w.id}
              onClick={() => navigate(`/workspace/${w.id}`)}
              className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg cursor-pointer text-[13px] text-[#5a625e] dark:text-[#a0a8a3] hover:bg-black/[0.04] dark:hover:bg-white/[0.04] hover:text-[#1a201c] dark:hover:text-[#e8ece9] transition-colors"
            >
              <span
                className="w-[22px] h-[22px] rounded-md flex items-center justify-center text-[10px] font-semibold text-white shrink-0"
                style={{ background: w.color }}
              >
                {w.name[0].toUpperCase()}
              </span>
              <span className="flex flex-col min-w-0 flex-1">
                <span className="font-medium truncate">{w.name}</span>
                {w.description && (
                  <span className="text-[11px] text-[#858c87] dark:text-[#6e7672] truncate">
                    {w.description}
                  </span>
                )}
              </span>
            </div>
          ))}
        </div>

        {/* Bottom: settings + user */}
        <div className="px-3 py-3 border-t border-black/[0.06] dark:border-white/[0.05]">
          <Link
            to="/dashboard"
            className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] text-[#5a625e] dark:text-[#a0a8a3] hover:bg-black/[0.04] dark:hover:bg-white/[0.04] hover:text-[#1a201c] dark:hover:text-[#e8ece9] transition-colors mb-0.5"
          >
            <span className="w-[22px] h-[22px] rounded-md flex items-center justify-center bg-[#f3f3ee] dark:bg-[#1c221e] text-[#5a625e] dark:text-[#a0a8a3] shrink-0">
              <LayoutDashboard size={12} />
            </span>
            <span className="font-medium">Dashboard</span>
          </Link>
          <Link
            to="/settings"
            className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] text-[#5a625e] dark:text-[#a0a8a3] hover:bg-black/[0.04] dark:hover:bg-white/[0.04] hover:text-[#1a201c] dark:hover:text-[#e8ece9] transition-colors mb-0.5"
          >
            <span className="w-[22px] h-[22px] rounded-md flex items-center justify-center bg-[#f3f3ee] dark:bg-[#1c221e] text-[#5a625e] dark:text-[#a0a8a3] shrink-0">
              <Settings size={12} />
            </span>
            <span className="font-medium">Settings</span>
          </Link>
          {profile?.role === "ADMIN" && (
            <Link
              to="/adminPanel"
              className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] text-[#9b7abf] dark:text-[#b89adb] hover:bg-[#9b7abf]/5 transition-colors mb-0.5"
            >
              <span className="w-[22px] h-[22px] rounded-md flex items-center justify-center bg-[#9b7abf]/10 text-[#9b7abf] dark:text-[#b89adb] shrink-0">
                <ShieldCheck size={12} />
              </span>
              <span className="font-medium">Admin Panel</span>
            </Link>
          )}

          <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px]">
            {profile?.picture ? (
              <img
                src={profile.picture}
                alt="avatar"
                className="w-[22px] h-[22px] rounded-full object-cover shrink-0"
              />
            ) : (
              <span className="w-[22px] h-[22px] rounded-full flex items-center justify-center bg-[#5a8a6b] text-white text-[10px] font-semibold shrink-0">
                {getInitials()}
              </span>
            )}
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
              className="shrink-0 w-[22px] h-[22px] flex items-center justify-center rounded-md text-[#858c87] dark:text-[#6e7672] hover:bg-black/[0.06] dark:hover:bg-white/[0.06] hover:text-[#c25a4a] dark:hover:text-[#e07b6b] transition-colors cursor-pointer"
            >
              <LogOut size={13} />
            </button>
          </div>
        </div>
      </aside>

      {/* Child page renders here */}
      <Outlet context={context} />

      <SearchPalette open={searchOpen} onClose={closeSearch} />
    </div>
  );
};
