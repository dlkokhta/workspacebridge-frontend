import { Bell, LogOut, Moon, Sun } from "lucide-react";
import type { UserProfile } from "../../../hooks/useCurrentUser";
import type { Workspace } from "../../../hooks/useWorkspaces";
import { getInitials } from "../../../utils/getInitials";

interface PortalHeaderProps {
  profile: UserProfile;
  workspace: Workspace | null;
  theme: "light" | "dark";
  onToggleTheme: () => void;
  onLogout: () => void;
}

export const PortalHeader = ({
  profile,
  workspace,
  theme,
  onToggleTheme,
  onLogout,
}: PortalHeaderProps) => {
  const initials = getInitials(profile);
  const displayName = profile.firstname
    ? `${profile.firstname} ${profile.lastname ?? ""}`.trim()
    : profile.email;

  return (
    <header className="flex items-center justify-between px-6 py-3.5 border-b border-black/[0.06] dark:border-white/[0.05] bg-[#fafaf7] dark:bg-[#0e1310] shrink-0">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-[13px] font-semibold tracking-[-0.02em] text-[#858c87] dark:text-[#6e7672]">
          <span className="w-[20px] h-[20px] rounded-[5px] bg-[#5a8a6b] text-white flex items-center justify-center">
            <svg
              width="11"
              height="11"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </span>
          WorkspaceBridge
        </div>
        {workspace && (
          <>
            <span className="text-[#d0d4d1] dark:text-[#2a342e]">/</span>
            <div className="flex items-center gap-2">
              <span
                className="w-[22px] h-[22px] rounded-md flex items-center justify-center text-[10px] font-semibold text-white shrink-0"
                style={{ background: workspace.color }}
              >
                {workspace.name[0].toUpperCase()}
              </span>
              <span className="text-[14px] font-semibold text-[#1a201c] dark:text-[#e8ece9]">
                {workspace.name}
              </span>
              {workspace.description && (
                <span className="text-[12px] text-[#858c87] dark:text-[#6e7672] hidden sm:block">
                  {workspace.description}
                </span>
              )}
            </div>
          </>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-black/[0.08] dark:border-white/[0.07] bg-white dark:bg-[#1c221e] text-[#5a625e] dark:text-[#a0a8a3] hover:bg-[#f6f6f1] dark:hover:bg-[#222b26] transition-colors cursor-pointer"
          aria-label="Notifications"
        >
          <Bell size={14} />
        </button>
        <button
          onClick={onToggleTheme}
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-black/[0.08] dark:border-white/[0.07] bg-white dark:bg-[#1c221e] text-[#5a625e] dark:text-[#a0a8a3] hover:bg-[#f6f6f1] dark:hover:bg-[#222b26] transition-colors cursor-pointer"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
        </button>
        <div className="flex items-center gap-2 pl-1 border-l border-black/[0.06] dark:border-white/[0.05] ml-1 cursor-pointer">
          <div className="w-7 h-7 rounded-full bg-[#7a9bbf] text-white flex items-center justify-center text-[11px] font-semibold">
            {initials}
          </div>
          <span className="text-[13px] text-[#5a625e] dark:text-[#a0a8a3] hidden sm:block truncate max-w-[120px]">
            {displayName}
          </span>
          <button
            onClick={onLogout}
            title="Sign out"
            className="w-7 h-7 flex items-center justify-center rounded-md text-[#858c87] dark:text-[#6e7672] hover:bg-black/[0.06] dark:hover:bg-white/[0.06] hover:text-[#c25a4a] dark:hover:text-[#e07b6b] transition-colors cursor-pointer"
          >
            <LogOut size={13} />
          </button>
        </div>
      </div>
    </header>
  );
};
