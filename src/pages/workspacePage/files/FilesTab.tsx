import { useEffect, useState } from "react";
import { Grid3X3, List, RotateCcw, Trash2, X } from "lucide-react";
import { useFiles, type FileSummary } from "./useFiles";
import { FileUploadZone } from "./FileUploadZone";
import { FileCardActions } from "./FileCardActions";
import { DeleteFileModal } from "./DeleteFileModal";
import {
  daysRemainingInTrash,
  formatBytes,
  formatRelativeTime,
  formatUploader,
  getFileKindInfo,
} from "./fileHelpers";

interface FilesTabProps {
  workspaceId: string;
  currentUserId: string;
  workspaceOwnerId: string;
}

const LIST_GRID = "1fr 110px 90px 130px 90px 40px";

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
    clearError,
  } = useFiles(workspaceId);

  const [view, setView] = useState<"grid" | "list">("grid");
  const [tab, setTab] = useState<"files" | "trash">("files");
  const [confirmDelete, setConfirmDelete] = useState<FileSummary | null>(null);

  useEffect(() => {
    if (tab === "trash" && trashedFiles === null && !trashLoading) {
      void loadTrash();
    }
  }, [tab, trashedFiles, trashLoading, loadTrash]);

  const canDelete = (file: FileSummary): boolean =>
    file.uploadedBy.id === currentUserId || workspaceOwnerId === currentUserId;

  const canRestore = canDelete;

  const handleConfirmDelete = async () => {
    if (!confirmDelete) return;
    const file = confirmDelete;
    setConfirmDelete(null);
    await deleteFile(file.id);
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
          trashLoading && trashedFiles === null ? (
            <div className="text-[13px] text-[#858c87] dark:text-[#6e7672] py-10 text-center">
              Loading trash…
            </div>
          ) : !trashedFiles || trashedFiles.length === 0 ? (
            <div className="text-[13px] text-[#858c87] dark:text-[#6e7672] py-10 text-center">
              Trash is empty. Deleted files are kept here for 30 days.
            </div>
          ) : (
            <div className="rounded-xl border border-black/[0.08] dark:border-white/[0.07] bg-white dark:bg-[#151a17] overflow-hidden">
              {trashedFiles.map((file) => {
                const info = getFileKindInfo(file.mimeType, file.name);
                const Icon = info.icon;
                const daysLeft = daysRemainingInTrash(file.deletedAt);
                return (
                  <div
                    key={file.id}
                    className="flex items-center gap-3 px-4 py-3 border-b border-black/[0.04] dark:border-white/[0.03] last:border-0 text-[13px] hover:bg-[#f6f6f1] dark:hover:bg-[#1a201c]/30 transition-colors"
                  >
                    <Icon size={16} style={{ color: info.color }} className="shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[#1a201c] dark:text-[#e8ece9]">
                        {file.name}
                      </div>
                      <div className="text-[11px] text-[#858c87] dark:text-[#6e7672]">
                        {formatBytes(file.size)} · Deleted {formatRelativeTime(file.deletedAt)}
                        {" · "}
                        <span className={daysLeft <= 3 ? "text-[#c25a4a]" : ""}>
                          {daysLeft} {daysLeft === 1 ? "day" : "days"} left
                        </span>
                      </div>
                    </div>
                    {canRestore(file) && (
                      <button
                        onClick={() => void restoreFile(file.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-medium border border-black/[0.1] dark:border-white/[0.1] text-[#1a201c] dark:text-[#e8ece9] hover:bg-black/[0.04] dark:hover:bg-white/[0.04] cursor-pointer"
                      >
                        <RotateCcw size={12} /> Restore
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )
        ) : loading ? (
          <div className="text-[13px] text-[#858c87] dark:text-[#6e7672] py-10 text-center">
            Loading files…
          </div>
        ) : !files || files.length === 0 ? (
          <div className="text-[13px] text-[#858c87] dark:text-[#6e7672] py-10 text-center">
            No files yet — drop one above to get started.
          </div>
        ) : view === "grid" ? (
          <div
            className="grid gap-4"
            style={{ gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))" }}
          >
            {files.map((file) => {
              const info = getFileKindInfo(file.mimeType, file.name);
              const Icon = info.icon;
              return (
                <div
                  key={file.id}
                  className="group rounded-xl border border-black/[0.08] dark:border-white/[0.07] bg-white dark:bg-[#151a17] overflow-hidden hover:border-black/[0.14] dark:hover:border-white/[0.14] transition-colors"
                >
                  <button
                    onClick={() => void downloadFile(file.id)}
                    className="w-full aspect-[16/10] bg-[#f3f3ee] dark:bg-[#0a0f0c] flex items-center justify-center border-b border-black/[0.06] dark:border-white/[0.05] cursor-pointer"
                  >
                    <Icon size={32} style={{ color: info.color }} />
                  </button>
                  <div className="p-3.5">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="text-[13px] font-medium text-[#1a201c] dark:text-[#e8ece9] truncate flex-1">
                        {file.name}
                      </div>
                      <FileCardActions
                        canDelete={canDelete(file)}
                        onDownload={() => void downloadFile(file.id)}
                        onDelete={() => setConfirmDelete(file)}
                      />
                    </div>
                    <div className="text-[11px] text-[#858c87] dark:text-[#6e7672]">
                      {formatBytes(file.size)} ·{" "}
                      {formatRelativeTime(file.createdAt)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-xl border border-black/[0.08] dark:border-white/[0.07] bg-white dark:bg-[#151a17] overflow-hidden">
            <div
              className="grid text-[11px] uppercase tracking-[0.06em] text-[#858c87] dark:text-[#6e7672] px-4 py-2.5 border-b border-black/[0.06] dark:border-white/[0.05]"
              style={{ gridTemplateColumns: LIST_GRID }}
            >
              <span>Name</span>
              <span>Kind</span>
              <span>Size</span>
              <span>Modified</span>
              <span>By</span>
              <span />
            </div>
            {files.map((file) => {
              const info = getFileKindInfo(file.mimeType, file.name);
              const Icon = info.icon;
              return (
                <div
                  key={file.id}
                  className="grid items-center px-4 py-3 border-b border-black/[0.04] dark:border-white/[0.03] last:border-0 text-[13px] hover:bg-[#f6f6f1] dark:hover:bg-[#1a201c]/30 transition-colors"
                  style={{ gridTemplateColumns: LIST_GRID }}
                >
                  <button
                    onClick={() => void downloadFile(file.id)}
                    className="flex items-center gap-2.5 min-w-0 cursor-pointer text-left"
                  >
                    <Icon size={14} style={{ color: info.color }} />
                    <span className="truncate text-[#1a201c] dark:text-[#e8ece9]">
                      {file.name}
                    </span>
                  </button>
                  <span className="text-[#5a625e] dark:text-[#a0a8a3]">{info.label}</span>
                  <span className="text-[#5a625e] dark:text-[#a0a8a3]">{formatBytes(file.size)}</span>
                  <span className="text-[#5a625e] dark:text-[#a0a8a3]">{formatRelativeTime(file.createdAt)}</span>
                  <span className="text-[#5a625e] dark:text-[#a0a8a3] truncate">{formatUploader(file.uploadedBy)}</span>
                  <FileCardActions
                    canDelete={canDelete(file)}
                    onDownload={() => void downloadFile(file.id)}
                    onDelete={() => setConfirmDelete(file)}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {confirmDelete && (
        <DeleteFileModal
          fileName={confirmDelete.name}
          onConfirm={() => void handleConfirmDelete()}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  );
};
