import { useCallback } from "react";
import type { Socket } from "socket.io-client";
import { useBoardMutations } from "./useBoardMutations";
import { useBoardsList } from "./useBoardsList";
import type { UseBoardsResult } from "./boardsKeys";

export type { BoardSummary } from "./boardsKeys";

interface BoardSyncOptions {
  socket: Socket | null;
  connected: boolean;
  isOwner: boolean;
}

export const useBoards = (
  workspaceId: string,
  sync: BoardSyncOptions,
): UseBoardsResult => {
  const list = useBoardsList(workspaceId, sync);
  const mutations = useBoardMutations({
    workspaceId,
    setSelectedId: list.setSelectedId,
  });

  // Rename short-circuits when the name hasn't changed, so it reads the
  // current list before triggering the mutation.
  const renameBoard = useCallback(
    async (boardId: string, name: string) => {
      const current = list.boards?.find((b) => b.id === boardId);
      if (!current || current.name === name) return;
      try {
        await mutations.renameMutation.mutateAsync({ boardId, name });
      } catch {
        // Errors are surfaced through the mutations hook's error state.
      }
    },
    [list.boards, mutations.renameMutation],
  );

  return {
    boards: list.boards,
    selectedId: list.selectedId,
    setSelectedId: list.setSelectedId,
    error: mutations.error ?? list.loadError,
    creating: mutations.creating,
    createBoard: mutations.createBoard,
    renameBoard,
    duplicateBoard: mutations.duplicateBoard,
    deleteBoard: mutations.deleteBoard,
  };
};
