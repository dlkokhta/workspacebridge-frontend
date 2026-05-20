import { useEffect, useState } from "react";
import { Grid3X3, List, Trash2, X } from "lucide-react";
import { useFiles, type FileSummary, type TrashedFile } from "./useFiles";
import { FileUploadZone } from "./FileUploadZone";
import { DeleteFileModal } from "./DeleteFileModal";
import { PurgeFileModal } from "./PurgeFileModal";
import { TrashList } from "./TrashList";
import { FilesGrid } from "./FilesGrid";
import { FilesList } from "./FilesList";

interface FilesTabProps {
  workspaceId: string;
  currentUserId: string;
  workspaceOwnerId: string;
}

export const FilesTab = ({
  workspaceId,
  currentUserId,
  workspaceOwnerId,
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
  } = useFiles(workspaceId);

  const [view, setView] = useState<"grid" | "list">("grid");
  const [tab, setTab] = useState<"files" | "trash">("files");
  const [confirmDelete, setConfirmDelete] = useState<FileSummary | null>(null);
  const [confirmPurge, setConfirmPurge] = useState<TrashedFile | null>(null);

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
      <div className="px-6 py-3 border-b border-black/[0.06] dark:border-white/[0.05] flex items-center justify-between gap-3">
        <div className="flex items-center gap-1 bg-[#f3f3ee] dark:bg-[#1c221e] border border-black/[0.08] dark:border-white/[0.07] rounded-lg p-0.5">
          <button
            onClick={() => setTab("files")}
            className={`px-3 h-7 inline-flex items-center gap-1.5 rounded-md text-[12px] font-medium transition-colors cursor-pointer ${
              tab === "files"
                ? "bg-white dark:bg-[#2a342e] text-[#1a201c] dark:text-[#e8ece9]"
                : "text-[#5a625e] dark:text-[#a0a8a3] hover:bg-black/[0.04] dark:hover:bg-white/[0.04]"
            }`}
          >
            Files
            {files && (
              <span className="text-[11px] font-normal text-[#858c87] dark:text-[#6e7672]">
                {files.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setTab("trash")}
            className={`px-3 h-7 inline-flex items-center gap-1.5 rounded-md text-[12px] font-medium transition-colors cursor-pointer ${
              tab === "trash"
                ? "bg-white dark:bg-[#2a342e] text-[#1a201c] dark:text-[#e8ece9]"
                : "text-[#5a625e] dark:text-[#a0a8a3] hover:bg-black/[0.04] dark:hover:bg-white/[0.04]"
            }`}
          >
            <Trash2 size={12} /> Trash
            {trashedFiles && (
              <span className="text-[11px] font-normal text-[#858c87] dark:text-[#6e7672]">
                {trashedFiles.length}
              </span>
            )}
          </button>
        </div>
        {tab === "files" && (
          <div className="flex bg-[#f3f3ee] dark:bg-[#1c221e] border border-black/[0.08] dark:border-white/[0.07] rounded-lg p-0.5">
            <button
              onClick={() => setView("grid")}
              className={`w-7 h-7 flex items-center justify-center rounded-md transition-colors cursor-pointer ${
                view === "grid"
                  ? "bg-white dark:bg-[#2a342e] text-[#1a201c] dark:text-[#e8ece9]"
                  : "text-[#5a625e] dark:text-[#a0a8a3] hover:bg-black/[0.04] dark:hover:bg-white/[0.04]"
              }`}
            >
              <Grid3X3 size={13} />
            </button>
            <button
              onClick={() => setView("list")}
              className={`w-7 h-7 flex items-center justify-center rounded-md transition-colors cursor-pointer ${
                view === "list"
                  ? "bg-white dark:bg-[#2a342e] text-[#1a201c] dark:text-[#e8ece9]"
                  : "text-[#5a625e] dark:text-[#a0a8a3] hover:bg-black/[0.04] dark:hover:bg-white/[0.04]"
              }`}
            >
              <List size={13} />
            </button>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-6 bg-[#fafaf7] dark:bg-[#0e1310] space-y-4">
        {tab === "files" && (
          <div className="relative">
            <FileUploadZone
              uploading={uploading}
              uploadProgress={uploadProgress}
              onUpload={uploadFile}
            />
          </div>
        )}

        {error && (
          <div className="flex items-start gap-2 px-4 py-3 rounded-lg bg-[#c25a4a]/10 border border-[#c25a4a]/30 text-[12px] text-[#c25a4a]">
            <span className="flex-1">{error}</span>
            <button
              onClick={clearError}
              aria-label="Dismiss"
              className="text-[#c25a4a] hover:opacity-70 cursor-pointer"
            >
              <X size={14} />
            </button>
          </div>
        )}

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
          />
        ) : (
          <FilesList
            files={files}
            canDelete={canDelete}
            onDownload={(fileId) => void downloadFile(fileId)}
            onDeleteRequest={setConfirmDelete}
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
    </div>
  );
};
