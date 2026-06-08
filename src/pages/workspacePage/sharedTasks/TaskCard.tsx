import { useDraggable } from "@dnd-kit/core";
import { GripVertical, Trash2 } from "lucide-react";
import type { Task } from "../types";

interface TaskCardProps {
  task: Task;
  onDelete?: (id: string) => void;
  // Rendered inside DragOverlay — no draggable wiring, just the visual.
  overlay?: boolean;
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

export const TaskCard = ({ task, onDelete, overlay = false }: TaskCardProps) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: task.id });

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;

  return (
    <div
      ref={overlay ? undefined : setNodeRef}
      style={style}
      className={`group relative flex items-start gap-2 px-3 py-2.5 rounded-lg bg-white dark:bg-[#151a17] border border-black/[0.08] dark:border-white/[0.07] ${
        overlay ? "shadow-xl rotate-2 cursor-grabbing" : ""
      } ${isDragging && !overlay ? "opacity-40" : ""}`}
    >
      <button
        type="button"
        {...listeners}
        {...attributes}
        aria-label="Drag task"
        className="shrink-0 mt-0.5 text-[#b5bbb7] dark:text-[#4a514d] hover:text-[#5a8a6b] cursor-grab active:cursor-grabbing touch-none"
      >
        <GripVertical size={14} />
      </button>

      <div className="flex-1 min-w-0">
        <div className="text-[13px] text-[#1a201c] dark:text-[#e8ece9] break-words">
          {task.title}
        </div>
        <div className="text-[11px] text-[#b5bbb7] dark:text-[#4a514d] mt-0.5">
          {formatCreatedBy(task.createdBy)} · {formatRelative(task.createdAt)}
        </div>
      </div>

      {onDelete && (
        <button
          type="button"
          onClick={() => onDelete(task.id)}
          aria-label="Delete task"
          className="shrink-0 w-7 h-7 flex items-center justify-center rounded-md text-[#858c87] dark:text-[#6e7672] opacity-0 group-hover:opacity-100 hover:bg-[#c25a4a]/10 hover:text-[#c25a4a] dark:hover:text-[#e07b6b] transition-all cursor-pointer"
        >
          <Trash2 size={13} />
        </button>
      )}
    </div>
  );
};
