import { useDroppable } from "@dnd-kit/core";
import { TaskCard } from "./TaskCard";
import type { Task, TaskStatus } from "../types";

interface TaskColumnProps {
  status: TaskStatus;
  label: string;
  tasks: Task[];
  onDelete: (id: string) => void;
}

export const TaskColumn = ({
  status,
  label,
  tasks,
  onDelete,
}: TaskColumnProps) => {
  // The droppable id is the column's status — dropping a card here is what
  // the board reads to PATCH the task to this status.
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div className="flex flex-col w-72 shrink-0 h-full min-h-0">
      <div className="flex items-center gap-2 px-1 mb-3">
        <span className="text-[13px] font-semibold text-[#1a201c] dark:text-[#e8ece9]">
          {label}
        </span>
        <span className="text-[11px] font-medium px-1.5 py-0.5 rounded-md bg-black/[0.05] dark:bg-white/[0.06] text-[#5a625e] dark:text-[#a0a8a3]">
          {tasks.length}
        </span>
      </div>

      <div
        ref={setNodeRef}
        className={`flex-1 min-h-0 overflow-y-auto space-y-2 p-2 rounded-xl border transition-colors ${
          isOver
            ? "border-[#5a8a6b] bg-[#5a8a6b]/[0.06]"
            : "border-black/[0.06] dark:border-white/[0.05] bg-black/[0.02] dark:bg-white/[0.02]"
        }`}
      >
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} onDelete={onDelete} />
        ))}
        {tasks.length === 0 && (
          <div className="flex items-center justify-center h-20 text-[12px] text-[#b5bbb7] dark:text-[#4a514d]">
            Drop tasks here
          </div>
        )}
      </div>
    </div>
  );
};
