import {
  CheckSquare,
  File,
  LayoutGrid,
  Link2,
  MessageSquare,
  PenLine,
  type LucideIcon,
} from "lucide-react";
import type { SearchResultType } from "../../hooks/useSearch";
import type { Tab } from "../../pages/workspacePage/types";

interface SearchTypeMeta {
  label: string;
  icon: LucideIcon;
  /** Workspace tab a result of this type opens into. (Unused for the
   *  "workspace" type, which navigates to the workspace root instead.) */
  tab: Tab;
}

export const SEARCH_TYPE_META: Record<SearchResultType, SearchTypeMeta> = {
  workspace: { label: "Workspace", icon: LayoutGrid, tab: "messages" },
  message: { label: "Message", icon: MessageSquare, tab: "messages" },
  file: { label: "File", icon: File, tab: "files" },
  file_comment: { label: "File comment", icon: MessageSquare, tab: "files" },
  shared_task: { label: "Task", icon: CheckSquare, tab: "todos" },
  private_task: { label: "Private task", icon: CheckSquare, tab: "my-tasks" },
  shared_link: { label: "Link", icon: Link2, tab: "shared-links" },
  whiteboard_comment: { label: "Whiteboard", icon: PenLine, tab: "whiteboard" },
};
