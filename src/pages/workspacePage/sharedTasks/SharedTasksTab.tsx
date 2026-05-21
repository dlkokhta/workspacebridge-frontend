import { useState, type FormEvent, type KeyboardEvent } from "react";
import { Check, CheckSquare, Plus, Trash2 } from "lucide-react";
import { useSharedTasks } from "./useSharedTasks";
import type { Task } from "../types";

interface SharedTasksTabProps {
  workspaceId: string;
}

const formatCreatedBy = (createdBy: Task["createdBy"]): string => {
  if (!createdBy) return "Deleted user";
  const name = [createdBy.firstname, createdBy.lastname]
    .filter(Boolean)
    .join(" ");
  return name || createdBy.email;
};

const formatRelative = (iso: string): string => {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
};

export const SharedTasksTab = ({ workspaceId }: SharedTasksTabProps) => {
  const { tasks, loading, error, addTask, toggleTask, removeTask, clearError } =
    useSharedTasks(workspaceId);
  const [draft, setDraft] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const openCount = (tasks ?? []).filter((t) => t.status === "TODO").length;
  const doneCount = (tasks ?? []).filter((t) => t.status === "DONE").length;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const title = draft.trim();
    if (!title || submitting) return;
    setSubmitting(true);
    try {
      await addTask(title);
      setDraft("");
    } catch {
      // error surfaced via hook
    } finally {
      setSubmitting(false);
    }
  };

  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") setDraft("");
  };

  return (
    <div className="flex flex-col flex-1 overflow-hidden min-h-0">
      <div className="flex items-center justify-between px-6 py-3 border-b border-black/[0.06] dark:border-white/[0.05]">
        <span className="text-[13px] text-[#5a625e] dark:text-[#a0a8a3]">
          {loading
            ? "Loading…"
            : `${openCount} open · ${doneCount} done · visible to all workspace members`}
        </span>
      </div>

      {error && (
        <div className="flex items-center justify-between px-6 py-2 bg-[#c25a4a]/10 text-[12px] text-[#c25a4a] dark:text-[#e07b6b]">
          <span>{error}</span>
          <button onClick={clearError} className="underline cursor-pointer">
            dismiss
          </button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-6 bg-[#fafaf7] dark:bg-[#0e1310]">
        <form
          onSubmit={handleSubmit}
          className="flex items-center gap-2 mb-4 px-4 py-3 rounded-xl bg-white dark:bg-[#151a17] border border-black/[0.08] dark:border-white/[0.07]"
        >
          <Plus size={16} className="text-[#5a8a6b] shrink-0" />
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Add a shared task and press Enter…"
            maxLength={200}
            disabled={submitting}
            className="flex-1 bg-transparent outline-none text-[14px] text-[#1a201c] dark:text-[#e8ece9] placeholder:text-[#858c87] dark:placeholder:text-[#6e7672] disabled:opacity-60"
          />
          {draft.trim() && (
            <button
              type="submit"
              disabled={submitting}
              className="h-7 px-3 inline-flex items-center rounded-lg bg-[#5a8a6b] hover:bg-[#4f7a5e] text-white text-[12px] font-medium transition-colors cursor-pointer disabled:opacity-60"
            >
              Add
            </button>
          )}
        </form>

        {!loading && (tasks?.length ?? 0) === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 text-center py-16">
            <div className="w-12 h-12 rounded-2xl bg-[#5a8a6b]/10 flex items-center justify-center text-[#5a8a6b]">
              <CheckSquare size={22} />
            </div>
            <div>
              <h3 className="text-[17px] font-semibold text-[#1a201c] dark:text-[#e8ece9] mb-1">
                No shared tasks yet
              </h3>
              <p className="text-[13px] text-[#5a625e] dark:text-[#a0a8a3] max-w-xs">
                Track deliverables and client action items here. Both you and
                your client see the same list.
              </p>
            </div>
          </div>
        ) : (
          <ul className="space-y-2">
            {(tasks ?? []).map((t) => {
              const isDone = t.status === "DONE";
              return (
                <li
                  key={t.id}
                  className="group flex items-center gap-3 px-4 py-3 rounded-xl bg-white dark:bg-[#151a17] border border-black/[0.08] dark:border-white/[0.07]"
                >
                  <button
                    onClick={() =>
                      void toggleTask(t.id, isDone ? "TODO" : "DONE")
                    }
                    title={isDone ? "Mark as not done" : "Mark as done"}
                    className={`w-5 h-5 shrink-0 flex items-center justify-center rounded-md border transition-colors cursor-pointer ${
                      isDone
                        ? "bg-[#5a8a6b] border-[#5a8a6b] text-white"
                        : "bg-transparent border-[#b5bbb7] dark:border-[#4a514d] hover:border-[#5a8a6b]"
                    }`}
                  >
                    {isDone && <Check size={13} strokeWidth={3} />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div
                      className={`text-[14px] truncate ${
                        isDone
                          ? "line-through text-[#858c87] dark:text-[#6e7672]"
                          : "text-[#1a201c] dark:text-[#e8ece9]"
                      }`}
                    >
                      {t.title}
                    </div>
                    <div className="text-[11px] text-[#b5bbb7] dark:text-[#4a514d] mt-0.5">
                      Added by {formatCreatedBy(t.createdBy)} ·{" "}
                      {formatRelative(t.createdAt)}
                    </div>
                  </div>
                  <button
                    onClick={() => void removeTask(t.id)}
                    title="Delete task"
                    className="w-8 h-8 shrink-0 flex items-center justify-center rounded-lg text-[#858c87] dark:text-[#6e7672] opacity-0 group-hover:opacity-100 hover:bg-[#c25a4a]/10 hover:text-[#c25a4a] dark:hover:text-[#e07b6b] transition-all cursor-pointer"
                  >
                    <Trash2 size={13} />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};
