import { useState, type FormEvent, type KeyboardEvent } from "react";
import { Plus } from "lucide-react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { useSharedTasks } from "./useSharedTasks";
import { TASK_COLUMNS } from "./columns";
import { TaskColumn } from "./TaskColumn";
import { TaskCard } from "./TaskCard";
import type { TaskStatus } from "../types";

interface SharedTasksTabProps {
  workspaceId: string;
}

export const SharedTasksTab = ({ workspaceId }: SharedTasksTabProps) => {
  const { tasks, loading, error, addTask, setStatus, removeTask, clearError } =
    useSharedTasks(workspaceId);
  const [draft, setDraft] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  // Small drag threshold so clicking the delete button / typing isn't
  // swallowed as a drag start.
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  const list = tasks ?? [];
  const activeTask = list.find((t) => t.id === activeId) ?? null;

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

  const handleDragEnd = (e: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = e;
    if (!over) return;
    const task = list.find((t) => t.id === String(active.id));
    const nextStatus = over.id as TaskStatus;
    if (!task || task.status === nextStatus) return;
    void setStatus(task.id, nextStatus);
  };

  return (
    <div className="flex flex-col flex-1 overflow-hidden min-h-0">
      <div className="flex items-center justify-between px-6 py-3 border-b border-black/[0.06] dark:border-white/[0.05]">
        <span className="text-[13px] text-[#5a625e] dark:text-[#a0a8a3]">
          {loading
            ? "Loading…"
            : `${list.length} task${list.length === 1 ? "" : "s"} · drag cards between columns · visible to all workspace members`}
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

      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 mx-6 mt-4 px-4 py-3 rounded-xl bg-white dark:bg-[#151a17] border border-black/[0.08] dark:border-white/[0.07]"
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

      <div className="flex-1 overflow-x-auto overflow-y-hidden p-6 bg-[#fafaf7] dark:bg-[#0e1310]">
        <DndContext
          sensors={sensors}
          onDragStart={(e: DragStartEvent) => setActiveId(String(e.active.id))}
          onDragEnd={handleDragEnd}
          onDragCancel={() => setActiveId(null)}
        >
          <div className="flex gap-4 h-full min-h-0">
            {TASK_COLUMNS.map((col) => (
              <TaskColumn
                key={col.status}
                status={col.status}
                label={col.label}
                tasks={list.filter((t) => t.status === col.status)}
                onDelete={removeTask}
              />
            ))}
          </div>
          <DragOverlay>
            {activeTask ? <TaskCard task={activeTask} overlay /> : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
};
