export type Tab = "messages" | "files" | "whiteboard" | "shared-links" | "todos" | "my-tasks" | "settings";

export interface UserProfile {
  id: string;
  firstname: string | null;
  lastname: string | null;
  email: string;
  picture: string | null;
}

export interface Workspace {
  id: string;
  name: string;
  description: string | null;
  color: string;
}

export interface WorkspaceMember {
  id: string;
  role: string;
  user: {
    id: string;
    firstname: string | null;
    lastname: string | null;
    email: string;
    picture: string | null;
  };
}

export interface WorkspaceDetail extends Workspace {
  status: string;
  ownerId: string;
  members: WorkspaceMember[];
  /** Per-file upload limit in bytes, derived from the owner's plan. */
  maxFileSize: number;
}

export interface Message {
  id: string;
  content: string;
  createdAt: string;
  sender: {
    id: string;
    firstname: string | null;
    lastname: string | null;
    email: string;
    picture: string | null;
  };
}

export interface FileItem {
  id: number;
  name: string;
  kind: string;
  size: string;
  mod: string;
  by: string;
  comments: number;
  color: string;
}

export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";

export interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
  createdBy: {
    id: string;
    firstname: string | null;
    lastname: string | null;
    email: string;
  } | null;
}

export interface PrivateTask {
  id: string;
  title: string;
  status: TaskStatus;
  workspaceId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SharedLink {
  id: string;
  url: string;
  title: string | null;
  createdAt: string;
  // null when the original adder has been deleted (UI shows "Deleted user").
  addedBy: {
    id: string;
    firstname: string | null;
    lastname: string | null;
    email: string;
  } | null;
}
