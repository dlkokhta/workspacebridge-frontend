import { useState } from "react";
import { createPortal } from "react-dom";
import { Trash2, X } from "lucide-react";
import { useFileComments, type FileComment } from "./useFileComments";

interface FileCommentsModalProps {
  fileId: string;
  fileName: string;
  workspaceId: string;
  currentUserId: string;
  workspaceOwnerId: string;
  onClose: () => void;
}

const authorName = (author: FileComment["author"]): string => {
  if (!author) return "Deleted user";
  const full = `${author.firstname ?? ""} ${author.lastname ?? ""}`.trim();
  return full || author.email;
};

const formatDate = (iso: string): string =>
  new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

export const FileCommentsModal = ({
  fileId,
  fileName,
  workspaceId,
  currentUserId,
  workspaceOwnerId,
  onClose,
}: FileCommentsModalProps) => {
  const {
    comments,
    loading,
    loadError,
    actionError,
    addComment,
    adding,
    deleteComment,
  } = useFileComments(fileId, workspaceId);
  const [body, setBody] = useState("");

  const canDelete = (comment: FileComment): boolean =>
    comment.author?.id === currentUserId || workspaceOwnerId === currentUserId;

  const submit = () => {
    const trimmed = body.trim();
    if (!trimmed || adding) return;
    addComment(trimmed);
    setBody("");
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white dark:bg-[#1a201c] rounded-xl shadow-xl border border-black/[0.08] dark:border-white/[0.07] w-[420px] max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-black/[0.06] dark:border-white/[0.05]">
          <p className="text-[14px] font-semibold text-[#1a201c] dark:text-[#fafaf7] truncate pr-3">
            Comments · {fileName}
          </p>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-7 h-7 inline-flex items-center justify-center rounded-md text-[#858c87] dark:text-[#6e7672] hover:bg-black/[0.06] dark:hover:bg-white/[0.06] cursor-pointer"
          >
            <X size={15} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {loading ? (
            <p className="text-[12px] text-[#858c87] dark:text-[#6e7672] text-center py-6">
              Loading comments…
            </p>
          ) : loadError ? (
            <p className="text-[12px] text-[#c25a4a] text-center py-6">
              {loadError}
            </p>
          ) : comments.length === 0 ? (
            <p className="text-[12px] text-[#858c87] dark:text-[#6e7672] text-center py-6">
              No comments yet — start the conversation.
            </p>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="group flex flex-col gap-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-[12px] font-semibold text-[#1a201c] dark:text-[#e8ece9]">
                    {authorName(comment.author)}
                  </span>
                  <span className="text-[11px] text-[#858c87] dark:text-[#6e7672]">
                    {formatDate(comment.createdAt)}
                  </span>
                  {canDelete(comment) && (
                    <button
                      onClick={() => deleteComment(comment.id)}
                      aria-label="Delete comment"
                      className="ml-auto opacity-0 group-hover:opacity-100 text-[#c25a4a] cursor-pointer transition-opacity"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
                <p className="text-[13px] text-[#5a625e] dark:text-[#a0a8a3] whitespace-pre-wrap break-words">
                  {comment.body}
                </p>
              </div>
            ))
          )}
        </div>

        {actionError && (
          <p className="px-5 text-[11px] text-[#c25a4a]">{actionError}</p>
        )}

        <div className="px-5 py-4 border-t border-black/[0.06] dark:border-white/[0.05] flex flex-col gap-2">
          <textarea
            value={body}
            onChange={(event) => setBody(event.target.value)}
            onKeyDown={(event) => {
              if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
                submit();
              }
            }}
            rows={2}
            placeholder="Write a comment…"
            className="w-full resize-none rounded-lg border border-black/[0.1] dark:border-white/[0.1] bg-[#fafaf7] dark:bg-[#0e1310] px-3 py-2 text-[13px] text-[#1a201c] dark:text-[#e8ece9] placeholder:text-[#858c87] focus:outline-none focus:border-[#5a8a6b]"
          />
          <button
            onClick={submit}
            disabled={!body.trim() || adding}
            className="self-end px-4 py-1.5 rounded-lg text-[13px] font-medium bg-[#5a8a6b] text-white hover:bg-[#4d7a5e] disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            {adding ? "Posting…" : "Comment"}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};
