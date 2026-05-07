import { useEffect, useRef, useState } from "react";
import { Download, File, Paperclip, Send, Smile } from "lucide-react";
import type { Message } from "../types";

const SEED_MESSAGES: Message[] = [
  { id: 1, side: "them", name: "Sara Olsson", mark: "SO", color: "#7a9bbf", time: "9:42 AM", content: "Just looked at the logo concepts — really excited about direction 2. Could we explore a slightly warmer green? The current one feels a bit clinical." },
  { id: 2, side: "them", name: "Sara Olsson", mark: "SO", color: "#7a9bbf", content: "Also dropped a few reference images in Files — under the moodboard tab." },
  { id: 3, side: "me", name: "MK", mark: "MK", color: "#5a8a6b", time: "10:08 AM", content: "Got it! Pulling some warmer sage tones now. Will send v3 with three variations within the hour." },
  { id: 4, side: "me", name: "MK", mark: "MK", color: "#5a8a6b", attachment: { name: "logo-v3-warm-tones.fig", meta: "14 MB · Figma file" } },
  { id: 5, side: "them", name: "Sara Olsson", mark: "SO", color: "#7a9bbf", time: "10:31 AM", content: "Love variant B. Marking it on the proposal — let's lock the palette and move to applications." },
  { id: 6, side: "me", name: "MK", mark: "MK", color: "#5a8a6b", time: "10:34 AM", content: "Perfect. I'll start the application explorations — typography, photography style, and the icon system. Should have a first pass by Thursday." },
];

const formatTime = (date: Date) => {
  const hours = date.getHours() % 12 || 12;
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const period = date.getHours() >= 12 ? "PM" : "AM";
  return `${hours}:${minutes} ${period}`;
};

interface MessagesTabProps {
  initials: string;
}

export const MessagesTab = ({ initials }: MessagesTabProps) => {
  const [messages, setMessages] = useState<Message[]>(SEED_MESSAGES);
  const [draft, setDraft] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const send = () => {
    if (!draft.trim()) return;
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        side: "me",
        name: initials,
        mark: initials,
        color: "#5a8a6b",
        time: formatTime(new Date()),
        content: draft.trim(),
      },
    ]);
    setDraft("");
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col flex-1 overflow-hidden min-h-0">
      <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-4">
        <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.08em] text-[#858c87] dark:text-[#6e7672]">
          <div className="flex-1 h-px bg-black/[0.06] dark:bg-white/[0.05]" />
          Today · Apr 26
          <div className="flex-1 h-px bg-black/[0.06] dark:bg-white/[0.05]" />
        </div>

        {messages.map((m) => {
          const isMe = m.side === "me";
          return (
            <div key={m.id} className={`flex gap-3 items-end ${isMe ? "flex-row-reverse" : ""}`}>
              <span
                className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-semibold text-white shrink-0"
                style={{ background: m.color }}
              >
                {m.mark}
              </span>
              <div className={`max-w-[62%] flex flex-col gap-1 ${isMe ? "items-end" : "items-start"}`}>
                {(m.name || m.time) && (
                  <div className="flex gap-2 text-[11px] text-[#858c87] dark:text-[#6e7672]">
                    {!isMe && m.name && (
                      <span className="font-medium text-[#5a625e] dark:text-[#a0a8a3]">{m.name}</span>
                    )}
                    {m.time && <span>{m.time}</span>}
                  </div>
                )}
                {m.content && (
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
                    {m.content}
                  </div>
                )}
                {m.attachment && (
                  <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-black/[0.08] dark:border-white/[0.07] bg-white dark:bg-[#151a17] min-w-[280px]">
                    <div className="w-9 h-9 rounded-lg bg-[#5a8a6b]/10 text-[#5a8a6b] flex items-center justify-center shrink-0">
                      <File size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-medium text-[#1a201c] dark:text-[#e8ece9] truncate">
                        {m.attachment.name}
                      </div>
                      <div className="text-[11px] text-[#858c87] dark:text-[#6e7672]">{m.attachment.meta}</div>
                    </div>
                    <button className="w-7 h-7 flex items-center justify-center rounded-md text-[#858c87] dark:text-[#6e7672] hover:bg-black/[0.05] dark:hover:bg-white/[0.05] cursor-pointer">
                      <Download size={14} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <div className="px-6 pb-5 pt-3 border-t border-black/[0.06] dark:border-white/[0.05]">
        <div className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-[#151a17] border border-black/[0.08] dark:border-white/[0.07] rounded-xl">
          <button className="w-8 h-8 flex items-center justify-center rounded-lg text-[#858c87] dark:text-[#6e7672] hover:bg-black/[0.05] dark:hover:bg-white/[0.05] cursor-pointer">
            <Paperclip size={15} />
          </button>
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            placeholder="Reply to Sara…"
            className="flex-1 bg-transparent outline-none text-[14px] text-[#1a201c] dark:text-[#e8ece9] placeholder-[#858c87] dark:placeholder-[#6e7672] py-1.5"
          />
          <button className="w-8 h-8 flex items-center justify-center rounded-lg text-[#858c87] dark:text-[#6e7672] hover:bg-black/[0.05] dark:hover:bg-white/[0.05] cursor-pointer">
            <Smile size={15} />
          </button>
          <button
            onClick={send}
            disabled={!draft.trim()}
            className="h-8 px-3.5 flex items-center gap-1.5 rounded-lg bg-[#5a8a6b] hover:bg-[#4f7a5e] text-white text-[12px] font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Send size={13} /> Send
          </button>
        </div>
        <div className="mt-2 flex justify-between text-[11px] text-[#b5bbb7] dark:text-[#4a514d]">
          <span>Markdown supported · ⌘+Enter to send</span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#6db383]" />
            Sara is typing…
          </span>
        </div>
      </div>
    </div>
  );
};
