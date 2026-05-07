import { useState } from "react";
import { Filter, Folder, Grid3X3, List, MessageCircle, MoreHorizontal, Plus } from "lucide-react";
import { FileIcon } from "../components/FileIcon";
import type { FileItem } from "../types";

const SEED_FILES: FileItem[] = [
  { id: 1, name: "logo-v3-warm-tones.fig", kind: "Figma", size: "14 MB", mod: "10 min ago", by: "Maya", comments: 2, color: "#5a8a6b" },
  { id: 2, name: "Brand guidelines v2.pdf", kind: "PDF", size: "3.4 MB", mod: "2 hours ago", by: "Maya", comments: 0, color: "#c25a4a" },
  { id: 3, name: "Color exploration.png", kind: "Image", size: "1.1 MB", mod: "Yesterday", by: "Sara", comments: 5, color: "#7a9bbf" },
  { id: 4, name: "Moodboard.pdf", kind: "PDF", size: "8.9 MB", mod: "Yesterday", by: "Sara", comments: 3, color: "#c25a4a" },
  { id: 5, name: "Wordmark sketches.fig", kind: "Figma", size: "6.2 MB", mod: "2 days ago", by: "Maya", comments: 1, color: "#5a8a6b" },
  { id: 6, name: "Reference photography", kind: "Folder", size: "12 items", mod: "3 days ago", by: "Sara", comments: 0, color: "#b5803a" },
  { id: 7, name: "Logo concepts v2.fig", kind: "Figma", size: "11 MB", mod: "1 week ago", by: "Maya", comments: 8, color: "#5a8a6b" },
  { id: 8, name: "Contract — signed.pdf", kind: "PDF", size: "180 KB", mod: "3 weeks ago", by: "Sara", comments: 0, color: "#c25a4a" },
];

const LIST_GRID = "1fr 90px 90px 130px 80px 40px";

