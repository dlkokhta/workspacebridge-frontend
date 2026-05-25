import { Plus } from "lucide-react";
import { BoardOptionsMenu } from "./BoardOptionsMenu";
import { BoardTab } from "./BoardTab";
import { useBoardMenu } from "./useBoardMenu";
import { useBoardRenaming } from "./useBoardRenaming";
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
  const menu = useBoardMenu();
  const renaming = useBoardRenaming({ onRename });

  const startRename = (board: BoardSummary) => {
    menu.close();
    renaming.start(board);
  };

  const handleDuplicate = (board: BoardSummary) => {
    menu.close();
    void onDuplicate(board);
  };

  const handleDelete = (board: BoardSummary) => {
    menu.close();
    onRequestDelete(board);
  };

  const menuBoard = menu.openId
    ? boards.find((b) => b.id === menu.openId) ?? null
    : null;

  return (
    <>
      <div className="flex items-center gap-1.5 px-6 py-2 border-b border-black/[0.06] dark:border-white/[0.05] overflow-x-auto">
        {boards.map((b) => (
          <BoardTab
            key={b.id}
            ref={renaming.renamingId === b.id ? renaming.inputRef : undefined}
            board={b}
            isSelected={b.id === selectedId}
            isRenaming={renaming.renamingId === b.id}
            renameValue={renaming.value}
            onRenameChange={renaming.setValue}
            onRenameKeyDown={(e) => renaming.onKeyDown(e, b.id)}
            onRenameBlur={() => void renaming.commit(b.id)}
            onSelect={() => onSelect(b.id)}
            onStartRename={() => startRename(b)}
            onMenuClick={(e) => menu.toggle(e, b.id)}
          />
        ))}
        <button
          onClick={onNewBoard}
          disabled={creating}
          className="h-7 px-3 inline-flex items-center gap-1 rounded-full text-[12px] font-medium border border-dashed border-black/[0.12] dark:border-white/[0.1] text-[#5a625e] dark:text-[#a0a8a3] hover:bg-black/[0.03] dark:hover:bg-white/[0.03] transition-colors cursor-pointer disabled:opacity-50"
        >
          <Plus size={12} /> New board
        </button>
      </div>
      {menuBoard && menu.pos && (
        <BoardOptionsMenu
          ref={menu.containerRef}
          top={menu.pos.top}
          left={menu.pos.left}
          onRename={() => startRename(menuBoard)}
          onDuplicate={() => handleDuplicate(menuBoard)}
          onDelete={() => handleDelete(menuBoard)}
        />
      )}
    </>
  );
};
