import type { FileSummary } from "./useFiles";
import { FileCardActions } from "./FileCardActions";
import {
  formatBytes,
  formatRelativeTime,
  getFileKindInfo,
} from "./fileHelpers";

interface FilesGridProps {
  files: FileSummary[];
  canDelete: (file: FileSummary) => boolean;
  onDownload: (fileId: string) => void;
  onDeleteRequest: (file: FileSummary) => void;
  onCommentsRequest: (file: FileSummary) => void;
}

export const FilesGrid = ({
  files,
  canDelete,
  onDownload,
  onDeleteRequest,
  onCommentsRequest,
}: FilesGridProps) => (
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
            onClick={() => onDownload(file.id)}
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
                onDownload={() => onDownload(file.id)}
                onDelete={() => onDeleteRequest(file)}
                onComments={() => onCommentsRequest(file)}
              />
            </div>
            <div className="text-[11px] text-[#858c87] dark:text-[#6e7672]">
              {formatBytes(file.size)} · {formatRelativeTime(file.createdAt)}
            </div>
          </div>
        </div>
      );
    })}
  </div>
);
