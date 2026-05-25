import { useCallback } from "react";
import { useFileTrash } from "./useFileTrash";
import { useFilesList } from "./useFilesList";

// Re-export shared types so existing consumers keep their import paths.
export type { FileSummary, TrashedFile } from "./filesKeys";

interface UseFilesResult {
  files: ReturnType<typeof useFilesList>["files"];
  loading: boolean;
  error: string | null;
  uploading: boolean;
  uploadProgress: number;
  uploadFile: ReturnType<typeof useFilesList>["uploadFile"];
  downloadFile: ReturnType<typeof useFilesList>["downloadFile"];
  deleteFile: ReturnType<typeof useFilesList>["deleteFile"];
  trashedFiles: ReturnType<typeof useFileTrash>["trashedFiles"];
  trashLoading: boolean;
  loadTrash: ReturnType<typeof useFileTrash>["loadTrash"];
  restoreFile: ReturnType<typeof useFileTrash>["restoreFile"];
  purgeFile: ReturnType<typeof useFileTrash>["purgeFile"];
  clearError: () => void;
}

export const useFiles = (workspaceId: string): UseFilesResult => {
  const list = useFilesList(workspaceId);
  const trash = useFileTrash(workspaceId);

  const clearError = useCallback(() => {
    list.clearError();
    trash.clearError();
  }, [list, trash]);

  return {
    files: list.files,
    loading: list.loading,
    error: list.error ?? trash.error,
    uploading: list.uploading,
    uploadProgress: list.uploadProgress,
    uploadFile: list.uploadFile,
    downloadFile: list.downloadFile,
    deleteFile: list.deleteFile,
    trashedFiles: trash.trashedFiles,
    trashLoading: trash.trashLoading,
    loadTrash: trash.loadTrash,
    restoreFile: trash.restoreFile,
    purgeFile: trash.purgeFile,
    clearError,
  };
};
