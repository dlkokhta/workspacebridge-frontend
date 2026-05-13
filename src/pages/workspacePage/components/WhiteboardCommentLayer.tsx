import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { MessageSquare, MessageSquarePlus, Trash2, X } from "lucide-react";
import type { OrderedExcalidrawElement } from "@excalidraw/excalidraw/element/types";
import {
  useWhiteboardComments,
  type WhiteboardComment,
} from "../../../hooks/useWhiteboardComments";

interface WhiteboardCommentLayerProps {
  boardId: string;
  currentUserId: string | null;
  elements: readonly OrderedExcalidrawElement[];
  scrollX: number;
  scrollY: number;
  zoom: number;
  selectedElementId: string | null;
}

interface ScreenPoint {
  x: number;
  y: number;
}

const sceneToScreen = (
  sceneX: number,
  sceneY: number,
  scrollX: number,
  scrollY: number,
  zoom: number,
): ScreenPoint => ({
  x: (sceneX + scrollX) * zoom,
  y: (sceneY + scrollY) * zoom,
});

const formatAuthor = (comment: WhiteboardComment): string => {
  const { firstname, lastname, email } = comment.author;
  if (firstname && lastname) return `${firstname} ${lastname[0]}.`;
  if (firstname) return firstname;
  if (lastname) return lastname;
  return email.split("@")[0];
};

const formatTime = (iso: string): string => {
  const date = new Date(iso);
  const now = Date.now();
  const diffMs = now - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString();
};

interface CommentPinProps {
  point: ScreenPoint;
  count: number;
  isActive: boolean;
  onClick: () => void;
}

const CommentPin = ({ point, count, isActive, onClick }: CommentPinProps) => (
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

interface AddCommentButtonProps {
  point: ScreenPoint;
  onClick: () => void;
}

const AddCommentButton = ({ point, onClick }: AddCommentButtonProps) => (
  <button
    onClick={onClick}
    style={{ left: point.x, top: point.y }}
    className="absolute z-20 -translate-y-1/2 translate-x-1 inline-flex items-center gap-1 h-7 px-2.5 rounded-full text-[11px] font-medium bg-white dark:bg-[#1a201c] text-[#1a201c] dark:text-[#fafaf7] border border-[#5a8a6b] shadow-md hover:bg-[#5a8a6b] hover:text-white cursor-pointer"
  >
    <MessageSquarePlus size={12} /> Add comment
  </button>
);

interface CommentPopoverProps {
  point: ScreenPoint;
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

const CommentPopover = ({
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
                      {formatAuthor(comment)}
                    </span>
                    <span className="text-[10px] text-[#858c87] dark:text-[#6e7672]">
                      {formatTime(comment.createdAt)}
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

export const WhiteboardCommentLayer = ({
  boardId,
  currentUserId,
  elements,
  scrollX,
  scrollY,
  zoom,
  selectedElementId,
}: WhiteboardCommentLayerProps) => {
  const {
    commentsByElement,
    addComment,
    deleteComment,
  } = useWhiteboardComments(boardId);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [openElementId, setOpenElementId] = useState<string | null>(null);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;
    const updateSize = () => {
      setContainerSize({
        width: node.clientWidth,
        height: node.clientHeight,
      });
    };
    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const elementsById = useMemo(() => {
    const map = new Map<string, OrderedExcalidrawElement>();
    for (const element of elements) {
      if (!element.isDeleted) map.set(element.id, element);
    }
    return map;
  }, [elements]);

  const pins = useMemo(() => {
    const result: Array<{
      element: OrderedExcalidrawElement;
      count: number;
    }> = [];
    for (const [elementId, list] of commentsByElement) {
      const element = elementsById.get(elementId);
      if (!element || list.length === 0) continue;
      result.push({ element, count: list.length });
    }
    return result;
  }, [commentsByElement, elementsById]);

  const selectedElement = selectedElementId
    ? elementsById.get(selectedElementId) ?? null
    : null;
  const selectedHasComments = selectedElementId
    ? commentsByElement.has(selectedElementId)
    : false;

  const openElement = openElementId ? elementsById.get(openElementId) : null;
  const openComments = openElementId
    ? commentsByElement.get(openElementId) ?? []
    : [];

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none"
    >
      <div className="absolute inset-0">
        {pins.map(({ element, count }) => {
          const point = sceneToScreen(
            element.x + element.width,
            element.y,
            scrollX,
            scrollY,
            zoom,
          );
          return (
            <div key={element.id} className="pointer-events-auto">
              <CommentPin
                point={point}
                count={count}
                isActive={openElementId === element.id}
                onClick={() =>
                  setOpenElementId((prev) =>
                    prev === element.id ? null : element.id,
                  )
                }
              />
            </div>
          );
        })}

        {selectedElement &&
          !selectedHasComments &&
          openElementId !== selectedElement.id && (
            <div className="pointer-events-auto">
              <AddCommentButton
                point={sceneToScreen(
                  selectedElement.x + selectedElement.width,
                  selectedElement.y,
                  scrollX,
                  scrollY,
                  zoom,
                )}
                onClick={() => setOpenElementId(selectedElement.id)}
              />
            </div>
          )}

        {openElement && (
          <div className="pointer-events-auto">
            <CommentPopover
              point={sceneToScreen(
                openElement.x + openElement.width,
                openElement.y,
                scrollX,
                scrollY,
                zoom,
              )}
              containerWidth={containerSize.width}
              containerHeight={containerSize.height}
              comments={openComments}
              currentUserId={currentUserId}
              onClose={() => setOpenElementId(null)}
              onAdd={(body) => addComment(openElement.id, body)}
              onDelete={(commentId) => deleteComment(commentId)}
            />
          </div>
        )}
      </div>
    </div>
  );
};
