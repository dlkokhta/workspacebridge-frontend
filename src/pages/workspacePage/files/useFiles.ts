import { useCallback, useState } from "react";
import { isAxiosError } from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../../../context/AuthContext";

export interface FileSummary {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  // null when the original uploader has deleted their account — the file
  // itself stays in the workspace (see schema.prisma onDelete: SetNull).
  uploadedBy: {
    id: string;
    firstname: string | null;
    lastname: string | null;
    email: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}

export interface TrashedFile extends FileSummary {
  deletedAt: string;
}

interface DownloadResponse {
  url: string;
  expiresIn: number;
  name: string;
}

interface UseFilesResult {
  files: FileSummary[] | null;
  loading: boolean;
  error: string | null;
  uploading: boolean;
  uploadProgress: number;
  uploadFile: (file: File) => Promise<void>;
  downloadFile: (fileId: string) => Promise<void>;
  deleteFile: (fileId: string) => Promise<void>;
  trashedFiles: TrashedFile[] | null;
  trashLoading: boolean;
  loadTrash: () => Promise<void>;
  restoreFile: (fileId: string) => Promise<void>;
  purgeFile: (fileId: string) => Promise<void>;
  clearError: () => void;
}

const extractApiError = (err: unknown): string | null => {
  if (isAxiosError(err)) {
    const data = err.response?.data as { message?: string | string[] } | undefined;
    const msg = data?.message;
    if (Array.isArray(msg)) return msg.join(", ");
    return msg ?? null;
  }
  return null;
};

const keys = {
  list: (workspaceId: string) => ["files", workspaceId] as const,
  trash: (workspaceId: string) => ["files-trash", workspaceId] as const,
};

export const useFiles = (workspaceId: string): UseFilesResult => {
  const queryClient = useQueryClient();
  const [mutationError, setMutationError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const listQuery = useQuery({
    queryKey: keys.list(workspaceId),
    queryFn: async () => {
      const { data } = await axiosInstance.get<FileSummary[]>(
        `/workspace/${workspaceId}/files`,
      );
      return data;
    },
  });

  // Trash is fetched on demand via loadTrash(), not eagerly on mount.
  const trashQuery = useQuery({
    queryKey: keys.trash(workspaceId),
    queryFn: async () => {
      const { data } = await axiosInstance.get<TrashedFile[]>(
        `/workspace/${workspaceId}/files/trash`,
      );
      return data;
    },
    enabled: false,
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
      queryClient.setQueryData<FileSummary[]>(keys.list(workspaceId), (prev) =>
        prev ? [created, ...prev] : [created],
      );
    },
    onSettled: () => {
      setUploadProgress(0);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (fileId: string) => {
      await axiosInstance.delete(`/files/${fileId}`);
      return fileId;
    },
    onMutate: async (fileId) => {
      await queryClient.cancelQueries({ queryKey: keys.list(workspaceId) });
      const listSnapshot = queryClient.getQueryData<FileSummary[]>(
        keys.list(workspaceId),
      );
      const removed = listSnapshot?.find((f) => f.id === fileId);
      queryClient.setQueryData<FileSummary[]>(keys.list(workspaceId), (prev) =>
        prev?.filter((f) => f.id !== fileId),
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
          keys.trash(workspaceId),
          (prev) => (prev ? [trashed, ...prev] : prev),
        );
      }
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.listSnapshot) {
        queryClient.setQueryData(keys.list(workspaceId), ctx.listSnapshot);
      }
    },
  });

  const restoreMutation = useMutation({
    mutationFn: async (fileId: string) => {
      const { data } = await axiosInstance.post<FileSummary>(
        `/files/${fileId}/restore`,
      );
      return data;
    },
    onMutate: async (fileId) => {
      await queryClient.cancelQueries({ queryKey: keys.trash(workspaceId) });
      const trashSnapshot = queryClient.getQueryData<TrashedFile[]>(
        keys.trash(workspaceId),
      );
      queryClient.setQueryData<TrashedFile[]>(keys.trash(workspaceId), (prev) =>
        prev?.filter((f) => f.id !== fileId),
      );
      return { trashSnapshot };
    },
    onSuccess: (restored) => {
      queryClient.setQueryData<FileSummary[]>(keys.list(workspaceId), (prev) =>
        prev ? [restored, ...prev] : [restored],
      );
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.trashSnapshot) {
        queryClient.setQueryData(keys.trash(workspaceId), ctx.trashSnapshot);
      }
    },
  });

  const purgeMutation = useMutation({
    mutationFn: async (fileId: string) => {
      await axiosInstance.delete(`/files/${fileId}/purge`);
      return fileId;
    },
    onMutate: async (fileId) => {
      await queryClient.cancelQueries({ queryKey: keys.trash(workspaceId) });
      const trashSnapshot = queryClient.getQueryData<TrashedFile[]>(
        keys.trash(workspaceId),
      );
      queryClient.setQueryData<TrashedFile[]>(keys.trash(workspaceId), (prev) =>
        prev?.filter((f) => f.id !== fileId),
      );
      return { trashSnapshot };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.trashSnapshot) {
        queryClient.setQueryData(keys.trash(workspaceId), ctx.trashSnapshot);
      }
    },
  });

  const uploadFile = useCallback(
    async (file: File) => {
      setMutationError(null);
      try {
        await uploadMutation.mutateAsync(file);
      } catch (err) {
        const message = extractApiError(err) ?? "Could not upload file.";
        setMutationError(message);
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
      setMutationError(extractApiError(err) ?? "Could not download file.");
    }
  }, []);

  const deleteFile = useCallback(
    async (fileId: string) => {
      try {
        await deleteMutation.mutateAsync(fileId);
      } catch (err) {
        setMutationError(extractApiError(err) ?? "Could not delete file.");
      }
    },
    [deleteMutation],
  );

  const loadTrash = useCallback(async () => {
    const result = await trashQuery.refetch();
    if (result.error) {
      setMutationError(extractApiError(result.error) ?? "Could not load trash.");
    }
  }, [trashQuery]);

  const restoreFile = useCallback(
    async (fileId: string) => {
      try {
        await restoreMutation.mutateAsync(fileId);
      } catch (err) {
        setMutationError(extractApiError(err) ?? "Could not restore file.");
      }
    },
    [restoreMutation],
  );

  const purgeFile = useCallback(
    async (fileId: string) => {
      try {
        await purgeMutation.mutateAsync(fileId);
      } catch (err) {
        setMutationError(
          extractApiError(err) ?? "Could not permanently delete file.",
        );
      }
    },
    [purgeMutation],
  );

  const clearError = useCallback(() => setMutationError(null), []);

  const queryError = listQuery.error
    ? (extractApiError(listQuery.error) ?? "Could not load files.")
    : null;

  return {
    files: listQuery.data ?? null,
    loading: listQuery.isLoading,
    error: mutationError ?? queryError,
    uploading: uploadMutation.isPending,
    uploadProgress,
    uploadFile,
    downloadFile,
    deleteFile,
    trashedFiles: trashQuery.data ?? null,
    trashLoading: trashQuery.isFetching,
    loadTrash,
    restoreFile,
    purgeFile,
    clearError,
  };
};
