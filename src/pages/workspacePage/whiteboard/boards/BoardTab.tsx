import {
  forwardRef,
  type KeyboardEvent,
  type MouseEvent as ReactMouseEvent,
} from "react";
import { MoreHorizontal } from "lucide-react";
import type { BoardSummary } from "./useBoards";

interface BoardTabProps {
  board: BoardSummary;
  isSelected: boolean;
  isRenaming: boolean;
  renameValue: string;
  onRenameChange: (value: string) => void;
  onRenameKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void;
  onRenameBlur: () => void;
  onSelect: () => void;
  onStartRename: () => void;
  onMenuClick: (e: ReactMouseEvent<HTMLButtonElement>) => void;
}

export const BoardTab = forwardRef<HTMLInputElement, BoardTabProps>(
  (
    {
      board,
      isSelected,
      isRenaming,
      renameValue,
      onRenameChange,
      onRenameKeyDown,
      onRenameBlur,
      onSelect,
      onStartRename,
      onMenuClick,
    },
    renameInputRef,
  ) => {
    const baseColor = isSelected
      ? "bg-[#5a8a6b] text-white"
      : "bg-black/[0.04] dark:bg-white/[0.04] text-[#5a625e] dark:text-[#a0a8a3] hover:bg-black/[0.06] dark:hover:bg-white/[0.06]";

    return (
      <div
        className={`h-7 inline-flex items-center rounded-full text-[12px] font-medium transition-colors shrink-0 ${baseColor}`}
      >
        {isRenaming ? (
          <input
            ref={renameInputRef}
            value={renameValue}
            onChange={(e) => onRenameChange(e.target.value)}
            onKeyDown={onRenameKeyDown}
            onBlur={onRenameBlur}
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
              onClick={onSelect}
              onDoubleClick={onStartRename}
              className="h-7 pl-3 pr-1 inline-flex items-center cursor-pointer"
            >
              {board.name}
            </button>
            <button
              onClick={onMenuClick}
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
  },
);
