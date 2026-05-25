import { useCallback, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../../../context/AuthContext";
import {
  extractFilesError,
  filesKeys,
  type DownloadResponse,
  type FileSummary,
  type TrashedFile,
} from "./filesKeys";

export const useFilesList = (workspaceId: string) => {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const listQuery = useQuery({
    queryKey: filesKeys.list(workspaceId),
    queryFn: async () => {
      const { data } = await axiosInstance.get<FileSummary[]>(
        `/workspace/${workspaceId}/files`,
      );
      return data;
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const form = new FormData();
      form.append("file", file);
      const { data } = await axiosInstance.post<FileSummary>(
        `/workspace/${workspaceId}/files`,
        form,
        {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (event) => {
            if (event.total) {
              setUploadProgress(
                Math.round((event.loaded / event.total) * 100),
              );
            }
          },
        },
      );
      return data;
    },
    onSuccess: (created) => {
      queryClient.setQueryData<FileSummary[]>(
        filesKeys.list(workspaceId),
        (prev) => (prev ? [created, ...prev] : [created]),
      );
    },
    onSettled: () => {
      setUploadProgress(0);
    },
  });

  // Delete is owned by the list hook because the user triggers it from the
  // active-files view. The mutation also seeds the trash cache so the next
  // visit to that tab shows the just-deleted file without a refetch.
  const deleteMutation = useMutation({
    mutationFn: async (fileId: string) => {
      await axiosInstance.delete(`/files/${fileId}`);
      return fileId;
    },
    onMutate: async (fileId) => {
      await queryClient.cancelQueries({
        queryKey: filesKeys.list(workspaceId),
      });
      const listSnapshot = queryClient.getQueryData<FileSummary[]>(
        filesKeys.list(workspaceId),
      );
      const removed = listSnapshot?.find((f) => f.id === fileId);
      queryClient.setQueryData<FileSummary[]>(
        filesKeys.list(workspaceId),
        (prev) => prev?.filter((f) => f.id !== fileId),
      );
      return { listSnapshot, removed };
    },
    onSuccess: (_id, _vars, ctx) => {
      if (ctx?.removed) {
        const trashed: TrashedFile = {
          ...ctx.removed,
          deletedAt: new Date().toISOString(),
        };
        queryClient.setQueryData<TrashedFile[]>(
          filesKeys.trash(workspaceId),
          (prev) => (prev ? [trashed, ...prev] : prev),
        );
      }
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.listSnapshot) {
        queryClient.setQueryData(
          filesKeys.list(workspaceId),
          ctx.listSnapshot,
        );
      }
    },
  });

  const uploadFile = useCallback(
    async (file: File) => {
      setError(null);
      try {
        await uploadMutation.mutateAsync(file);
      } catch (err) {
        const message = extractFilesError(err) ?? "Could not upload file.";
        setError(message);
        throw new Error(message);
      }
    },
    [uploadMutation],
  );

  const downloadFile = useCallback(async (fileId: string) => {
    try {
      const { data } = await axiosInstance.get<DownloadResponse>(
        `/files/${fileId}/download`,
      );
      const link = document.createElement("a");
      link.href = data.url;
      link.download = data.name;
      link.rel = "noopener noreferrer";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      setError(extractFilesError(err) ?? "Could not download file.");
    }
  }, []);

  const deleteFile = useCallback(
    async (fileId: string) => {
      try {
        await deleteMutation.mutateAsync(fileId);
      } catch (err) {
        setError(extractFilesError(err) ?? "Could not delete file.");
      }
    },
    [deleteMutation],
  );

  const clearError = useCallback(() => setError(null), []);

  const queryError = listQuery.error
    ? (extractFilesError(listQuery.error) ?? "Could not load files.")
    : null;

  return {
    files: listQuery.data ?? null,
    loading: listQuery.isLoading,
    error: error ?? queryError,
    uploading: uploadMutation.isPending,
    uploadProgress,
    uploadFile,
    downloadFile,
    deleteFile,
    clearError,
  };
};
