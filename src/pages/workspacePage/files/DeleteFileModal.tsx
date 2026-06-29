import { createPortal } from "react-dom";

interface DeleteFileModalProps {
  fileName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const DeleteFileModal = ({
  fileName,
  onConfirm,
  onCancel,
}: DeleteFileModalProps) =>
  createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white dark:bg-[#1a201c] rounded-xl shadow-xl border border-black/[0.08] dark:border-white/[0.07] p-6 w-[320px] flex flex-col gap-4">
        <p className="text-[14px] font-semibold text-[#1a201c] dark:text-[#fafaf7]">
          Delete file
        </p>
        <div className="flex flex-col gap-1 text-[13px] text-[#5a625e] dark:text-[#a0a8a3]">
          <p>Are you sure you want to delete this file?</p>
          {/* Long names are truncated to keep the modal width; the full name
              stays available via the native title tooltip on hover. */}
          <p
            className="truncate font-medium text-[#1a201c] dark:text-[#fafaf7]"
            title={fileName}
          >
            {fileName}
          </p>
          <p>You can recover it for 30 days.</p>
        </div>
        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-1.5 rounded-lg text-[13px] font-medium border border-black/[0.1] dark:border-white/[0.1] text-[#5a625e] dark:text-[#a0a8a3] hover:bg-black/[0.04] dark:hover:bg-white/[0.04] transition-colors cursor-pointer"
          >
            No
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-1.5 rounded-lg text-[13px] font-medium bg-[#5a8a6b] text-white hover:bg-[#4d7a5e] transition-colors cursor-pointer"
          >
            Yes, delete
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
