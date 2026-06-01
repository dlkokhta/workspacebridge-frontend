import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Download, MoreHorizontal, Trash2 } from "lucide-react";

interface FileCardActionsProps {
  canDelete: boolean;
  onDownload: () => void;
  onDelete: () => void;
}

export const FileCardActions = ({
  canDelete,
  onDownload,
  onDelete,
}: FileCardActionsProps) => {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onMouseDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onScroll = () => setOpen(false);
    document.addEventListener("mousedown", onMouseDown);
    window.addEventListener("scroll", onScroll, true);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("scroll", onScroll, true);
    };
  }, [open]);

  const toggle = () => {
    if (!buttonRef.current) return;
    if (open) {
      setOpen(false);
      return;
    }
    const rect = buttonRef.current.getBoundingClientRect();
    setPos({ top: rect.bottom + 4, left: rect.right - 160 });
    setOpen(true);
  };

  return (
    <>
      <button
        ref={buttonRef}
        onClick={(e) => {
          e.stopPropagation();
          toggle();
        }}
        aria-label="File options"
        className="w-7 h-7 inline-flex items-center justify-center rounded-md text-[#858c87] dark:text-[#6e7672] hover:bg-black/[0.06] dark:hover:bg-white/[0.06] cursor-pointer"
      >
        <MoreHorizontal size={14} />
      </button>
      {open &&
        pos &&
        createPortal(
          <div
            ref={menuRef}
            style={{ top: pos.top, left: pos.left }}
            className="fixed z-50 min-w-[160px] rounded-md border border-black/[0.08] dark:border-white/[0.07] bg-white dark:bg-[#1a201c] shadow-lg py-1 text-[12px]"
          >
            <button
              onClick={() => {
                setOpen(false);
                onDownload();
              }}
              className="w-full px-3 py-1.5 inline-flex items-center gap-2 text-left text-[#1a201c] dark:text-[#fafaf7] hover:bg-black/[0.04] dark:hover:bg-white/[0.04] cursor-pointer"
            >
              <Download size={12} /> Download
            </button>
            {canDelete && (
              <button
                onClick={() => {
                  setOpen(false);
                  onDelete();
                }}
                className="w-full px-3 py-1.5 inline-flex items-center gap-2 text-left text-[#c25a4a] hover:bg-black/[0.04] dark:hover:bg-white/[0.04] cursor-pointer"
              >
                <Trash2 size={12} /> Delete
              </button>
            )}
          </div>,
          document.body,
        )}
    </>
  );
};
