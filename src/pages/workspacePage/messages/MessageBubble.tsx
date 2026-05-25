import type { Message } from "../types";
import { formatTime, getSenderInitials, getSenderName } from "./utils";

interface MessageBubbleProps {
  message: Message;
  isMe: boolean;
  showMeta: boolean;
  currentUserInitials: string;
}

export const MessageBubble = ({
  message,
  isMe,
  showMeta,
  currentUserInitials,
}: MessageBubbleProps) => (
  <div className={`flex gap-3 items-end ${isMe ? "flex-row-reverse" : ""}`}>
    <span
      className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-semibold text-white shrink-0"
      style={{ background: isMe ? "#5a8a6b" : "#7a9bbf" }}
    >
      {isMe ? currentUserInitials : getSenderInitials(message)}
    </span>

    <div
      className={`max-w-[62%] flex flex-col gap-1 ${
        isMe ? "items-end" : "items-start"
      }`}
    >
      {showMeta && (
        <div className="flex gap-2 text-[11px] text-[#858c87] dark:text-[#6e7672]">
          {!isMe && (
            <span className="font-medium text-[#5a625e] dark:text-[#a0a8a3]">
              {getSenderName(message)}
            </span>
          )}
          <span>{formatTime(message.createdAt)}</span>
        </div>
      )}

      <div
        className={`px-3.5 py-2.5 text-[14px] leading-relaxed ${
          isMe
            ? "text-white"
            : "text-[#1a201c] dark:text-[#e8ece9] bg-white dark:bg-[#151a17] border border-black/[0.07] dark:border-white/[0.06]"
        }`}
        style={{
          background: isMe ? "#5a8a6b" : undefined,
          borderRadius: 14,
          borderTopRightRadius: isMe ? 4 : 14,
          borderTopLeftRadius: isMe ? 14 : 4,
        }}
      >
        {message.content}
      </div>
    </div>
  </div>
);
