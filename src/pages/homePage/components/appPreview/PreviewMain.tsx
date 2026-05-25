import {
  FileText,
  Link2,
  MessageCircle,
  Paperclip,
  Pencil,
  Send,
  Smile,
  Users,
} from "lucide-react";
import { ChatBubble, DayDivider } from "./ChatBubble";

const TABS = [
  { label: "Messages", icon: MessageCircle, count: 3, active: true },
  { label: "Files", icon: FileText, count: 12 },
  { label: "Whiteboard", icon: Pencil },
  { label: "Links", icon: Link2, count: 2 },
];

export const PreviewMain = () => (
  <div className="flex flex-col min-w-0 bg-[#fafaf7] dark:bg-[#0e1310]">
    {/* Workspace header */}
    <div className="flex items-center justify-between px-5 py-3 border-b border-black/[0.05] dark:border-white/[0.05]">
      <div>
        <div className="text-[14px] font-semibold text-[#1a201c] dark:text-[#e8ece9]">
          Kodex Labs
        </div>
        <div className="text-[11px] text-[#858c87] dark:text-[#6e7672]">
          Web app development · Q3 2026
        </div>
      </div>
      <div className="flex gap-1.5">
        <button className="h-7 px-2.5 flex items-center gap-1.5 text-[12px] text-[#5a625e] dark:text-[#a0a8a3] border border-black/[0.08] dark:border-white/[0.07] rounded-md bg-white dark:bg-[#151a17] cursor-pointer">
          <Users size={12} /> 2
        </button>
        <button className="h-7 px-2.5 flex items-center gap-1.5 text-[12px] text-[#5a625e] dark:text-[#a0a8a3] border border-black/[0.08] dark:border-white/[0.07] rounded-md bg-white dark:bg-[#151a17] cursor-pointer">
          <Link2 size={12} /> Share
        </button>
      </div>
    </div>

    {/* Tabs */}
    <div className="flex gap-1 border-b border-black/[0.06] dark:border-white/[0.05] px-5 bg-white dark:bg-[#151a17]">
      {TABS.map((tab) => (
        <div
          key={tab.label}
          className={`flex items-center gap-1.5 px-3 py-3 text-[12px] font-medium border-b-2 -mb-px ${
            tab.active
              ? "text-[#1a201c] dark:text-[#e8ece9] border-[#5a8a6b]"
              : "text-[#858c87] dark:text-[#6e7672] border-transparent"
          }`}
        >
          <tab.icon size={13} />
          {tab.label}
          {tab.count != null && (
            <span className="text-[10px] bg-[#f3f3ee] dark:bg-[#1c221e] text-[#858c87] dark:text-[#6e7672] px-1.5 py-0.5 rounded-full">
              {tab.count}
            </span>
          )}
        </div>
      ))}
    </div>

    {/* Chat */}
    <div className="flex-1 p-5 overflow-y-auto flex flex-col gap-3.5">
      <DayDivider label="Today" />
      <ChatBubble
        side="them"
        mark="SO"
        color="#7a9bbf"
        time="9:42 AM"
        content="Just reviewed the dashboard screens — everything looks solid. Could we add a filter by date range on the analytics page? The client keeps asking for it."
      />
      <ChatBubble
        side="them"
        mark="SO"
        color="#7a9bbf"
        content="Also uploaded the updated API spec in Files — check the endpoints tab."
      />
      <ChatBubble
        side="me"
        mark="MK"
        color="#5a8a6b"
        time="10:08 AM"
        content="On it! I'll wire up the date range filter today. Will push a staging build with three layout options within the hour."
      />
      <ChatBubble
        side="me"
        mark="MK"
        color="#5a8a6b"
        attachment={{ name: "dashboard-v3-filter.zip", meta: "3.2 MB · Build archive" }}
      />
      <ChatBubble
        side="them"
        mark="SO"
        color="#7a9bbf"
        time="10:31 AM"
        content="Option B looks great. I've added the staging URL in the shared links tab — let's lock this and move to the notifications module."
      />
    </div>

    {/* Composer */}
    <div className="px-5 pb-4 pt-3 border-t border-black/[0.05] dark:border-white/[0.05]">
      <div className="flex items-center gap-2 px-2.5 py-2 bg-white dark:bg-[#151a17] border border-black/[0.08] dark:border-white/[0.07] rounded-lg">
        <Paperclip size={14} className="text-[#a0a8a3]" />
        <span className="text-[12px] text-[#b5bbb7] dark:text-[#4a514d] flex-1">
          Reply to Sara…
        </span>
        <Smile size={14} className="text-[#a0a8a3]" />
        <button className="w-7 h-7 flex items-center justify-center bg-[#5a8a6b] text-white rounded-md cursor-pointer">
          <Send size={12} />
        </button>
      </div>
    </div>
  </div>
);
