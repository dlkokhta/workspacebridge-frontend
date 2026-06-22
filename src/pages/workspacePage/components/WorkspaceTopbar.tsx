import { Moon, Share2, Sun } from "lucide-react";
import { NotificationBell } from "../../../components/notifications/NotificationBell";

interface WorkspaceTopbarProps {
  workspaceName?: string;
  theme: string;
  onToggleTheme: () => void;
}

export const WorkspaceTopbar = ({
  workspaceName,
  theme,
  onToggleTheme,
}: WorkspaceTopbarProps) => (
  <header className="flex items-center justify-between px-6 py-4 border-b border-black/[0.06] dark:border-white/[0.05] bg-[#fafaf7] dark:bg-[#0e1310]">
    <div>
      <div className="text-[11px] uppercase tracking-[0.08em] font-medium text-[#858c87] dark:text-[#6e7672]">
        Workspace
      </div>
      <div className="text-[16px] font-semibold mt-0.5 text-[#1a201c] dark:text-[#e8ece9]">
        {workspaceName ?? "…"}
      </div>
    </div>
    <div className="flex items-center gap-2">
      <button className="h-8 px-3 inline-flex items-center gap-1.5 rounded-lg bg-white dark:bg-[#1c221e] border border-black/[0.08] dark:border-white/[0.07] text-[12px] font-medium text-[#5a625e] dark:text-[#a0a8a3] hover:bg-[#f6f6f1] dark:hover:bg-[#222b26] transition-colors cursor-pointer">
        <Share2 size={13} /> Share
      </button>
      <button
        onClick={onToggleTheme}
        className="w-8 h-8 flex items-center justify-center rounded-lg border border-black/[0.08] dark:border-white/[0.07] bg-white dark:bg-[#1c221e] text-[#5a625e] dark:text-[#a0a8a3] hover:bg-[#f6f6f1] dark:hover:bg-[#222b26] transition-colors cursor-pointer"
        aria-label="Toggle theme"
      >
        {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
      </button>
      <NotificationBell />
    </div>
  </header>
);
