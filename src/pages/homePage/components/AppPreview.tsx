import { Users, Link2, MessageCircle, FileText, Pencil, Paperclip, Smile, Send, Download } from "lucide-react";
import { LogoIcon } from "../../../components/LogoIcon";
import { Search } from "lucide-react";

const DayDivider = ({ label }: { label: string }) => (
  <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.08em] text-[#858c87] dark:text-[#6e7672] my-1">
    <div className="flex-1 h-px bg-black/[0.05] dark:bg-white/[0.05]" />
    {label}
    <div className="flex-1 h-px bg-black/[0.05] dark:bg-white/[0.05]" />
  </div>
);

interface BubbleProps {
  side: "me" | "them";
  mark: string;
  color: string;
  time?: string;
  content?: string;
  attachment?: { name: string; meta: string };
}

const ChatBubble = ({ side, mark, color, time, content, attachment }: BubbleProps) => {
  const isMe = side === "me";
  return (
    <div className={`flex gap-2.5 items-start ${isMe ? "flex-row-reverse" : ""}`}>
      <span
        className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-medium text-white shrink-0"
        style={{ background: color }}
      >
        {mark}
      </span>
      <div className={`max-w-[70%] flex flex-col gap-1 ${isMe ? "items-end" : "items-start"}`}>
        {time && (
          <div className="text-[11px] text-[#858c87] dark:text-[#6e7672]">{time}</div>
        )}
        {content && (
          <div
            className={`px-3.5 py-2.5 rounded-[14px] text-[12px] leading-[1.5] ${
              isMe
                ? "bg-[#5a8a6b] text-white rounded-tr-[4px]"
                : "bg-[#f3f3ee] dark:bg-[#1c221e] text-[#1a201c] dark:text-[#e8ece9] border border-black/[0.06] dark:border-white/[0.07] rounded-tl-[4px]"
            }`}
          >
            {content}
          </div>
        )}
        {attachment && (
          <div className="flex items-center gap-2.5 min-w-[220px] bg-white dark:bg-[#1c221e] border border-black/[0.08] dark:border-white/[0.07] rounded-xl p-2.5">
            <div className="w-8 h-8 rounded-[6px] bg-[rgba(90,138,107,0.12)] text-[#5a8a6b] flex items-center justify-center shrink-0">
              <FileText size={14} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[12px] font-medium text-[#1a201c] dark:text-[#e8ece9] truncate">{attachment.name}</div>
              <div className="text-[11px] text-[#858c87] dark:text-[#6e7672]">{attachment.meta}</div>
            </div>
            <Download size={13} className="text-[#a0a8a3] shrink-0" />
          </div>
        )}
      </div>
    </div>
  );
};

export const AppPreview = () => (
  <section id="preview" className="pb-24 px-8">
    <div className="max-w-[1200px] mx-auto">
      <div className="rounded-2xl overflow-hidden border border-black/[0.08] dark:border-white/[0.07] bg-white dark:bg-[#151a17]">
        {/* Browser bar */}
        <div className="flex items-center gap-2 px-4 py-3 bg-[#f3f3ee] dark:bg-[#1c221e] border-b border-black/[0.06] dark:border-white/[0.05]">
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <span key={i} className="w-[11px] h-[11px] rounded-full bg-black/[0.14] dark:bg-white/[0.14]" />
            ))}
          </div>
          <div className="flex-1 h-7 bg-[#fafaf7] dark:bg-[#0e1310] rounded-md flex items-center justify-center text-[11px] text-[#858c87] dark:text-[#6e7672] font-mono">
            workspacebridge.app/w/northwind-studio
          </div>
          <div className="w-8" />
        </div>

        <div className="grid grid-cols-[220px_1fr]" style={{ height: 520 }}>
          {/* Sidebar */}
          <div className="bg-[#f3f3ee] dark:bg-[#0a0f0c] border-r border-black/[0.06] dark:border-white/[0.05] flex flex-col">
            <div className="px-3 py-3 flex items-center gap-2">
              <span className="w-5 h-5 rounded-[5px] bg-[#5a8a6b] text-white flex items-center justify-center shrink-0">
                <LogoIcon size={11} />
              </span>
              <span className="text-[13px] font-semibold text-[#1a201c] dark:text-[#e8ece9] tracking-tight">WorkspaceBridge</span>
            </div>
            <div className="px-2.5 pb-1">
              <div className="flex items-center gap-2 px-2.5 py-2 bg-white dark:bg-[#151a17] border border-black/[0.08] dark:border-white/[0.07] rounded-lg text-[#858c87] dark:text-[#6e7672] text-[12px]">
                <Search size={12} />
                <span>Search workspaces</span>
              </div>
            </div>
            <div className="px-3 py-1.5 text-[10px] uppercase tracking-[0.08em] text-[#858c87] dark:text-[#6e7672] font-medium">
              Workspaces
            </div>
            <div className="flex flex-col gap-0.5 px-2 flex-1">
              {[
                { name: "Kodex Labs", sub: "Web app development", mark: "K", color: "#7a9bbf", active: true },
                { name: "Northwind Studio", sub: "Brand identity", mark: "N", color: "#5a8a6b" },
                { name: "Fold Coffee", sub: "Brand refresh", mark: "F", color: "#b5803a" },
                { name: "Atlas Logistics", sub: "Mobile concepts", mark: "A", color: "#9a7ab8" },
              ].map((w) => (
                <div
                  key={w.name}
                  className={`flex items-center gap-2.5 px-2.5 py-2 rounded-md text-[12px] ${
                    w.active
                      ? "bg-[rgba(90,138,107,0.12)] text-[#1a201c] dark:text-[#e8ece9]"
                      : "text-[#5a625e] dark:text-[#a0a8a3]"
                  }`}
                >
                  <span
                    className="w-5 h-5 rounded-[5px] text-white flex items-center justify-center text-[9px] font-semibold shrink-0"
                    style={{ background: w.color }}
                  >
                    {w.mark}
                  </span>
                  <span className="flex flex-col min-w-0">
                    <span className="font-medium truncate">{w.name}</span>
                    <span className="text-[10px] text-[#858c87] dark:text-[#6e7672] truncate">{w.sub}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Main */}
          <div className="flex flex-col min-w-0 bg-[#fafaf7] dark:bg-[#0e1310]">
            <div className="flex items-center justify-between px-5 py-3 border-b border-black/[0.05] dark:border-white/[0.05]">
              <div>
                <div className="text-[14px] font-semibold text-[#1a201c] dark:text-[#e8ece9]">Kodex Labs</div>
                <div className="text-[11px] text-[#858c87] dark:text-[#6e7672]">Web app development · Q3 2026</div>
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
              {[
                { label: "Messages", icon: MessageCircle, count: 3, active: true },
                { label: "Files", icon: FileText, count: 12 },
                { label: "Whiteboard", icon: Pencil },
                { label: "Links", icon: Link2, count: 2 },
              ].map((tab) => (
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
              <ChatBubble side="them" mark="SO" color="#7a9bbf" time="9:42 AM"
                content="Just reviewed the dashboard screens — everything looks solid. Could we add a filter by date range on the analytics page? The client keeps asking for it." />
              <ChatBubble side="them" mark="SO" color="#7a9bbf"
                content="Also uploaded the updated API spec in Files — check the endpoints tab." />
              <ChatBubble side="me" mark="MK" color="#5a8a6b" time="10:08 AM"
                content="On it! I'll wire up the date range filter today. Will push a staging build with three layout options within the hour." />
              <ChatBubble side="me" mark="MK" color="#5a8a6b"
                attachment={{ name: "dashboard-v3-filter.zip", meta: "3.2 MB · Build archive" }} />
              <ChatBubble side="them" mark="SO" color="#7a9bbf" time="10:31 AM"
                content="Option B looks great. I've added the staging URL in the shared links tab — let's lock this and move to the notifications module." />
            </div>

            {/* Composer */}
            <div className="px-5 pb-4 pt-3 border-t border-black/[0.05] dark:border-white/[0.05]">
              <div className="flex items-center gap-2 px-2.5 py-2 bg-white dark:bg-[#151a17] border border-black/[0.08] dark:border-white/[0.07] rounded-lg">
                <Paperclip size={14} className="text-[#a0a8a3]" />
                <span className="text-[12px] text-[#b5bbb7] dark:text-[#4a514d] flex-1">Reply to Sara…</span>
                <Smile size={14} className="text-[#a0a8a3]" />
                <button className="w-7 h-7 flex items-center justify-center bg-[#5a8a6b] text-white rounded-md cursor-pointer">
                  <Send size={12} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);
