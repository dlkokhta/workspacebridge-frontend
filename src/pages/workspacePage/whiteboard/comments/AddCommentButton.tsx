import { MessageSquarePlus } from "lucide-react";

interface AddCommentButtonProps {
  point: { x: number; y: number };
  onClick: () => void;
}

export const AddCommentButton = ({ point, onClick }: AddCommentButtonProps) => (
  <button
    onClick={onClick}
    style={{ left: point.x, top: point.y }}
    className="absolute z-20 -translate-y-1/2 translate-x-1 inline-flex items-center gap-1 h-7 px-2.5 rounded-full text-[11px] font-medium bg-white dark:bg-[#1a201c] text-[#1a201c] dark:text-[#fafaf7] border border-[#5a8a6b] shadow-md hover:bg-[#5a8a6b] hover:text-white cursor-pointer"
  >
    <MessageSquarePlus size={12} /> Add comment
  </button>
);
