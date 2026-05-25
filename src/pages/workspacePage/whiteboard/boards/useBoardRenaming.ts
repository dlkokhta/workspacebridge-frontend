import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import type { BoardSummary } from "./useBoards";

interface UseBoardRenamingOptions {
  onRename: (boardId: string, name: string) => Promise<void>;
}

export const useBoardRenaming = ({ onRename }: UseBoardRenamingOptions) => {
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Focus + select the input as soon as a board enters rename mode.
  useEffect(() => {
    if (renamingId && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [renamingId]);

  const start = useCallback((board: BoardSummary) => {
    setValue(board.name);
    setRenamingId(board.id);
  }, []);

  const cancel = useCallback(() => {
    setRenamingId(null);
    setValue("");
  }, []);

  const commit = useCallback(
    async (boardId: string) => {
      const next = value.trim();
      setRenamingId(null);
      if (!next) return;
      await onRename(boardId, next);
    },
    [value, onRename],
  );

  const onKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>, boardId: string) => {
      if (e.key === "Enter") {
        e.preventDefault();
        void commit(boardId);
      } else if (e.key === "Escape") {
        e.preventDefault();
        cancel();
      }
    },
    [commit, cancel],
  );

  return { renamingId, value, inputRef, setValue, start, cancel, commit, onKeyDown };
};
