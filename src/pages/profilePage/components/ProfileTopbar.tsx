import { Bell, Menu, Moon, Sun } from "lucide-react";

interface ProfileTopbarProps {
  initials: string;
  theme: "light" | "dark";
  onToggleTheme: () => void;
  onOpenSidebar: () => void;
}

export const ProfileTopbar = ({
  initials,
  theme,
  onToggleTheme,
  onOpenSidebar,
}: ProfileTopbarProps) => (
  <header className="flex items-center justify-between px-6 py-4 border-b border-black/[0.06] dark:border-white/[0.05] bg-[#fafaf7] dark:bg-[#0e1310]">
    <div className="flex items-center gap-3 min-w-0">
      <button
        type="button"
        onClick={onOpenSidebar}
        className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg border border-black/[0.08] dark:border-white/[0.07] bg-white dark:bg-[#1c221e] text-[#5a625e] dark:text-[#a0a8a3] hover:bg-[#f6f6f1] dark:hover:bg-[#222b26] transition-colors cursor-pointer shrink-0"
        aria-label="Open menu"
      >
        <Menu size={16} />
      </button>
      <div className="min-w-0">
        <div className="text-[11px] uppercase tracking-[0.08em] font-medium text-[#858c87] dark:text-[#6e7672]">
          Account
        </div>
        <div className="text-[16px] font-semibold mt-0.5 text-[#1a201c] dark:text-[#e8ece9]">
          Settings
        </div>
      </div>
    </div>
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={onToggleTheme}
        className="w-8 h-8 flex items-center justify-center rounded-lg border border-black/[0.08] dark:border-white/[0.07] bg-white dark:bg-[#1c221e] text-[#5a625e] dark:text-[#a0a8a3] hover:bg-[#f6f6f1] dark:hover:bg-[#222b26] transition-colors cursor-pointer"
        aria-label="Toggle theme"
      >
        {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
      </button>
      <button
        className="w-8 h-8 flex items-center justify-center rounded-lg border border-black/[0.08] dark:border-white/[0.07] bg-white dark:bg-[#1c221e] text-[#5a625e] dark:text-[#a0a8a3] hover:bg-[#f6f6f1] dark:hover:bg-[#222b26] transition-colors cursor-pointer"
        aria-label="Notifications"
      >
        <Bell size={14} />
      </button>
      <div className="w-8 h-8 rounded-full bg-[#5a8a6b] text-white flex items-center justify-center text-[12px] font-medium">
        {initials}
      </div>
    </div>
  </header>
);