export const FilesTab = () => {
  const [view, setView] = useState<"grid" | "list">("grid");

  return (
    <div className="flex flex-col flex-1 overflow-hidden min-h-0">
      <div className="flex items-center justify-between px-6 py-3 border-b border-black/[0.06] dark:border-white/[0.05]">
        <div className="flex gap-1.5">
          <button className="h-8 px-3 inline-flex items-center gap-1.5 rounded-lg bg-white dark:bg-[#1c221e] border border-black/[0.08] dark:border-white/[0.07] text-[12px] font-medium text-[#1a201c] dark:text-[#e8ece9] cursor-pointer">
            <Folder size={13} /> All files
          </button>
          <button className="h-8 px-3 inline-flex items-center rounded-lg text-[12px] text-[#5a625e] dark:text-[#a0a8a3] hover:bg-black/[0.04] dark:hover:bg-white/[0.04] transition-colors cursor-pointer">
            Moodboard
          </button>
          <button className="h-8 px-3 inline-flex items-center rounded-lg text-[12px] text-[#5a625e] dark:text-[#a0a8a3] hover:bg-black/[0.04] dark:hover:bg-white/[0.04] transition-colors cursor-pointer">
            Deliverables
          </button>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="flex bg-[#f3f3ee] dark:bg-[#1c221e] border border-black/[0.08] dark:border-white/[0.07] rounded-lg p-0.5">
            <button
              onClick={() => setView("grid")}
              className={`w-7 h-7 flex items-center justify-center rounded-md text-[#5a625e] dark:text-[#a0a8a3] transition-colors cursor-pointer ${
                view === "grid"
                  ? "bg-white dark:bg-[#2a342e] text-[#1a201c] dark:text-[#e8ece9]"
                  : "hover:bg-black/[0.04] dark:hover:bg-white/[0.04]"
              }`}
            >
              <Grid3X3 size={13} />
            </button>
            <button
              onClick={() => setView("list")}
              className={`w-7 h-7 flex items-center justify-center rounded-md text-[#5a625e] dark:text-[#a0a8a3] transition-colors cursor-pointer ${
                view === "list"
                  ? "bg-white dark:bg-[#2a342e] text-[#1a201c] dark:text-[#e8ece9]"
                  : "hover:bg-black/[0.04] dark:hover:bg-white/[0.04]"
              }`}
            >
              <List size={13} />
            </button>
          </div>
          <button className="h-8 px-3 inline-flex items-center gap-1.5 rounded-lg bg-white dark:bg-[#1c221e] border border-black/[0.08] dark:border-white/[0.07] text-[12px] font-medium text-[#5a625e] dark:text-[#a0a8a3] hover:bg-[#f6f6f1] dark:hover:bg-[#222b26] transition-colors cursor-pointer">
            <Filter size={13} /> Filter
          </button>
          <button className="h-8 px-3 inline-flex items-center gap-1.5 rounded-lg bg-[#5a8a6b] hover:bg-[#4f7a5e] text-white text-[12px] font-medium transition-colors cursor-pointer">
            <Plus size={13} /> Upload
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 bg-[#fafaf7] dark:bg-[#0e1310]">
        {view === "grid" ? (
          <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))" }}>
            {SEED_FILES.map((f) => (
              <div
                key={f.id}
                className="rounded-xl border border-black/[0.08] dark:border-white/[0.07] bg-white dark:bg-[#151a17] overflow-hidden cursor-pointer hover:border-black/[0.14] dark:hover:border-white/[0.14] transition-colors"
              >
                <div className="aspect-[16/10] bg-[#f3f3ee] dark:bg-[#0a0f0c] flex items-center justify-center border-b border-black/[0.06] dark:border-white/[0.05]">
                  <FileIcon kind={f.kind} color={f.color} size={28} />
                </div>
                <div className="p-3.5">
                  <div className="text-[13px] font-medium text-[#1a201c] dark:text-[#e8ece9] truncate mb-1">{f.name}</div>
                  <div className="flex items-center justify-between text-[11px] text-[#858c87] dark:text-[#6e7672]">
                    <span>{f.size} · {f.mod}</span>
                    {f.comments > 0 && (
                      <span className="flex items-center gap-1 text-[#5a8a6b]">
                        <MessageCircle size={10} /> {f.comments}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-black/[0.08] dark:border-white/[0.07] bg-white dark:bg-[#151a17] overflow-hidden">
            <div
              className="grid text-[11px] uppercase tracking-[0.06em] text-[#858c87] dark:text-[#6e7672] px-4 py-2.5 border-b border-black/[0.06] dark:border-white/[0.05]"
              style={{ gridTemplateColumns: LIST_GRID }}
            >
              <span>Name</span><span>Kind</span><span>Size</span><span>Modified</span><span>By</span><span />
            </div>
            {SEED_FILES.map((f) => (
              <div
                key={f.id}
                className="grid items-center px-4 py-3 border-b border-black/[0.04] dark:border-white/[0.03] last:border-0 text-[13px] hover:bg-[#f6f6f1] dark:hover:bg-[#1a201c]/30 transition-colors"
                style={{ gridTemplateColumns: LIST_GRID }}
              >
                <span className="flex items-center gap-2.5 min-w-0">
                  <FileIcon kind={f.kind} color={f.color} size={14} />
                  <span className="truncate text-[#1a201c] dark:text-[#e8ece9]">{f.name}</span>
                  {f.comments > 0 && (
                    <span className="flex items-center gap-1 text-[#5a8a6b] text-[11px] shrink-0">
                      <MessageCircle size={10} /> {f.comments}
                    </span>
                  )}
                </span>
                <span className="text-[#5a625e] dark:text-[#a0a8a3]">{f.kind}</span>
                <span className="text-[#5a625e] dark:text-[#a0a8a3]">{f.size}</span>
                <span className="text-[#5a625e] dark:text-[#a0a8a3]">{f.mod}</span>
                <span className="text-[#5a625e] dark:text-[#a0a8a3]">{f.by}</span>
                <button className="w-7 h-7 flex items-center justify-center rounded-md text-[#858c87] dark:text-[#6e7672] hover:bg-black/[0.05] dark:hover:bg-white/[0.05] cursor-pointer">
                  <MoreHorizontal size={13} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
