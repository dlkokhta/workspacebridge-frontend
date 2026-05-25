import { Bell, CreditCard, Folder, Lock, Users } from "lucide-react";
import type { Section } from "../types";

interface ProfileSidebarProps {
  active: Section;
  onChange: (section: Section) => void;
}

const SECTIONS: { id: Section; label: string; icon: React.ReactNode }[] = [
  { id: "profile", label: "Profile", icon: <Users size={14} /> },
  { id: "workspace", label: "Workspace", icon: <Folder size={14} /> },
  { id: "notifications", label: "Notifications", icon: <Bell size={14} /> },
  { id: "billing", label: "Billing", icon: <CreditCard size={14} /> },
  { id: "security", label: "Security", icon: <Lock size={14} /> },
];

export const ProfileSidebar = ({ active, onChange }: ProfileSidebarProps) => (
  <nav className="border-b lg:border-b-0 lg:border-r border-black/[0.06] dark:border-white/[0.05] p-3 lg:p-5 flex lg:flex-col gap-1 overflow-x-auto">
    {SECTIONS.map((s) => (
      <button
        key={s.id}
        onClick={() => onChange(s.id)}
        className={`flex items-center gap-2 px-3 h-9 rounded-lg text-[13px] font-medium text-left whitespace-nowrap transition-colors cursor-pointer ${
          active === s.id
            ? "bg-[#5a8a6b]/10 text-[#1a201c] dark:text-[#e8ece9]"
            : "text-[#5a625e] dark:text-[#a0a8a3] hover:bg-black/[0.04] dark:hover:bg-white/[0.04]"
        }`}
      >
        {s.icon}
        {s.label}
      </button>
    ))}
  </nav>
);
