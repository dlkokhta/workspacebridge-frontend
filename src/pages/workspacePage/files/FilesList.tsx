import type { FileSummary } from "./useFiles";
import { FileCardActions } from "./FileCardActions";
import {
  formatBytes,
  formatRelativeTime,
  formatUploader,
  getFileKindInfo,
} from "./fileHelpers";

const LIST_GRID = "1fr 110px 90px 130px 90px 40px";

interface FilesListProps {
  files: FileSummary[];
  canDelete: (file: FileSummary) => boolean;
  onDownload: (fileId: string) => void;
  onDeleteRequest: (file: FileSummary) => void;
  onCommentsRequest: (file: FileSummary) => void;
}

export const FilesList = ({
  files,
  canDelete,
  onDownload,
  onDeleteRequest,
  onCommentsRequest,
}: FilesListProps) => (
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
            onClick={() => onDownload(file.id)}
            className="flex items-center gap-2.5 min-w-0 cursor-pointer text-left"
          >
            <Icon size={14} style={{ color: info.color }} />
            <span className="truncate text-[#1a201c] dark:text-[#e8ece9]">
              {file.name}
            </span>
          </button>
          <span className="text-[#5a625e] dark:text-[#a0a8a3]">
            {info.label}
          </span>
          <span className="text-[#5a625e] dark:text-[#a0a8a3]">
            {formatBytes(file.size)}
          </span>
          <span className="text-[#5a625e] dark:text-[#a0a8a3]">
            {formatRelativeTime(file.createdAt)}
          </span>
          <span className="text-[#5a625e] dark:text-[#a0a8a3] truncate">
            {formatUploader(file.uploadedBy)}
          </span>
          <FileCardActions
            canDelete={canDelete(file)}
            onDownload={() => onDownload(file.id)}
            onDelete={() => onDeleteRequest(file)}
            onComments={() => onCommentsRequest(file)}
          />
        </div>
      );
    })}
  </div>
);
