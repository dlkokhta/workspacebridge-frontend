import { useNavigate } from "react-router-dom";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "../../../context/ThemeContext";
import { LogoIcon } from "../../../components/LogoIcon";

export const Navbar = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50 border-b border-black/[0.06] dark:border-white/[0.07] bg-[#fafaf7]/90 dark:bg-[#0e1310]/90 backdrop-blur-md">
      <div className="max-w-[1200px] mx-auto px-8 h-14 flex items-center justify-between">
        <a href="/" className="flex items-center gap-2 text-[#1a201c] dark:text-[#e8ece9] no-underline">
          <span className="w-[22px] h-[22px] rounded-[6px] bg-[#5a8a6b] text-white flex items-center justify-center shrink-0">
            <LogoIcon size={12} />
          </span>
          <span className="font-semibold text-sm tracking-tight">WorkspaceBridge</span>
        </a>

        <nav className="hidden md:flex items-center gap-6">
          {(["Features", "How it works", "Pricing"] as const).map((label, i) => (
            <a
              key={label}
              href={["#features", "#how", "#pricing"][i]}
              className="text-sm text-[#a0a8a3] dark:text-[#6e7672] hover:text-[#1a201c] dark:hover:text-[#e8ece9] transition-colors no-underline"
            >
              {label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-1.5">
          <button
            onClick={toggleTheme}
            className="w-8 h-8 flex items-center justify-center rounded-md text-[#a0a8a3] hover:bg-black/5 dark:hover:bg-white/[0.07] hover:text-[#1a201c] dark:hover:text-[#e8ece9] transition-colors"
          >
            {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
          </button>
          <button
            onClick={() => navigate("/login")}
            className="h-8 px-3 text-xs font-medium text-[#5a625e] dark:text-[#a0a8a3] hover:bg-black/5 dark:hover:bg-white/[0.07] hover:text-[#1a201c] dark:hover:text-[#e8ece9] rounded-md transition-colors"
          >
            Sign in
          </button>
          <button
            onClick={() => navigate("/register")}
            className="h-8 px-3 text-xs font-medium text-white bg-[#5a8a6b] hover:bg-[#4f7a5e] rounded-md transition-colors"
          >
            Get started
          </button>
        </div>
      </div>
    </header>
  );
};
