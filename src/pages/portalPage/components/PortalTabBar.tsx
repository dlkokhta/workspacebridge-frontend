import {
  CheckSquare,
  File,
  Link as LinkIcon,
  MessageCircle,
  Pencil,
} from "lucide-react";
import type { Tab } from "../types";

interface PortalTabBarProps {
  active: Tab;
  onChange: (tab: Tab) => void;
}

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "messages", label: "Messages", icon: <MessageCircle size={14} /> },
  { id: "files", label: "Files", icon: <File size={14} /> },
  { id: "whiteboard", label: "Whiteboard", icon: <Pencil size={14} /> },
  { id: "shared-links", label: "Shared Links", icon: <LinkIcon size={14} /> },
  { id: "shared-tasks", label: "Shared Tasks", icon: <CheckSquare size={14} /> },
];

export const PortalTabBar = ({ active, onChange }: PortalTabBarProps) => (
  <div className="flex items-center gap-1 px-6 border-b border-black/[0.06] dark:border-white/[0.05] bg-[#fafaf7] dark:bg-[#0e1310] shrink-0">
    {TABS.map((t) => (
      <button
        key={t.id}
        onClick={() => onChange(t.id)}
        className={`flex items-center gap-1.5 px-3 h-11 text-[13px] font-medium border-b-2 transition-colors cursor-pointer ${
          active === t.id
            ? "border-[#5a8a6b] text-[#1a201c] dark:text-[#e8ece9]"
            : "border-transparent text-[#5a625e] dark:text-[#a0a8a3] hover:text-[#1a201c] dark:hover:text-[#e8ece9]"
        }`}
      >
        {t.icon}
        {t.label}
      </button>
    ))}
  </div>
);
