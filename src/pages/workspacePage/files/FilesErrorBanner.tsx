import { X } from "lucide-react";

interface FilesErrorBannerProps {
  message: string;
  onDismiss: () => void;
}

export const FilesErrorBanner = ({
  message,
  onDismiss,
}: FilesErrorBannerProps) => (
  <div className="flex items-start gap-2 px-4 py-3 rounded-lg bg-[#c25a4a]/10 border border-[#c25a4a]/30 text-[12px] text-[#c25a4a]">
    <span className="flex-1">{message}</span>
    <button
      onClick={onDismiss}
      aria-label="Dismiss"
      className="text-[#c25a4a] hover:opacity-70 cursor-pointer"
    >
      <X size={14} />
    </button>
  </div>
);
