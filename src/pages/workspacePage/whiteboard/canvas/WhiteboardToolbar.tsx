import { History, Save } from "lucide-react";

interface WhiteboardToolbarProps {
  connected: boolean;
  dirty: boolean;
  onSaveVersion: () => void;
  onOpenHistory: () => void;
}

export const WhiteboardToolbar = ({
  connected,
  dirty,
  onSaveVersion,
  onOpenHistory,
}: WhiteboardToolbarProps) => {
  const status: "offline" | "saving" | "saved" = !connected
    ? "offline"
    : dirty
      ? "saving"
      : "saved";

  const statusLabel =
    status === "offline" ? "Offline" : status === "saving" ? "Saving…" : "Saved";
  const statusDot =
    status === "offline"
      ? "bg-[#858c87]"
      : status === "saving"
        ? "bg-[#d97706]"
        : "bg-[#5a8a6b]";

  return (
    <div className="absolute top-2.5 right-2.5 z-10 inline-flex items-center gap-2">
      <button
        onClick={onSaveVersion}
        className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-full bg-white/95 dark:bg-[#151a17]/95 border border-black/[0.08] dark:border-white/[0.07] backdrop-blur text-[11px] font-medium text-[#5a625e] dark:text-[#a0a8a3] shadow-sm hover:bg-white dark:hover:bg-[#151a17] cursor-pointer"
      >
        <Save size={12} /> Save version
      </button>
      <button
        onClick={onOpenHistory}
        className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-full bg-white/95 dark:bg-[#151a17]/95 border border-black/[0.08] dark:border-white/[0.07] backdrop-blur text-[11px] font-medium text-[#5a625e] dark:text-[#a0a8a3] shadow-sm hover:bg-white dark:hover:bg-[#151a17] cursor-pointer"
      >
        <History size={12} /> History
      </button>
      <span className="inline-flex items-center gap-1.5 h-6 px-2.5 rounded-full bg-white/95 dark:bg-[#151a17]/95 border border-black/[0.08] dark:border-white/[0.07] backdrop-blur text-[11px] text-[#5a625e] dark:text-[#a0a8a3] shadow-sm pointer-events-none">
        <span className={`w-1.5 h-1.5 rounded-full ${statusDot}`} />
        {statusLabel}
      </span>
    </div>
  );
};
