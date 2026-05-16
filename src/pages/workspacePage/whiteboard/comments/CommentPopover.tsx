import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { Trash2, X } from "lucide-react";
import type { WhiteboardComment } from "../../../../hooks/useWhiteboardComments";
import { formatPersonName, formatRelativeTime } from "../utils";

interface CommentPopoverProps {
  point: { x: number; y: number };
  containerWidth: number;
  containerHeight: number;
  comments: WhiteboardComment[];
  currentUserId: string | null;
  onClose: () => void;
  onAdd: (body: string) => Promise<WhiteboardComment>;
  onDelete: (commentId: string) => Promise<void>;
}

const POPOVER_WIDTH = 280;
const POPOVER_MAX_HEIGHT = 360;

export const CommentPopover = ({
  point,
  containerWidth,
  containerHeight,
  comments,
  currentUserId,
  onClose,
  onAdd,
  onDelete,
}: CommentPopoverProps) => {
  const [draft, setDraft] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const left = Math.min(
    Math.max(point.x + 16, 8),
    Math.max(8, containerWidth - POPOVER_WIDTH - 8),
  );
  const top = Math.min(
    Math.max(point.y, 8),
    Math.max(8, containerHeight - POPOVER_MAX_HEIGHT - 8),
  );

  const handleSubmit = async () => {
    const body = draft.trim();
    if (!body || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      await onAdd(body);
      setDraft("");
    } catch {
      setError("Could not save comment.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      void handleSubmit();
    }
  };

  return (
    <div
      style={{ left, top, width: POPOVER_WIDTH, maxHeight: POPOVER_MAX_HEIGHT }}
      className="absolute z-30 flex flex-col rounded-lg border border-black/[0.08] dark:border-white/[0.07] bg-white dark:bg-[#1a201c] shadow-xl overflow-hidden"
    >
      <div className="flex items-center justify-between px-3 py-2 border-b border-black/[0.06] dark:border-white/[0.05]">
        <span className="text-[12px] font-medium text-[#1a201c] dark:text-[#fafaf7]">
          {comments.length === 0
            ? "Add a comment"
            : `${comments.length} comment${comments.length === 1 ? "" : "s"}`}
        </span>
        <button
          onClick={onClose}
          aria-label="Close"
          className="h-6 w-6 inline-flex items-center justify-center rounded text-[#5a625e] dark:text-[#a0a8a3] hover:bg-black/[0.04] dark:hover:bg-white/[0.04] cursor-pointer"
        >
          <X size={14} />
        </button>
      </div>

      {comments.length > 0 && (
        <div className="flex-1 min-h-0 overflow-y-auto px-3 py-2 space-y-3">
          {comments.map((comment) => {
            const isMine = currentUserId === comment.authorId;
            return (
              <div key={comment.id} className="text-[12px]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="font-medium text-[#1a201c] dark:text-[#fafaf7]">
                      {formatPersonName(comment.author)}
                    </span>
                    <span className="text-[10px] text-[#858c87] dark:text-[#6e7672]">
                      {formatRelativeTime(comment.createdAt)}
                    </span>
                  </div>
                  {isMine && (
                    <button
                      onClick={() => void onDelete(comment.id)}
                      aria-label="Delete comment"
                      className="h-5 w-5 inline-flex items-center justify-center rounded text-[#5a625e] dark:text-[#a0a8a3] hover:text-[#c25a4a] hover:bg-black/[0.04] dark:hover:bg-white/[0.04] cursor-pointer"
                    >
                      <Trash2 size={11} />
                    </button>
                  )}
                </div>
                <p className="mt-0.5 leading-snug text-[#1a201c] dark:text-[#fafaf7] whitespace-pre-wrap break-words">
                  {comment.body}
                </p>
              </div>
            );
          })}
        </div>
      )}

      <div className="px-3 py-2 border-t border-black/[0.06] dark:border-white/[0.05] bg-black/[0.015] dark:bg-white/[0.015]">
        <textarea
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Write a comment…"
          rows={2}
          maxLength={2000}
          disabled={submitting}
          className="w-full resize-none px-2 py-1.5 rounded-md border border-black/[0.08] dark:border-white/[0.07] bg-white dark:bg-[#1a201c] text-[12px] text-[#1a201c] dark:text-[#fafaf7] placeholder:text-[#858c87] dark:placeholder:text-[#6e7672] outline-none focus:border-[#5a8a6b] disabled:opacity-50"
        />
        {error && (
          <p className="mt-1 text-[11px] text-[#c25a4a]">{error}</p>
        )}
        <div className="mt-1.5 flex items-center justify-between">
          <span className="text-[10px] text-[#858c87] dark:text-[#6e7672]">
            ⌘/Ctrl + Enter
          </span>
          <button
            onClick={() => void handleSubmit()}
            disabled={submitting || !draft.trim()}
            className="h-6 px-3 rounded-md text-[11px] font-medium bg-[#5a8a6b] text-white hover:bg-[#4d7a5d] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Saving…" : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
};
