import { useCallback, useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../../../../context/AuthContext";
import type { WhiteboardTemplate } from "../templates";

export interface BoardSummary {
  id: string;
  name: string;
  updatedAt: string;
}

interface UseBoardsResult {
  boards: BoardSummary[] | null;
  selectedId: string | null;
  setSelectedId: (id: string) => void;
  error: string | null;
  creating: boolean;
  createBoard: (template: WhiteboardTemplate, name: string) => Promise<void>;
  renameBoard: (boardId: string, name: string) => Promise<void>;
  duplicateBoard: (board: BoardSummary) => Promise<void>;
  deleteBoard: (board: BoardSummary) => Promise<void>;
}

const keys = {
  list: (workspaceId: string) => ["whiteboards", workspaceId] as const,
};

export const useBoards = (workspaceId: string): UseBoardsResult => {
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mutationError, setMutationError] = useState<string | null>(null);

  const listQuery = useQuery({
    queryKey: keys.list(workspaceId),
    queryFn: async () => {
      const { data } = await axiosInstance.get<BoardSummary[]>(
        `/workspace/${workspaceId}/whiteboards`,
      );
      // Workspace has no boards yet — bootstrap one so the canvas always
      // has something to render.
      if (data.length === 0) {
        const { data: created } = await axiosInstance.post<BoardSummary>(
          `/workspace/${workspaceId}/whiteboards`,
          {},
        );
        return [created];
      }
      return data;
    },
  });

  // Reset selection on workspace switch so we don't carry a stale id over.
  useEffect(() => {
    setSelectedId(null);
  }, [workspaceId]);

  // First board becomes the default selection once the list arrives.
  useEffect(() => {
    if (listQuery.data && listQuery.data.length > 0) {
      setSelectedId((prev) => prev ?? listQuery.data![0].id);
    }
  }, [listQuery.data]);

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
      queryClient.setQueryData<BoardSummary[]>(keys.list(workspaceId), (prev) =>
        prev ? [...prev, created] : [created],
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
      await queryClient.cancelQueries({ queryKey: keys.list(workspaceId) });
      const snapshot = queryClient.getQueryData<BoardSummary[]>(
        keys.list(workspaceId),
      );
      queryClient.setQueryData<BoardSummary[]>(keys.list(workspaceId), (prev) =>
        prev?.map((b) => (b.id === boardId ? { ...b, name } : b)),
      );
      return { snapshot };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.snapshot) {
        queryClient.setQueryData(keys.list(workspaceId), ctx.snapshot);
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
      queryClient.setQueryData<BoardSummary[]>(keys.list(workspaceId), (prev) =>
        prev ? [...prev, created] : [created],
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
        queryClient.getQueryData<BoardSummary[]>(keys.list(workspaceId)) ?? [];
      const remaining = current.filter((b) => b.id !== deleted.id);

      // If we just removed the last board, bootstrap a fresh default so
      // the canvas always has something to render.
      if (remaining.length === 0) {
        const { data: created } = await axiosInstance.post<BoardSummary>(
          `/workspace/${workspaceId}/whiteboards`,
          {},
        );
        queryClient.setQueryData<BoardSummary[]>(keys.list(workspaceId), [
          created,
        ]);
        setSelectedId(created.id);
        return;
      }

      queryClient.setQueryData<BoardSummary[]>(
        keys.list(workspaceId),
        remaining,
      );
      setSelectedId((prev) => (prev === deleted.id ? remaining[0].id : prev));
    },
  });

  const createBoard = useCallback(
    async (template: WhiteboardTemplate, name: string) => {
      try {
        await createMutation.mutateAsync({ template, name });
      } catch {
        setMutationError("Could not create board.");
      }
    },
    [createMutation],
  );

  const renameBoard = useCallback(
    async (boardId: string, name: string) => {
      const current = listQuery.data?.find((b) => b.id === boardId);
      if (!current || current.name === name) return;
      try {
        await renameMutation.mutateAsync({ boardId, name });
      } catch {
        setMutationError("Could not rename board.");
      }
    },
    [listQuery.data, renameMutation],
  );

  const duplicateBoard = useCallback(
    async (board: BoardSummary) => {
      try {
        await duplicateMutation.mutateAsync(board);
      } catch {
        setMutationError("Could not duplicate board.");
      }
    },
    [duplicateMutation],
  );

  const deleteBoard = useCallback(
    async (board: BoardSummary) => {
      try {
        await deleteMutation.mutateAsync(board);
      } catch {
        setMutationError("Could not delete board.");
      }
    },
    [deleteMutation],
  );

  return {
    boards: listQuery.data ?? null,
    selectedId,
    setSelectedId,
    error: mutationError ?? (listQuery.error ? "Could not load whiteboards." : null),
    creating: createMutation.isPending,
    createBoard,
    renameBoard,
    duplicateBoard,
    deleteBoard,
  };
};
