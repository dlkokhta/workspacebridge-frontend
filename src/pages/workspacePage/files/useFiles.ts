import { useCallback, useEffect, useRef, useState } from "react";
import { isAxiosError } from "axios";
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

export const useFiles = (workspaceId: string): UseFilesResult => {
  const [files, setFiles] = useState<FileSummary[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [trashedFiles, setTrashedFiles] = useState<TrashedFile[] | null>(null);
  const [trashLoading, setTrashLoading] = useState(false);

  // Mirrors the latest workspaceId so async resolutions (uploads, deletes,
  // rollbacks) can drop their state writes when the user has switched
  // workspaces mid-request — otherwise a workspace-A response would land in
  // workspace-B's list.
  const workspaceIdRef = useRef(workspaceId);
  useEffect(() => {
    workspaceIdRef.current = workspaceId;
  }, [workspaceId]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const load = async () => {
      try {
        const { data } = await axiosInstance.get<FileSummary[]>(
          `/workspace/${workspaceId}/files`,
        );
        if (!cancelled) setFiles(data);
      } catch (err) {
        if (!cancelled) {
          setError(extractApiError(err) ?? "Could not load files.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [workspaceId]);

  const uploadFile = useCallback(
    async (file: File) => {
      const capturedWorkspaceId = workspaceId;
      setUploading(true);
      setUploadProgress(0);
      setError(null);

      try {
        const form = new FormData();
        form.append("file", file);

        const { data } = await axiosInstance.post<FileSummary>(
          `/workspace/${capturedWorkspaceId}/files`,
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
        if (workspaceIdRef.current === capturedWorkspaceId) {
          setFiles((prev) => (prev ? [data, ...prev] : [data]));
        }
      } catch (err) {
        const message = extractApiError(err) ?? "Could not upload file.";
        setError(message);
        throw new Error(message);
      } finally {
        setUploading(false);
        setUploadProgress(0);
      }
    },
    [workspaceId],
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
      setError(extractApiError(err) ?? "Could not download file.");
    }
  }, []);

  const deleteFile = useCallback(
    async (fileId: string) => {
      const capturedWorkspaceId = workspaceId;
      const snapshot = files;
      const removed = snapshot?.find((f) => f.id === fileId);
      setFiles(snapshot?.filter((f) => f.id !== fileId) ?? null);
      try {
        await axiosInstance.delete(`/files/${fileId}`);
        if (removed && workspaceIdRef.current === capturedWorkspaceId) {
          const trashed: TrashedFile = {
            ...removed,
            deletedAt: new Date().toISOString(),
          };
          setTrashedFiles((prev) => (prev ? [trashed, ...prev] : prev));
        }
      } catch (err) {
        if (workspaceIdRef.current === capturedWorkspaceId) {
          setFiles(snapshot);
        }
        setError(extractApiError(err) ?? "Could not delete file.");
      }
    },
    [files, workspaceId],
  );

  const loadTrash = useCallback(async () => {
    const capturedWorkspaceId = workspaceId;
    setTrashLoading(true);
    try {
      const { data } = await axiosInstance.get<TrashedFile[]>(
        `/workspace/${capturedWorkspaceId}/files/trash`,
      );
      if (workspaceIdRef.current === capturedWorkspaceId) {
        setTrashedFiles(data);
      }
    } catch (err) {
      setError(extractApiError(err) ?? "Could not load trash.");
    } finally {
      setTrashLoading(false);
    }
  }, [workspaceId]);

  const restoreFile = useCallback(
    async (fileId: string) => {
      const capturedWorkspaceId = workspaceId;
      const snapshot = trashedFiles;
      setTrashedFiles(snapshot?.filter((f) => f.id !== fileId) ?? null);
      try {
        const { data } = await axiosInstance.post<FileSummary>(
          `/files/${fileId}/restore`,
        );
        if (workspaceIdRef.current === capturedWorkspaceId) {
          setFiles((prev) => (prev ? [data, ...prev] : [data]));
        }
      } catch (err) {
        if (workspaceIdRef.current === capturedWorkspaceId) {
          setTrashedFiles(snapshot);
        }
        setError(extractApiError(err) ?? "Could not restore file.");
      }
    },
    [trashedFiles, workspaceId],
  );

  const purgeFile = useCallback(
    async (fileId: string) => {
      const capturedWorkspaceId = workspaceId;
      const snapshot = trashedFiles;
      setTrashedFiles(snapshot?.filter((f) => f.id !== fileId) ?? null);
      try {
        await axiosInstance.delete(`/files/${fileId}/purge`);
      } catch (err) {
        if (workspaceIdRef.current === capturedWorkspaceId) {
          setTrashedFiles(snapshot);
        }
        setError(extractApiError(err) ?? "Could not permanently delete file.");
      }
    },
    [trashedFiles, workspaceId],
  );

  const clearError = useCallback(() => setError(null), []);

  return {
    files,
    loading,
    error,
    uploading,
    uploadProgress,
    uploadFile,
    downloadFile,
    deleteFile,
    trashedFiles,
    trashLoading,
    loadTrash,
    restoreFile,
    purgeFile,
    clearError,
  };
};
