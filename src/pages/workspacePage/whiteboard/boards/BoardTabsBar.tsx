import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent as ReactMouseEvent,
} from "react";
import { MoreHorizontal, Plus } from "lucide-react";
import { BoardOptionsMenu } from "./BoardOptionsMenu";
import type { BoardSummary } from "./useBoards";

interface BoardTabsBarProps {
  boards: BoardSummary[];
  selectedId: string;
  creating: boolean;
  onSelect: (id: string) => void;
  onRename: (boardId: string, name: string) => Promise<void>;
  onDuplicate: (board: BoardSummary) => Promise<void>;
  onRequestDelete: (board: BoardSummary) => void;
  onNewBoard: () => void;
}

export const BoardTabsBar = ({
  boards,
  selectedId,
  creating,
  onSelect,
  onRename,
  onDuplicate,
  onRequestDelete,
  onNewBoard,
}: BoardTabsBarProps) => {
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [menuPos, setMenuPos] = useState<{ top: number; left: number } | null>(
    null,
  );
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
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

  useEffect(() => {
    if (renamingId && renameInputRef.current) {
      renameInputRef.current.focus();
      renameInputRef.current.select();
    }
  }, [renamingId]);

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
    setRenamingId(null);
    if (!next) return;
    await onRename(boardId, next);
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

  const handleDuplicate = (board: BoardSummary) => {
    setMenuOpenId(null);
    setMenuPos(null);
    void onDuplicate(board);
  };

  const handleDelete = (board: BoardSummary) => {
    setMenuOpenId(null);
    setMenuPos(null);
    onRequestDelete(board);
  };

  const menuBoard = menuOpenId
    ? boards.find((b) => b.id === menuOpenId) ?? null
    : null;

  return (
    <>
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
                    onClick={() => onSelect(b.id)}
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
          onClick={onNewBoard}
          disabled={creating}
          className="h-7 px-3 inline-flex items-center gap-1 rounded-full text-[12px] font-medium border border-dashed border-black/[0.12] dark:border-white/[0.1] text-[#5a625e] dark:text-[#a0a8a3] hover:bg-black/[0.03] dark:hover:bg-white/[0.03] transition-colors cursor-pointer disabled:opacity-50"
        >
          <Plus size={12} /> New board
        </button>
      </div>
      {menuBoard && menuPos && (
        <BoardOptionsMenu
          ref={menuContainerRef}
          top={menuPos.top}
          left={menuPos.left}
          onRename={() => startRename(menuBoard)}
          onDuplicate={() => handleDuplicate(menuBoard)}
          onDelete={() => handleDelete(menuBoard)}
        />
      )}
    </>
  );
};
