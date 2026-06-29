import { useEffect, useState } from "react";
import { useFiles, type FileSummary, type TrashedFile } from "./useFiles";
import { FileUploadZone } from "./FileUploadZone";
import { DeleteFileModal } from "./DeleteFileModal";
import { PurgeFileModal } from "./PurgeFileModal";
import { FileCommentsModal } from "./FileCommentsModal";
import { TrashList } from "./TrashList";
import { FilesGrid } from "./FilesGrid";
import { FilesList } from "./FilesList";
import { FilesToolbar } from "./FilesToolbar";
import { FilesErrorBanner } from "./FilesErrorBanner";

interface FilesTabProps {
  workspaceId: string;
  currentUserId: string;
  workspaceOwnerId: string;
  /** Per-file upload limit (bytes) from the workspace's owner plan. */
  maxFileSize?: number;
}

export const FilesTab = ({
  workspaceId,
  currentUserId,
  workspaceOwnerId,
  maxFileSize,
}: FilesTabProps) => {
  const {
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
  } = useFiles(workspaceId, maxFileSize);

  const [view, setView] = useState<"grid" | "list">("grid");
  const [tab, setTab] = useState<"files" | "trash">("files");
  const [confirmDelete, setConfirmDelete] = useState<FileSummary | null>(null);
  const [confirmPurge, setConfirmPurge] = useState<TrashedFile | null>(null);
  const [commentsFor, setCommentsFor] = useState<FileSummary | null>(null);

  // Lazy-load the trash list the first time the user opens that tab.
  useEffect(() => {
    if (tab === "trash" && trashedFiles === null && !trashLoading) {
      void loadTrash();
    }
  }, [tab, trashedFiles, trashLoading, loadTrash]);

  const canDelete = (file: FileSummary): boolean =>
    file.uploadedBy?.id === currentUserId ||
    workspaceOwnerId === currentUserId;

  const canRestore = canDelete;

  const handleConfirmDelete = async () => {
    if (!confirmDelete) return;
    const file = confirmDelete;
    setConfirmDelete(null);
    await deleteFile(file.id);
  };

  const handleConfirmPurge = async () => {
    if (!confirmPurge) return;
    const file = confirmPurge;
    setConfirmPurge(null);
    await purgeFile(file.id);
  };

  return (
    <div className="flex flex-col flex-1 overflow-hidden min-h-0">
      <FilesToolbar
        tab={tab}
        view={view}
        filesCount={files?.length ?? null}
        trashCount={trashedFiles?.length ?? null}
        onTabChange={setTab}
        onViewChange={setView}
      />

      <div className="flex-1 overflow-y-auto p-6 bg-[#fafaf7] dark:bg-[#0e1310] space-y-4">
        {tab === "files" && (
          <FileUploadZone
            uploading={uploading}
            uploadProgress={uploadProgress}
            onUpload={uploadFile}
            maxFileSize={maxFileSize}
          />
        )}

        {error && <FilesErrorBanner message={error} onDismiss={clearError} />}

        {tab === "trash" ? (
          <TrashList
            trashedFiles={trashedFiles}
            trashLoading={trashLoading}
            canRestore={canRestore}
            onRestore={(fileId) => void restoreFile(fileId)}
            onPurgeRequest={setConfirmPurge}
          />
        ) : loading ? (
          <div className="text-[13px] text-[#858c87] dark:text-[#6e7672] py-10 text-center">
            Loading files…
          </div>
        ) : !files || files.length === 0 ? (
          <div className="text-[13px] text-[#858c87] dark:text-[#6e7672] py-10 text-center">
            No files yet — drop one above to get started.
          </div>
        ) : view === "grid" ? (
          <FilesGrid
            files={files}
            canDelete={canDelete}
            onDownload={(fileId) => void downloadFile(fileId)}
            onDeleteRequest={setConfirmDelete}
            onCommentsRequest={setCommentsFor}
          />
        ) : (
          <FilesList
            files={files}
            canDelete={canDelete}
            onDownload={(fileId) => void downloadFile(fileId)}
            onDeleteRequest={setConfirmDelete}
            onCommentsRequest={setCommentsFor}
          />
        )}
      </div>

      {confirmDelete && (
        <DeleteFileModal
          fileName={confirmDelete.name}
          onConfirm={() => void handleConfirmDelete()}
          onCancel={() => setConfirmDelete(null)}
        />
      )}

      {confirmPurge && (
        <PurgeFileModal
          fileName={confirmPurge.name}
          onConfirm={() => void handleConfirmPurge()}
          onCancel={() => setConfirmPurge(null)}
        />
      )}

      {commentsFor && (
        <FileCommentsModal
          fileId={commentsFor.id}
          fileName={commentsFor.name}
          currentUserId={currentUserId}
          workspaceOwnerId={workspaceOwnerId}
          onClose={() => setCommentsFor(null)}
        />
      )}
    </div>
  );
};
