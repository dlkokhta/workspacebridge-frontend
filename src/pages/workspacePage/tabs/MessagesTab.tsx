import { useEffect, useRef, useState } from "react";
import { Send, Paperclip, Smile } from "lucide-react";
import { useSocket } from "../../../context/SocketContext";
import type { Message } from "../types";

interface MessagesTabProps {
  workspaceId: string;
  userId: string;
  initials: string;
}

const formatTime = (iso: string) => {
  const date = new Date(iso);
  const hours = date.getHours() % 12 || 12;
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const period = date.getHours() >= 12 ? "PM" : "AM";
  return `${hours}:${minutes} ${period}`;
};

const getSenderName = (msg: Message) => {
  if (msg.sender.firstname || msg.sender.lastname) {
    return `${msg.sender.firstname ?? ""} ${msg.sender.lastname ?? ""}`.trim();
  }
  return msg.sender.email;
};

const getSenderInitials = (msg: Message) => {
  if (msg.sender.firstname && msg.sender.lastname)
    return `${msg.sender.firstname[0]}${msg.sender.lastname[0]}`.toUpperCase();
  if (msg.sender.firstname) return msg.sender.firstname[0].toUpperCase();
  return msg.sender.email[0].toUpperCase();
};

export const MessagesTab = ({ workspaceId, userId, initials }: MessagesTabProps) => {
  const { socket, connected } = useSocket();
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!socket || !connected) return;

    socket.emit("joinRoom", { workspaceId });

    const onHistory = (history: Message[]) => setMessages(history);
    const onNewMessage = (message: Message) =>
      setMessages((prev) => [...prev, message]);

    socket.on("messageHistory", onHistory);
    socket.on("newMessage", onNewMessage);

    return () => {
      socket.off("messageHistory", onHistory);
      socket.off("newMessage", onNewMessage);
    };
  }, [socket, connected, workspaceId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = () => {
    if (!draft.trim() || !socket || !connected) return;
    socket.emit("sendMessage", { workspaceId, content: draft.trim() });
    setDraft("");
  };

  return (
    <div className="flex flex-col flex-1 overflow-hidden min-h-0">
      <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-4">
        {messages.length === 0 && (
          <div className="flex-1 flex items-center justify-center py-20 text-center">
            <div>
              <p className="text-[15px] font-medium text-[#1a201c] dark:text-[#e8ece9] mb-1">No messages yet</p>
              <p className="text-[13px] text-[#858c87] dark:text-[#6e7672]">Send the first message to start the conversation.</p>
            </div>
          </div>
        )}

        {messages.map((m, i) => {
          const isMe = m.sender.id === userId;
          const showMeta = i === 0 || messages[i - 1].sender.id !== m.sender.id;

          return (
            <div key={m.id} className={`flex gap-3 items-end ${isMe ? "flex-row-reverse" : ""}`}>
              <span
                className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-semibold text-white shrink-0"
                style={{ background: isMe ? "#5a8a6b" : "#7a9bbf" }}
              >
                {isMe ? initials : getSenderInitials(m)}
              </span>

              <div className={`max-w-[62%] flex flex-col gap-1 ${isMe ? "items-end" : "items-start"}`}>
                {showMeta && (
                  <div className="flex gap-2 text-[11px] text-[#858c87] dark:text-[#6e7672]">
                    {!isMe && (
                      <span className="font-medium text-[#5a625e] dark:text-[#a0a8a3]">{getSenderName(m)}</span>
                    )}
                    <span>{formatTime(m.createdAt)}</span>
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
                  {m.content}
                </div>
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
            placeholder={connected ? "Write a message…" : "Connecting…"}
            disabled={!connected}
            className="flex-1 bg-transparent outline-none text-[14px] text-[#1a201c] dark:text-[#e8ece9] placeholder-[#858c87] dark:placeholder-[#6e7672] py-1.5 disabled:opacity-50"
          />
          <button className="w-8 h-8 flex items-center justify-center rounded-lg text-[#858c87] dark:text-[#6e7672] hover:bg-black/[0.05] dark:hover:bg-white/[0.05] cursor-pointer">
            <Smile size={15} />
          </button>
          <button
            onClick={send}
            disabled={!draft.trim() || !connected}
            className="h-8 px-3.5 flex items-center gap-1.5 rounded-lg bg-[#5a8a6b] hover:bg-[#4f7a5e] text-white text-[12px] font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <Send size={13} /> Send
          </button>
        </div>
        <div className="mt-2 flex justify-between text-[11px] text-[#b5bbb7] dark:text-[#4a514d]">
          <span>Enter to send · Shift+Enter for new line</span>
          <span className="flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${connected ? "bg-[#6db383]" : "bg-[#858c87]"}`} />
            {connected ? "Connected" : "Connecting…"}
          </span>
        </div>
      </div>
    </div>
  );
};
