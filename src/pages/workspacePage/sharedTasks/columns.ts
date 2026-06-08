import type { TaskStatus } from "../types";

// Order here defines left-to-right column order on the board.
export const TASK_COLUMNS: { status: TaskStatus; label: string }[] = [
  { status: "TODO", label: "To do" },
  { status: "IN_PROGRESS", label: "In progress" },
  { status: "DONE", label: "Done" },
];
