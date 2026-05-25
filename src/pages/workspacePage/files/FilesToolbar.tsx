import { Grid3X3, List, Trash2 } from "lucide-react";

type Tab = "files" | "trash";
type View = "grid" | "list";

interface FilesToolbarProps {
  tab: Tab;
  view: View;
  filesCount: number | null;
  trashCount: number | null;
  onTabChange: (tab: Tab) => void;
  onViewChange: (view: View) => void;
}

export const FilesToolbar = ({
  tab,
  view,
  filesCount,
  trashCount,
  onTabChange,
  onViewChange,
}: FilesToolbarProps) => (
  <div className="px-6 py-3 border-b border-black/[0.06] dark:border-white/[0.05] flex items-center justify-between gap-3">
    <div className="flex items-center gap-1 bg-[#f3f3ee] dark:bg-[#1c221e] border border-black/[0.08] dark:border-white/[0.07] rounded-lg p-0.5">
      <button
        onClick={() => onTabChange("files")}
        className={`px-3 h-7 inline-flex items-center gap-1.5 rounded-md text-[12px] font-medium transition-colors cursor-pointer ${
          tab === "files"
            ? "bg-white dark:bg-[#2a342e] text-[#1a201c] dark:text-[#e8ece9]"
            : "text-[#5a625e] dark:text-[#a0a8a3] hover:bg-black/[0.04] dark:hover:bg-white/[0.04]"
        }`}
      >
        Files
        {filesCount !== null && (
          <span className="text-[11px] font-normal text-[#858c87] dark:text-[#6e7672]">
            {filesCount}
          </span>
        )}
      </button>
      <button
        onClick={() => onTabChange("trash")}
        className={`px-3 h-7 inline-flex items-center gap-1.5 rounded-md text-[12px] font-medium transition-colors cursor-pointer ${
          tab === "trash"
            ? "bg-white dark:bg-[#2a342e] text-[#1a201c] dark:text-[#e8ece9]"
            : "text-[#5a625e] dark:text-[#a0a8a3] hover:bg-black/[0.04] dark:hover:bg-white/[0.04]"
        }`}
      >
        <Trash2 size={12} /> Trash
        {trashCount !== null && (
          <span className="text-[11px] font-normal text-[#858c87] dark:text-[#6e7672]">
            {trashCount}
          </span>
        )}
      </button>
    </div>
    {tab === "files" && (
      <div className="flex bg-[#f3f3ee] dark:bg-[#1c221e] border border-black/[0.08] dark:border-white/[0.07] rounded-lg p-0.5">
        <button
          onClick={() => onViewChange("grid")}
          className={`w-7 h-7 flex items-center justify-center rounded-md transition-colors cursor-pointer ${
            view === "grid"
              ? "bg-white dark:bg-[#2a342e] text-[#1a201c] dark:text-[#e8ece9]"
              : "text-[#5a625e] dark:text-[#a0a8a3] hover:bg-black/[0.04] dark:hover:bg-white/[0.04]"
          }`}
        >
          <Grid3X3 size={13} />
        </button>
        <button
          onClick={() => onViewChange("list")}
          className={`w-7 h-7 flex items-center justify-center rounded-md transition-colors cursor-pointer ${
            view === "list"
              ? "bg-white dark:bg-[#2a342e] text-[#1a201c] dark:text-[#e8ece9]"
              : "text-[#5a625e] dark:text-[#a0a8a3] hover:bg-black/[0.04] dark:hover:bg-white/[0.04]"
          }`}
        >
          <List size={13} />
        </button>
      </div>
    )}
  </div>
);
