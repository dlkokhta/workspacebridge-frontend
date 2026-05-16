import { MessageSquare } from "lucide-react";

interface CommentPinProps {
  point: { x: number; y: number };
  count: number;
  isActive: boolean;
  onClick: () => void;
}

export const CommentPin = ({ point, count, isActive, onClick }: CommentPinProps) => (
  <button
    onClick={onClick}
    style={{ left: point.x, top: point.y }}
    className={`absolute z-20 -translate-y-1/2 translate-x-1 inline-flex items-center justify-center h-6 min-w-6 px-1.5 rounded-full text-[11px] font-semibold shadow-md transition-colors cursor-pointer ${
      isActive
        ? "bg-[#1a201c] text-white"
        : "bg-[#5a8a6b] text-white hover:bg-[#4d7a5d]"
    }`}
    aria-label={`${count} comment${count === 1 ? "" : "s"}`}
  >
    <MessageSquare size={11} />
    <span className="ml-0.5">{count}</span>
  </button>
);
