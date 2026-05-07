import { useState } from "react";
import { X } from "lucide-react";
import type { SharedLink } from "../types";

interface AddLinkModalProps {
  onAdd: (link: SharedLink) => void;
  onClose: () => void;
}

export const AddLinkModal = ({ onAdd, onClose }: AddLinkModalProps) => {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");

  const handleAdd = () => {
    onAdd({
      id: Date.now(),
      title: title.trim(),
      url: url.trim(),
      kind: "Link",
      by: "You",
      added: "Just now",
      color: "#5a8a6b",
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-md bg-white dark:bg-[#151a17] border border-black/[0.08] dark:border-white/[0.07] rounded-2xl p-7 shadow-xl">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-[18px] font-semibold text-[#1a201c] dark:text-[#e8ece9]">Add a link</h3>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-[#858c87] dark:text-[#6e7672] hover:bg-black/[0.05] dark:hover:bg-white/[0.05] cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="block text-[12px] font-medium text-[#5a625e] dark:text-[#a0a8a3] mb-1.5">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Brand mockups v3"
              autoFocus
              className="w-full h-[42px] px-3.5 rounded-lg border border-black/[0.08] dark:border-white/[0.07] bg-white dark:bg-[#1c221e] text-[13px] text-[#1a201c] dark:text-[#e8ece9] outline-none focus:border-[#5a8a6b] focus:ring-2 focus:ring-[#5a8a6b]/20 transition-all"
            />
          </div>
          <div>
            <label className="block text-[12px] font-medium text-[#5a625e] dark:text-[#a0a8a3] mb-1.5">URL</label>
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="figma.com/file/…"
              className="w-full h-[42px] px-3.5 rounded-lg border border-black/[0.08] dark:border-white/[0.07] bg-white dark:bg-[#1c221e] text-[13px] text-[#1a201c] dark:text-[#e8ece9] outline-none focus:border-[#5a8a6b] focus:ring-2 focus:ring-[#5a8a6b]/20 transition-all"
            />
          </div>
        </div>
        <div className="flex gap-2.5 mt-6">
          <button
            onClick={onClose}
            className="flex-1 h-10 rounded-lg border border-black/[0.08] dark:border-white/[0.07] text-[13px] font-medium text-[#5a625e] dark:text-[#a0a8a3] hover:bg-black/[0.03] dark:hover:bg-white/[0.03] transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            disabled={!title.trim() || !url.trim()}
            onClick={handleAdd}
            className="flex-[2] h-10 rounded-lg bg-[#5a8a6b] hover:bg-[#4f7a5e] text-white text-[13px] font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add link
          </button>
        </div>
      </div>
    </div>
  );
};
