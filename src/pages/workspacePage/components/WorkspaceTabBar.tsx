import { CheckSquare, File, Link as LinkIcon, Lock, MessageCircle, Pencil, Settings, X } from "lucide-react";
import type { Tab, WorkspaceMember } from "../types";

const TABS: { id: Tab; label: string; icon: React.ReactNode; count?: number }[] = [
  { id: "messages", label: "Messages", icon: <MessageCircle size={14} /> },
  { id: "files", label: "Files", icon: <File size={14} /> },
  { id: "whiteboard", label: "Whiteboard", icon: <Pencil size={14} /> },
  { id: "shared-links", label: "Shared Links", icon: <LinkIcon size={14} /> },
  { id: "todos", label: "Shared Tasks", icon: <CheckSquare size={14} /> },
  { id: "my-tasks", label: "My Tasks", icon: <Lock size={14} /> },
  { id: "settings", label: "Settings", icon: <Settings size={14} /> },
];

interface WorkspaceTabBarProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  messagesUnread: number;
  filesHasNew: boolean;
  clients: WorkspaceMember[];
  onRemoveClient: (member: WorkspaceMember) => void;
}

export const WorkspaceTabBar = ({
  activeTab,
  onTabChange,
  messagesUnread,
  filesHasNew,
  clients,
  onRemoveClient,
}: WorkspaceTabBarProps) => (
  <div className="flex items-center border-b border-black/[0.06] dark:border-white/[0.05] bg-[#fafaf7] dark:bg-[#0e1310] px-6 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
    {TABS.map((t) => {
      const count = t.id === "messages" ? messagesUnread : t.count;
      return (
      <button
        key={t.id}
        onClick={() => onTabChange(t.id)}
        className={`flex items-center gap-1.5 h-11 px-1 mr-5 shrink-0 text-[13px] font-medium border-b-2 transition-colors cursor-pointer ${
          activeTab === t.id
            ? "border-[#5a8a6b] text-[#1a201c] dark:text-[#e8ece9]"
            : "border-transparent text-[#5a625e] dark:text-[#a0a8a3] hover:text-[#1a201c] dark:hover:text-[#e8ece9]"
        }`}
      >
        {t.icon}
        {t.label}
        {count != null && count > 0 && (
          <span
            className={`text-[11px] px-1.5 py-0.5 rounded-full font-medium ${
              activeTab === t.id
                ? "bg-[#5a8a6b]/10 text-[#5a8a6b]"
                : "bg-black/[0.06] dark:bg-white/[0.06] text-[#858c87] dark:text-[#6e7672]"
            }`}
          >
            {count}
          </span>
        )}
        {t.id === "files" && filesHasNew && (
          <span className="w-1.5 h-1.5 rounded-full bg-[#5a8a6b]" />
        )}
      </button>
      );
    })}
    {clients.map((m) => (
      <div key={m.id} className="relative group ml-1">
        {m.user.picture ? (
          <img
            src={m.user.picture}
            alt={m.user.email}
            className="w-7 h-7 rounded-full object-cover"
            title={m.user.email}
          />
        ) : (
          <div
            className="w-7 h-7 rounded-full bg-[#7a9bbf] text-white flex items-center justify-center text-[10px] font-semibold cursor-default"
            title={m.user.email}
          >
            {m.user.firstname ? m.user.firstname[0].toUpperCase() : m.user.email[0].toUpperCase()}
          </div>
        )}
        <button
          onClick={() => onRemoveClient(m)}
          className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#c25a4a] text-white hidden group-hover:flex items-center justify-center cursor-pointer"
          title="Remove client"
        >
          <X size={9} />
        </button>
      </div>
    ))}
  </div>
);
