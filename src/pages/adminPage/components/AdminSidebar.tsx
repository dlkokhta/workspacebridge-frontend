import { Link } from "react-router-dom";
import {
  BarChart3,
  Users,
  LayoutGrid,
  Mail,
  Monitor,
  FileText,
  ScrollText,
  Settings,
  Bug,
  AlertTriangle,
  ArrowLeft,
  LogOut,
  Moon,
  Sun,
} from "lucide-react";

export type AdminTab =
  | "overview"
  | "users"
  | "workspaces"
  | "invites"
  | "sessions"
  | "files"
  | "audit-log"
  | "bug-reports"
  | "error-logs"
  | "settings";

const TABS: { id: AdminTab; label: string; icon: React.ReactNode }[] = [
  { id: "overview", label: "Overview", icon: <BarChart3 size={14} /> },
  { id: "users", label: "Users", icon: <Users size={14} /> },
  { id: "workspaces", label: "Workspaces", icon: <LayoutGrid size={14} /> },
  { id: "invites", label: "Invites", icon: <Mail size={14} /> },
  { id: "sessions", label: "Sessions", icon: <Monitor size={14} /> },
  { id: "files", label: "Files", icon: <FileText size={14} /> },
  { id: "audit-log", label: "Audit Log", icon: <ScrollText size={14} /> },
  { id: "bug-reports", label: "Bug Reports", icon: <Bug size={14} /> },
  { id: "error-logs", label: "Error Logs", icon: <AlertTriangle size={14} /> },
  { id: "settings", label: "Settings", icon: <Settings size={14} /> },
];

interface AdminSidebarProps {
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
  theme: "light" | "dark";
  onToggleTheme: () => void;
  onLogout: () => void;
}

export const AdminSidebar = ({
  activeTab,
  onTabChange,
  theme,
  onToggleTheme,
  onLogout,
}: AdminSidebarProps) => (
  <aside className="hidden lg:flex flex-col w-[220px] shrink-0 bg-[#f3f3ee] dark:bg-[#0a0f0c] border-r border-black/[0.06] dark:border-white/[0.05] overflow-hidden">
    <div className="px-4 pt-[18px] pb-3">
      <div className="flex items-center gap-2 text-[14px] font-semibold tracking-[-0.02em] text-[#1a201c] dark:text-[#e8ece9]">
        <span className="w-[22px] h-[22px] rounded-[6px] bg-[#5a8a6b] text-white flex items-center justify-center">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
        </span>
        Admin
      </div>
    </div>

    <div className="px-2 flex-1 overflow-y-auto">
      <div className="px-1 pb-1 pt-1">
        <div className="text-[11px] uppercase tracking-[0.08em] font-medium text-[#858c87] dark:text-[#6e7672] px-2 mb-1">
          Navigation
        </div>
      </div>
      {TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] transition-colors cursor-pointer mb-0.5 ${
            activeTab === tab.id
              ? "bg-[#5a8a6b]/10 text-[#5a8a6b] dark:text-[#6db383] font-medium"
              : "text-[#5a625e] dark:text-[#a0a8a3] hover:bg-black/[0.04] dark:hover:bg-white/[0.04] hover:text-[#1a201c] dark:hover:text-[#e8ece9]"
          }`}
        >
          <span className="w-[22px] h-[22px] rounded-md flex items-center justify-center shrink-0">
            {tab.icon}
          </span>
          {tab.label}
        </button>
      ))}
    </div>

    <div className="px-3 py-3 border-t border-black/[0.06] dark:border-white/[0.05]">
      <Link
        to="/dashboard"
        className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] text-[#5a8a6b] dark:text-[#6db383] hover:bg-[#5a8a6b]/5 transition-colors mb-0.5"
      >
        <span className="w-[22px] h-[22px] rounded-md flex items-center justify-center shrink-0">
          <ArrowLeft size={14} />
        </span>
        Back to app
      </Link>
      <button
        onClick={onToggleTheme}
        className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] text-[#5a625e] dark:text-[#a0a8a3] hover:bg-black/[0.04] dark:hover:bg-white/[0.04] hover:text-[#1a201c] dark:hover:text-[#e8ece9] transition-colors cursor-pointer mb-0.5"
      >
        <span className="w-[22px] h-[22px] rounded-md flex items-center justify-center shrink-0">
          {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
        </span>
        {theme === "dark" ? "Light mode" : "Dark mode"}
      </button>
      <button
        onClick={onLogout}
        className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] text-[#c25a4a] dark:text-[#e07b6b] hover:bg-[#c25a4a]/5 transition-colors cursor-pointer"
      >
        <span className="w-[22px] h-[22px] rounded-md flex items-center justify-center shrink-0">
          <LogOut size={14} />
        </span>
        Sign out
      </button>
    </div>
  </aside>
);
