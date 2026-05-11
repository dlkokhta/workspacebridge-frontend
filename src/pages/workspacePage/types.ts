export type Tab = "messages" | "files" | "whiteboard" | "shared-links" | "settings";

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

export interface SharedLink {
  id: number;
  title: string;
  url: string;
  kind: string;
  by: string;
  added: string;
  color: string;
}
