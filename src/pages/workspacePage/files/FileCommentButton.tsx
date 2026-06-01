import { MessageSquare } from "lucide-react";

interface FileCommentButtonProps {
  count: number;
  onClick: () => void;
}

export const FileCommentButton = ({ count, onClick }: FileCommentButtonProps) => (
  <button
    onClick={(event) => {
      event.stopPropagation();
      onClick();
    }}
    aria-label="Comments"
    className="inline-flex items-center gap-1 h-7 px-1.5 rounded-md text-[11px] font-medium text-[#858c87] dark:text-[#6e7672] hover:bg-black/[0.06] dark:hover:bg-white/[0.06] cursor-pointer"
  >
    <MessageSquare size={13} />
    {count > 0 && <span>{count}</span>}
  </button>
);
