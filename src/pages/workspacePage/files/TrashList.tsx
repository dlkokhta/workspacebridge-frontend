import { RotateCcw, Trash2 } from "lucide-react";
import type { TrashedFile } from "./useFiles";
import {
  daysRemainingInTrash,
  formatBytes,
  formatRelativeTime,
  getFileKindInfo,
} from "./fileHelpers";

interface TrashListProps {
  trashedFiles: TrashedFile[] | null;
  trashLoading: boolean;
  canRestore: (file: TrashedFile) => boolean;
  onRestore: (fileId: string) => void;
  onPurgeRequest: (file: TrashedFile) => void;
}

export const TrashList = ({
  trashedFiles,
  trashLoading,
  canRestore,
  onRestore,
  onPurgeRequest,
}: TrashListProps) => {
  if (trashLoading && trashedFiles === null) {
    return (
      <div className="text-[13px] text-[#858c87] dark:text-[#6e7672] py-10 text-center">
        Loading trash…
      </div>
    );
  }

  if (!trashedFiles || trashedFiles.length === 0) {
    return (
      <div className="text-[13px] text-[#858c87] dark:text-[#6e7672] py-10 text-center">
        Trash is empty. Deleted files are kept here for 30 days.
      </div>
    );
  }

  return (
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
                {formatBytes(file.size)} · Deleted{" "}
                {formatRelativeTime(file.deletedAt)}
                {" · "}
                <span className={daysLeft <= 3 ? "text-[#c25a4a]" : ""}>
                  {daysLeft} {daysLeft === 1 ? "day" : "days"} left
                </span>
              </div>
            </div>
            {canRestore(file) && (
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => onRestore(file.id)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-medium border border-black/[0.1] dark:border-white/[0.1] text-[#1a201c] dark:text-[#e8ece9] hover:bg-black/[0.04] dark:hover:bg-white/[0.04] cursor-pointer"
                >
                  <RotateCcw size={12} /> Restore
                </button>
                <button
                  onClick={() => onPurgeRequest(file)}
                  title="Delete permanently and free workspace storage"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-medium border border-[#c25a4a]/30 text-[#c25a4a] hover:bg-[#c25a4a]/10 cursor-pointer"
                >
                  <Trash2 size={12} /> Delete forever
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
