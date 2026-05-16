import {
  lazy,
  Suspense,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent as ReactMouseEvent,
} from "react";
import { createPortal } from "react-dom";
import { Copy, MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import { axiosInstance } from "../../../context/AuthContext";
import { TemplatePickerModal } from "./TemplatePickerModal";
import type { WhiteboardTemplate } from "./whiteboardTemplates";

const WhiteboardCanvas = lazy(() =>
  import("./WhiteboardCanvas").then((m) => ({ default: m.WhiteboardCanvas })),
);

interface BoardSummary {
  id: string;
  name: string;
  updatedAt: string;
}

interface WhiteboardTabProps {
  workspaceId: string;
}

export const WhiteboardTab = ({ workspaceId }: WhiteboardTabProps) => {
  const [boards, setBoards] = useState<BoardSummary[] | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [templatePickerOpen, setTemplatePickerOpen] = useState(false);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [menuPos, setMenuPos] = useState<{ top: number; left: number } | null>(
    null,
  );
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [confirmBoard, setConfirmBoard] = useState<BoardSummary | null>(null);
  const menuContainerRef = useRef<HTMLDivElement | null>(null);
  const renameInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!menuOpenId) return;
    const onMouseDown = (e: MouseEvent) => {
      if (
        menuContainerRef.current &&
        !menuContainerRef.current.contains(e.target as Node)
      ) {
        setMenuOpenId(null);
        setMenuPos(null);
      }
    };
    const onScrollOrResize = () => {
      setMenuOpenId(null);
      setMenuPos(null);
    };
    document.addEventListener("mousedown", onMouseDown);
    window.addEventListener("scroll", onScrollOrResize, true);
    window.addEventListener("resize", onScrollOrResize);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("scroll", onScrollOrResize, true);
      window.removeEventListener("resize", onScrollOrResize);
    };
  }, [menuOpenId]);

  const openMenu = (
    e: ReactMouseEvent<HTMLButtonElement>,
    boardId: string,
  ) => {
    if (menuOpenId === boardId) {
      setMenuOpenId(null);
      setMenuPos(null);
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    setMenuPos({ top: rect.bottom + 4, left: rect.right - 140 });
    setMenuOpenId(boardId);
  };

  useEffect(() => {
    if (renamingId && renameInputRef.current) {
      renameInputRef.current.focus();
      renameInputRef.current.select();
    }
  }, [renamingId]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const { data } = await axiosInstance.get<BoardSummary[]>(
          `/workspace/${workspaceId}/whiteboards`,
        );
        if (cancelled) return;

        if (data.length === 0) {
          const { data: created } = await axiosInstance.post<BoardSummary>(
            `/workspace/${workspaceId}/whiteboards`,
            {},
          );
          if (cancelled) return;
          setBoards([created]);
          setSelectedId(created.id);
        } else {
          setBoards(data);
          setSelectedId(data[0].id);
        }
      } catch {
        if (!cancelled) setError("Could not load whiteboards.");
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [workspaceId]);

  const handleNewBoard = () => {
    setTemplatePickerOpen(true);
  };

  const handleCreateFromTemplate = async (
    template: WhiteboardTemplate,
    name: string,
  ) => {
    setCreating(true);
    try {
      const { data } = await axiosInstance.post<BoardSummary>(
        `/workspace/${workspaceId}/whiteboards`,
        {
          name,
          elements: template.elements,
        },
      );
      setBoards((prev) => (prev ? [...prev, data] : [data]));
      setSelectedId(data.id);
      setTemplatePickerOpen(false);
    } catch {
      setError("Could not create board.");
    } finally {
      setCreating(false);
    }
  };

  const startRename = (board: BoardSummary) => {
    setMenuOpenId(null);
    setMenuPos(null);
    setRenameValue(board.name);
    setRenamingId(board.id);
  };

  const cancelRename = () => {
    setRenamingId(null);
    setRenameValue("");
  };

  const commitRename = async (boardId: string) => {
    const next = renameValue.trim();
    const current = boards?.find((b) => b.id === boardId);
    setRenamingId(null);
    if (!next || !current || current.name === next) return;
    const previous = current.name;
    setBoards((prev) =>
      prev ? prev.map((b) => (b.id === boardId ? { ...b, name: next } : b)) : prev,
    );
    try {
      await axiosInstance.patch(`/whiteboards/${boardId}/rename`, { name: next });
    } catch {
      setBoards((prev) =>
        prev
          ? prev.map((b) => (b.id === boardId ? { ...b, name: previous } : b))
          : prev,
      );
      setError("Could not rename board.");
    }
  };

  const onRenameKeyDown = (
    e: KeyboardEvent<HTMLInputElement>,
    boardId: string,
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      void commitRename(boardId);
    } else if (e.key === "Escape") {
      e.preventDefault();
      cancelRename();
    }
  };

  const handleDuplicate = async (board: BoardSummary) => {
    setMenuOpenId(null);
    setMenuPos(null);
    try {
      const { data } = await axiosInstance.post<BoardSummary>(
        `/whiteboards/${board.id}/duplicate`,
      );
      setBoards((prev) => (prev ? [...prev, data] : [data]));
      setSelectedId(data.id);
    } catch {
      setError("Could not duplicate board.");
    }
  };

  const handleDelete = (board: BoardSummary) => {
    setMenuOpenId(null);
    setMenuPos(null);
    setConfirmBoard(board);
  };

  const handleConfirmDelete = async () => {
    if (!confirmBoard) return;
    const board = confirmBoard;
    setConfirmBoard(null);
    const remaining = (boards ?? []).filter((b) => b.id !== board.id);
    try {
      await axiosInstance.delete(`/whiteboards/${board.id}`);
      if (remaining.length === 0) {
        const { data: created } = await axiosInstance.post<BoardSummary>(
          `/workspace/${workspaceId}/whiteboards`,
          {},
        );
        setBoards([created]);
        setSelectedId(created.id);
        return;
      }
      setBoards(remaining);
      if (selectedId === board.id) setSelectedId(remaining[0].id);
    } catch {
      setError("Could not delete board.");
    }
  };

  if (error) {
    return (
      <div className="flex-1 min-h-0 w-full flex items-center justify-center text-[13px] text-[#c25a4a]">
        {error}
      </div>
    );
  }

  if (!boards || !selectedId) {
    return (
      <div className="flex-1 min-h-0 w-full flex items-center justify-center text-[13px] text-[#858c87] dark:text-[#6e7672]">
        Loading whiteboards…
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden min-h-0">
      <div className="flex items-center gap-1.5 px-6 py-2 border-b border-black/[0.06] dark:border-white/[0.05] overflow-x-auto">
        {boards.map((b) => {
          const isSelected = b.id === selectedId;
          const isRenaming = renamingId === b.id;
          const baseColor = isSelected
            ? "bg-[#5a8a6b] text-white"
            : "bg-black/[0.04] dark:bg-white/[0.04] text-[#5a625e] dark:text-[#a0a8a3] hover:bg-black/[0.06] dark:hover:bg-white/[0.06]";

          return (
            <div
              key={b.id}
              className={`h-7 inline-flex items-center rounded-full text-[12px] font-medium transition-colors shrink-0 ${baseColor}`}
            >
              {isRenaming ? (
                <input
                  ref={renameInputRef}
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  onKeyDown={(e) => onRenameKeyDown(e, b.id)}
                  onBlur={() => void commitRename(b.id)}
                  maxLength={100}
                  className={`h-7 px-3 bg-transparent outline-none text-[12px] font-medium w-32 ${
                    isSelected
                      ? "text-white placeholder-white/60"
                      : "text-[#5a625e] dark:text-[#a0a8a3]"
                  }`}
                />
              ) : (
                <>
                  <button
                    onClick={() => setSelectedId(b.id)}
                    onDoubleClick={() => startRename(b)}
                    className="h-7 pl-3 pr-1 inline-flex items-center cursor-pointer"
                  >
                    {b.name}
                  </button>
                  <button
                    onClick={(e) => openMenu(e, b.id)}
                    aria-label="Board options"
                    className={`h-7 w-7 inline-flex items-center justify-center rounded-r-full cursor-pointer transition-colors ${
                      isSelected
                        ? "hover:bg-white/15"
                        : "hover:bg-black/[0.04] dark:hover:bg-white/[0.04]"
                    }`}
                  >
                    <MoreHorizontal size={13} />
                  </button>
                </>
              )}
            </div>
          );
        })}
        <button
          onClick={handleNewBoard}
          disabled={creating}
          className="h-7 px-3 inline-flex items-center gap-1 rounded-full text-[12px] font-medium border border-dashed border-black/[0.12] dark:border-white/[0.1] text-[#5a625e] dark:text-[#a0a8a3] hover:bg-black/[0.03] dark:hover:bg-white/[0.03] transition-colors cursor-pointer disabled:opacity-50"
        >
          <Plus size={12} /> New board
        </button>
      </div>
      {menuOpenId &&
        menuPos &&
        createPortal(
          <div
            ref={menuContainerRef}
            style={{ top: menuPos.top, left: menuPos.left }}
            className="fixed z-50 min-w-[140px] rounded-md border border-black/[0.08] dark:border-white/[0.07] bg-white dark:bg-[#1a201c] shadow-lg py-1 text-[12px]"
          >
            {(() => {
              const board = boards.find((b) => b.id === menuOpenId);
              if (!board) return null;
              return (
                <>
                  <button
                    onClick={() => startRename(board)}
                    className="w-full px-3 py-1.5 inline-flex items-center gap-2 text-left text-[#1a201c] dark:text-[#fafaf7] hover:bg-black/[0.04] dark:hover:bg-white/[0.04] cursor-pointer"
                  >
                    <Pencil size={12} /> Rename
                  </button>
                  <button
                    onClick={() => void handleDuplicate(board)}
                    className="w-full px-3 py-1.5 inline-flex items-center gap-2 text-left text-[#1a201c] dark:text-[#fafaf7] hover:bg-black/[0.04] dark:hover:bg-white/[0.04] cursor-pointer"
                  >
                    <Copy size={12} /> Duplicate
                  </button>
                  <button
                    onClick={() => handleDelete(board)}
                    className="w-full px-3 py-1.5 inline-flex items-center gap-2 text-left text-[#c25a4a] hover:bg-black/[0.04] dark:hover:bg-white/[0.04] cursor-pointer"
                  >
                    <Trash2 size={12} /> Delete
                  </button>
                </>
              );
            })()}
          </div>,
          document.body,
        )}
      <Suspense
        fallback={
          <div className="flex-1 min-h-0 w-full flex items-center justify-center text-[13px] text-[#858c87] dark:text-[#6e7672]">
            Loading whiteboard…
          </div>
        }
      >
        <WhiteboardCanvas boardId={selectedId} />
      </Suspense>
      <TemplatePickerModal
        isOpen={templatePickerOpen}
        onClose={() => {
          if (!creating) setTemplatePickerOpen(false);
        }}
        onCreate={handleCreateFromTemplate}
        creating={creating}
      />
      {confirmBoard &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white dark:bg-[#1a201c] rounded-xl shadow-xl border border-black/[0.08] dark:border-white/[0.07] p-6 w-[320px] flex flex-col gap-4">
              <p className="text-[14px] font-semibold text-[#1a201c] dark:text-[#fafaf7]">
                Delete whiteboard
              </p>
              <p className="text-[13px] text-[#5a625e] dark:text-[#a0a8a3]">
                Are you sure you want to delete{" "}
                <span className="font-medium text-[#1a201c] dark:text-[#fafaf7]">
                  &ldquo;{confirmBoard.name}&rdquo;
                </span>
                ? This cannot be undone.
              </p>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setConfirmBoard(null)}
                  className="px-4 py-1.5 rounded-lg text-[13px] font-medium border border-black/[0.1] dark:border-white/[0.1] text-[#5a625e] dark:text-[#a0a8a3] hover:bg-black/[0.04] dark:hover:bg-white/[0.04] transition-colors cursor-pointer"
                >
                  No
                </button>
                <button
                  onClick={() => void handleConfirmDelete()}
                  className="px-4 py-1.5 rounded-lg text-[13px] font-medium bg-[#5a8a6b] text-white hover:bg-[#4d7a5e] transition-colors cursor-pointer"
                >
                  Yes, delete
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
};
