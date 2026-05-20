import { createPortal } from "react-dom";

interface PurgeFileModalProps {
  fileName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const PurgeFileModal = ({
  fileName,
  onConfirm,
  onCancel,
}: PurgeFileModalProps) =>
  createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white dark:bg-[#1a201c] rounded-xl shadow-xl border border-black/[0.08] dark:border-white/[0.07] p-6 w-[340px] flex flex-col gap-4">
        <p className="text-[14px] font-semibold text-[#1a201c] dark:text-[#fafaf7]">
          Delete permanently
        </p>
        <p className="text-[13px] text-[#5a625e] dark:text-[#a0a8a3]">
          <span className="font-medium text-[#1a201c] dark:text-[#fafaf7]">
            &ldquo;{fileName}&rdquo;
          </span>{" "}
          will be removed from storage and cannot be recovered. This frees
          space in your workspace immediately.
        </p>
        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-1.5 rounded-lg text-[13px] font-medium border border-black/[0.1] dark:border-white/[0.1] text-[#5a625e] dark:text-[#a0a8a3] hover:bg-black/[0.04] dark:hover:bg-white/[0.04] transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-1.5 rounded-lg text-[13px] font-medium bg-[#c25a4a] text-white hover:bg-[#a84e3f] transition-colors cursor-pointer"
          >
            Delete forever
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
