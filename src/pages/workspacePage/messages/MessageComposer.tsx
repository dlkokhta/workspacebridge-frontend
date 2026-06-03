import { useState } from "react";
import { Paperclip, Send, Smile } from "lucide-react";

interface MessageComposerProps {
  connected: boolean;
  onSend: (text: string) => void;
  onTyping: () => void;
  onStopTyping: () => void;
}

export const MessageComposer = ({
  connected,
  onSend,
  onTyping,
  onStopTyping,
}: MessageComposerProps) => {
  const [draft, setDraft] = useState("");

  const handleSend = () => {
    const trimmed = draft.trim();
    if (!trimmed || !connected) return;
    onSend(trimmed);
    setDraft("");
    onStopTyping();
  };

  return (
    <div className="px-6 pb-5 pt-3 border-t border-black/[0.06] dark:border-white/[0.05]">
      <div className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-[#151a17] border border-black/[0.08] dark:border-white/[0.07] rounded-xl">
        <button className="w-8 h-8 flex items-center justify-center rounded-lg text-[#858c87] dark:text-[#6e7672] hover:bg-black/[0.05] dark:hover:bg-white/[0.05] cursor-pointer">
          <Paperclip size={15} />
        </button>
        <input
          value={draft}
          onChange={(e) => {
            setDraft(e.target.value);
            if (e.target.value) onTyping();
            else onStopTyping();
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
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
          onClick={handleSend}
          disabled={!draft.trim() || !connected}
          className="h-8 px-3.5 flex items-center gap-1.5 rounded-lg bg-[#5a8a6b] hover:bg-[#4f7a5e] text-white text-[12px] font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          <Send size={13} /> Send
        </button>
      </div>
      <div className="mt-2 flex justify-between text-[11px] text-[#b5bbb7] dark:text-[#4a514d]">
        <span>Enter to send · Shift+Enter for new line</span>
        <span className="flex items-center gap-1.5">
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              connected ? "bg-[#6db383]" : "bg-[#858c87]"
            }`}
          />
          {connected ? "Connected" : "Connecting…"}
        </span>
      </div>
    </div>
  );
};
