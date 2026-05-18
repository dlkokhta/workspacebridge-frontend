import { useCallback, useRef, useState, type DragEvent } from "react";
import { Plus, Upload } from "lucide-react";

interface FileUploadZoneProps {
  uploading: boolean;
  uploadProgress: number;
  onUpload: (file: File) => Promise<void>;
}

export const FileUploadZone = ({
  uploading,
  uploadProgress,
  onUpload,
}: FileUploadZoneProps) => {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleFiles = useCallback(
    async (fileList: FileList | null) => {
      if (!fileList || fileList.length === 0) return;
      for (const file of Array.from(fileList)) {
        try {
          await onUpload(file);
        } catch {
          break;
        }
      }
    },
    [onUpload],
  );

  const onDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!uploading) setDragOver(true);
  };

  const onDragLeave = () => setDragOver(false);

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    if (uploading) return;
    void handleFiles(e.dataTransfer.files);
  };

  return (
    <div
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={`flex items-center justify-between gap-4 px-5 py-3 rounded-xl border-2 border-dashed transition-colors ${
        dragOver
          ? "border-[#5a8a6b] bg-[#5a8a6b]/[0.08]"
          : "border-black/[0.1] dark:border-white/[0.08] bg-white dark:bg-[#151a17]"
      }`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <Upload size={18} className="text-[#5a8a6b] shrink-0" />
        <div className="min-w-0">
          <p className="text-[13px] font-medium text-[#1a201c] dark:text-[#fafaf7]">
            {uploading ? `Uploading… ${uploadProgress}%` : "+"}
          </p>
          <p className="text-[11px] text-[#858c87] dark:text-[#6e7672] truncate">
            PDF, images, video, design files, archives — limits depend on your plan.
          </p>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => {
          void handleFiles(e.target.files);
          if (inputRef.current) inputRef.current.value = "";
        }}
      />
      <button
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="h-9 px-4 inline-flex items-center gap-1.5 rounded-lg bg-[#5a8a6b] hover:bg-[#4d7a5e] text-white text-[13px] font-medium transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed shrink-0"
      >
        <Plus size={14} /> Upload
      </button>

      {uploading && (
        <div className="absolute left-0 right-0 bottom-0 h-0.5 bg-[#5a8a6b]/20 rounded-b-xl overflow-hidden">
          <div
            className="h-full bg-[#5a8a6b] transition-all"
            style={{ width: `${uploadProgress}%` }}
          />
        </div>
      )}
    </div>
  );
};
