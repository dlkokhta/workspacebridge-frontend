import { useCallback, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../../../context/AuthContext";
import {
  extractFilesError,
  filesKeys,
  type FileSummary,
  type TrashedFile,
} from "./filesKeys";

export const useFileTrash = (workspaceId: string) => {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  // Trash is fetched on demand via loadTrash(), not eagerly on mount.
  const trashQuery = useQuery({
    queryKey: filesKeys.trash(workspaceId),
    queryFn: async () => {
      const { data } = await axiosInstance.get<TrashedFile[]>(
        `/workspace/${workspaceId}/files/trash`,
      );
      return data;
    },
    enabled: false,
  });

  // Restoring removes from trash and re-seeds the active files cache so
  // the Files tab reflects the restored item immediately.
  const restoreMutation = useMutation({
    mutationFn: async (fileId: string) => {
      const { data } = await axiosInstance.post<FileSummary>(
        `/files/${fileId}/restore`,
      );
      return data;
    },
    onMutate: async (fileId) => {
      await queryClient.cancelQueries({
        queryKey: filesKeys.trash(workspaceId),
      });
      const trashSnapshot = queryClient.getQueryData<TrashedFile[]>(
        filesKeys.trash(workspaceId),
      );
      queryClient.setQueryData<TrashedFile[]>(
        filesKeys.trash(workspaceId),
        (prev) => prev?.filter((f) => f.id !== fileId),
      );
      return { trashSnapshot };
    },
    onSuccess: (restored) => {
      queryClient.setQueryData<FileSummary[]>(
        filesKeys.list(workspaceId),
        (prev) => (prev ? [restored, ...prev] : [restored]),
      );
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.trashSnapshot) {
        queryClient.setQueryData(
          filesKeys.trash(workspaceId),
          ctx.trashSnapshot,
        );
      }
    },
  });

  // Permanent deletion — no cache except trash to update.
  const purgeMutation = useMutation({
    mutationFn: async (fileId: string) => {
      await axiosInstance.delete(`/files/${fileId}/purge`);
      return fileId;
    },
    onMutate: async (fileId) => {
      await queryClient.cancelQueries({
        queryKey: filesKeys.trash(workspaceId),
      });
      const trashSnapshot = queryClient.getQueryData<TrashedFile[]>(
        filesKeys.trash(workspaceId),
      );
      queryClient.setQueryData<TrashedFile[]>(
        filesKeys.trash(workspaceId),
        (prev) => prev?.filter((f) => f.id !== fileId),
      );
      return { trashSnapshot };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.trashSnapshot) {
        queryClient.setQueryData(
          filesKeys.trash(workspaceId),
          ctx.trashSnapshot,
        );
      }
    },
  });

  const loadTrash = useCallback(async () => {
    const result = await trashQuery.refetch();
    if (result.error) {
      setError(extractFilesError(result.error) ?? "Could not load trash.");
    }
  }, [trashQuery]);

  const restoreFile = useCallback(
    async (fileId: string) => {
      try {
        await restoreMutation.mutateAsync(fileId);
      } catch (err) {
        setError(extractFilesError(err) ?? "Could not restore file.");
      }
    },
    [restoreMutation],
  );

  const purgeFile = useCallback(
    async (fileId: string) => {
      try {
        await purgeMutation.mutateAsync(fileId);
      } catch (err) {
        setError(
          extractFilesError(err) ?? "Could not permanently delete file.",
        );
      }
    },
    [purgeMutation],
  );

  const clearError = useCallback(() => setError(null), []);

  return {
    trashedFiles: trashQuery.data ?? null,
    trashLoading: trashQuery.isFetching,
    error,
    loadTrash,
    restoreFile,
    purgeFile,
    clearError,
  };
};
