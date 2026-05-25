import { Link } from "react-router-dom";
import { Moon, Sun } from "lucide-react";

interface AuthHeaderProps {
  theme: "light" | "dark";
  onToggleTheme: () => void;
}

export const AuthHeader = ({ theme, onToggleTheme }: AuthHeaderProps) => (
  <div className="flex items-center justify-between mb-12">
    <Link
      to="/"
      className="flex items-center gap-2 text-[15px] font-semibold tracking-[-0.02em] text-[#1a201c] dark:text-[#e8ece9]"
    >
      <span className="w-[26px] h-[26px] rounded-[7px] bg-[#5a8a6b] text-white flex items-center justify-center">
        <svg
          width="14"
          height="14"
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
    </Link>
    <button
      type="button"
      onClick={onToggleTheme}
      className="w-8 h-8 flex items-center justify-center rounded-lg text-[#858c87] dark:text-[#6e7672] hover:bg-black/[0.05] dark:hover:bg-white/[0.05] transition-colors cursor-pointer"
      aria-label="Toggle theme"
    >
      {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
    </button>
  </div>
);
