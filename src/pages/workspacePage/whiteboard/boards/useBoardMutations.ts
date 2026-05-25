import { useCallback, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../../../../context/AuthContext";
import type { WhiteboardTemplate } from "../templates";
import {
  boardsKeys,
  bootstrapDefaultBoard,
  type BoardSummary,
} from "./boardsKeys";

interface UseBoardMutationsOptions {
  workspaceId: string;
  setSelectedId: (id: string | ((prev: string | null) => string | null)) => void;
}

// All four whiteboard write operations + their error wrappers. The hook
// reaches up into selection state via setSelectedId so newly created /
// duplicated boards become active and deletion can reassign selection.
export const useBoardMutations = ({
  workspaceId,
  setSelectedId,
}: UseBoardMutationsOptions) => {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const createMutation = useMutation({
    mutationFn: async (vars: {
      template: WhiteboardTemplate;
      name: string;
    }) => {
      const { data } = await axiosInstance.post<BoardSummary>(
        `/workspace/${workspaceId}/whiteboards`,
        { name: vars.name, elements: vars.template.elements },
      );
      return data;
    },
    onSuccess: (created) => {
      queryClient.setQueryData<BoardSummary[]>(
        boardsKeys.list(workspaceId),
        (prev) => (prev ? [...prev, created] : [created]),
      );
      setSelectedId(created.id);
    },
  });

  const renameMutation = useMutation({
    mutationFn: async (vars: { boardId: string; name: string }) => {
      await axiosInstance.patch(`/whiteboards/${vars.boardId}/rename`, {
        name: vars.name,
      });
    },
    onMutate: async ({ boardId, name }) => {
      await queryClient.cancelQueries({
        queryKey: boardsKeys.list(workspaceId),
      });
      const snapshot = queryClient.getQueryData<BoardSummary[]>(
        boardsKeys.list(workspaceId),
      );
      queryClient.setQueryData<BoardSummary[]>(
        boardsKeys.list(workspaceId),
        (prev) => prev?.map((b) => (b.id === boardId ? { ...b, name } : b)),
      );
      return { snapshot };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.snapshot) {
        queryClient.setQueryData(boardsKeys.list(workspaceId), ctx.snapshot);
      }
    },
  });

  const duplicateMutation = useMutation({
    mutationFn: async (board: BoardSummary) => {
      const { data } = await axiosInstance.post<BoardSummary>(
        `/whiteboards/${board.id}/duplicate`,
      );
      return data;
    },
    onSuccess: (created) => {
      queryClient.setQueryData<BoardSummary[]>(
        boardsKeys.list(workspaceId),
        (prev) => (prev ? [...prev, created] : [created]),
      );
      setSelectedId(created.id);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (board: BoardSummary) => {
      await axiosInstance.delete(`/whiteboards/${board.id}`);
      return board;
    },
    onSuccess: async (deleted) => {
      const current =
        queryClient.getQueryData<BoardSummary[]>(
          boardsKeys.list(workspaceId),
        ) ?? [];
      const remaining = current.filter((b) => b.id !== deleted.id);

      // If we just removed the last board, bootstrap a fresh default so
      // the canvas always has something to render.
      if (remaining.length === 0) {
        const created = await bootstrapDefaultBoard(workspaceId);
        queryClient.setQueryData<BoardSummary[]>(boardsKeys.list(workspaceId), [
          created,
        ]);
        setSelectedId(created.id);
        return;
      }

      queryClient.setQueryData<BoardSummary[]>(
        boardsKeys.list(workspaceId),
        remaining,
      );
      setSelectedId((prev) => (prev === deleted.id ? remaining[0].id : prev));
    },
  });

  const wrap = useCallback(
    async (operation: () => Promise<unknown>, fallback: string) => {
      try {
        await operation();
      } catch {
        setError(fallback);
      }
    },
    [],
  );

  const createBoard = useCallback(
    (template: WhiteboardTemplate, name: string) =>
      wrap(
        () => createMutation.mutateAsync({ template, name }),
        "Could not create board.",
      ),
    [createMutation, wrap],
  );

  const duplicateBoard = useCallback(
    (board: BoardSummary) =>
      wrap(() => duplicateMutation.mutateAsync(board), "Could not duplicate board."),
    [duplicateMutation, wrap],
  );

  const deleteBoard = useCallback(
    (board: BoardSummary) =>
      wrap(() => deleteMutation.mutateAsync(board), "Could not delete board."),
    [deleteMutation, wrap],
  );

  const clearError = useCallback(() => setError(null), []);

  return {
    error,
    creating: createMutation.isPending,
    createBoard,
    renameMutation,
    duplicateBoard,
    deleteBoard,
    clearError,
  };
};
