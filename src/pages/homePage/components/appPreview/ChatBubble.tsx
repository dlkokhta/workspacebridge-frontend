import { Download, FileText } from "lucide-react";

interface BubbleProps {
  side: "me" | "them";
  mark: string;
  color: string;
  time?: string;
  content?: string;
  attachment?: { name: string; meta: string };
}

export const ChatBubble = ({
  side,
  mark,
  color,
  time,
  content,
  attachment,
}: BubbleProps) => {
  const isMe = side === "me";
  return (
    <div className={`flex gap-2.5 items-start ${isMe ? "flex-row-reverse" : ""}`}>
      <span
        className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-medium text-white shrink-0"
        style={{ background: color }}
      >
        {mark}
      </span>
      <div
        className={`max-w-[70%] flex flex-col gap-1 ${
          isMe ? "items-end" : "items-start"
        }`}
      >
        {time && (
          <div className="text-[11px] text-[#858c87] dark:text-[#6e7672]">
            {time}
          </div>
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
              <div className="text-[12px] font-medium text-[#1a201c] dark:text-[#e8ece9] truncate">
                {attachment.name}
              </div>
              <div className="text-[11px] text-[#858c87] dark:text-[#6e7672]">
                {attachment.meta}
              </div>
            </div>
            <Download size={13} className="text-[#a0a8a3] shrink-0" />
          </div>
        )}
      </div>
    </div>
  );
};

export const DayDivider = ({ label }: { label: string }) => (
  <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.08em] text-[#858c87] dark:text-[#6e7672] my-1">
    <div className="flex-1 h-px bg-black/[0.05] dark:bg-white/[0.05]" />
    {label}
    <div className="flex-1 h-px bg-black/[0.05] dark:bg-white/[0.05]" />
  </div>
);
