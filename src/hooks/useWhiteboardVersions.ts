import { useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../context/AuthContext";

export type WhiteboardVersionType = "MANUAL" | "AUTO";

export interface VersionAuthor {
  id: string;
  firstname: string | null;
  lastname: string | null;
  email: string;
  picture: string | null;
}

export interface WhiteboardVersionSummary {
  id: string;
  whiteboardId: string;
  label: string | null;
  type: WhiteboardVersionType;
  createdAt: string;
  createdBy: VersionAuthor;
}

export interface WhiteboardVersionDetail extends WhiteboardVersionSummary {
  elements: unknown[];
  appState: Record<string, unknown> | null;
  files: Record<string, unknown> | null;
}

export interface RestoredBoard {
  id: string;
  name: string;
  elements: unknown[];
  appState: Record<string, unknown> | null;
  files: Record<string, unknown> | null;
  updatedAt: string;
}

interface SaveVersionInput {
  label?: string;
  elements: unknown[];
  appState?: Record<string, unknown> | null;
  files?: Record<string, unknown> | null;
}

interface UseWhiteboardVersionsResult {
  versions: WhiteboardVersionSummary[];
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
  saveVersion: (input: SaveVersionInput) => Promise<WhiteboardVersionSummary>;
  getVersion: (versionId: string) => Promise<WhiteboardVersionDetail>;
  restoreVersion: (versionId: string) => Promise<RestoredBoard>;
}

const keys = {
  list: (boardId: string) => ["whiteboard-versions", boardId] as const,
};

export const useWhiteboardVersions = (
  boardId: string,
): UseWhiteboardVersionsResult => {
  const queryClient = useQueryClient();

  const listQuery = useQuery({
    queryKey: keys.list(boardId),
    queryFn: async () => {
      const { data } = await axiosInstance.get<WhiteboardVersionSummary[]>(
        `/whiteboards/${boardId}/versions`,
      );
      return data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (input: SaveVersionInput) => {
      const { data } = await axiosInstance.post<WhiteboardVersionSummary>(
        `/whiteboards/${boardId}/versions`,
        {
          label: input.label?.trim() || undefined,
          elements: input.elements,
          appState: input.appState ?? undefined,
          files: input.files ?? undefined,
        },
      );
      return data;
    },
    onSuccess: (created) => {
      queryClient.setQueryData<WhiteboardVersionSummary[]>(
        keys.list(boardId),
        (prev) =>
          prev?.some((v) => v.id === created.id)
            ? prev
            : [created, ...(prev ?? [])],
      );
    },
  });

  const saveVersion = useCallback(
    (input: SaveVersionInput) => saveMutation.mutateAsync(input),
    [saveMutation],
  );

  const getVersion = useCallback(
    async (versionId: string) => {
      const { data } = await axiosInstance.get<WhiteboardVersionDetail>(
        `/whiteboards/${boardId}/versions/${versionId}`,
      );
      return data;
    },
    [boardId],
  );

  const restoreVersion = useCallback(
    async (versionId: string) => {
      const { data } = await axiosInstance.post<RestoredBoard>(
        `/whiteboards/${boardId}/versions/${versionId}/restore`,
      );
      // Restore creates a new AUTO version on the server, so refresh the list.
      await queryClient.invalidateQueries({ queryKey: keys.list(boardId) });
      return data;
    },
    [boardId, queryClient],
  );

  const reload = useCallback(async () => {
    await listQuery.refetch();
  }, [listQuery]);

  return {
    versions: listQuery.data ?? [],
    loading: listQuery.isLoading,
    error: listQuery.error ? "Could not load version history." : null,
    reload,
    saveVersion,
    getVersion,
    restoreVersion,
  };
};
