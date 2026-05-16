import { forwardRef } from "react";
import { createPortal } from "react-dom";
import { Copy, Pencil, Trash2 } from "lucide-react";

interface BoardOptionsMenuProps {
  top: number;
  left: number;
  onRename: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

export const BoardOptionsMenu = forwardRef<HTMLDivElement, BoardOptionsMenuProps>(
  ({ top, left, onRename, onDuplicate, onDelete }, ref) =>
    createPortal(
      <div
        ref={ref}
        style={{ top, left }}
        className="fixed z-50 min-w-[140px] rounded-md border border-black/[0.08] dark:border-white/[0.07] bg-white dark:bg-[#1a201c] shadow-lg py-1 text-[12px]"
      >
        <button
          onClick={onRename}
          className="w-full px-3 py-1.5 inline-flex items-center gap-2 text-left text-[#1a201c] dark:text-[#fafaf7] hover:bg-black/[0.04] dark:hover:bg-white/[0.04] cursor-pointer"
        >
          <Pencil size={12} /> Rename
        </button>
        <button
          onClick={onDuplicate}
          className="w-full px-3 py-1.5 inline-flex items-center gap-2 text-left text-[#1a201c] dark:text-[#fafaf7] hover:bg-black/[0.04] dark:hover:bg-white/[0.04] cursor-pointer"
        >
          <Copy size={12} /> Duplicate
        </button>
        <button
          onClick={onDelete}
          className="w-full px-3 py-1.5 inline-flex items-center gap-2 text-left text-[#c25a4a] hover:bg-black/[0.04] dark:hover:bg-white/[0.04] cursor-pointer"
        >
          <Trash2 size={12} /> Delete
        </button>
      </div>,
      document.body,
    ),
);

BoardOptionsMenu.displayName = "BoardOptionsMenu";
