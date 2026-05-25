import { Moon, Sun } from "lucide-react";

interface InviteHeaderProps {
  theme: "light" | "dark";
  onToggleTheme: () => void;
}

export const InviteHeader = ({ theme, onToggleTheme }: InviteHeaderProps) => (
  <header className="flex items-center justify-between px-8 py-5 border-b border-black/[0.06] dark:border-white/[0.05]">
    <div className="flex items-center gap-2 text-[14px] font-semibold tracking-[-0.02em] text-[#1a201c] dark:text-[#e8ece9]">
      <span className="w-[22px] h-[22px] rounded-[6px] bg-[#5a8a6b] text-white flex items-center justify-center">
        <svg
          width="13"
          height="13"
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
    <button
      onClick={onToggleTheme}
      className="w-8 h-8 flex items-center justify-center rounded-lg border border-black/[0.08] dark:border-white/[0.07] bg-white dark:bg-[#1c221e] text-[#5a625e] dark:text-[#a0a8a3] hover:bg-[#f6f6f1] dark:hover:bg-[#222b26] transition-colors cursor-pointer"
      aria-label="Toggle theme"
    >
      {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
    </button>
  </header>
);
