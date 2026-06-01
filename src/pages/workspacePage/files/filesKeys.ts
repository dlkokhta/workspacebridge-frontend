import { isAxiosError } from "axios";

export interface FileSummary {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  // null when the original uploader has deleted their account — the file
  // itself stays in the workspace (see schema.prisma onDelete: SetNull).
  uploadedBy: {
    id: string;
    firstname: string | null;
    lastname: string | null;
    email: string;
  } | null;
  createdAt: string;
  updatedAt: string;
  // Total comment count. Only the active file list populates this; trash,
  // upload, and restore responses omit it (consumers default to 0).
  commentCount?: number;
}

export interface TrashedFile extends FileSummary {
  deletedAt: string;
}

export interface DownloadResponse {
  url: string;
  expiresIn: number;
  name: string;
}

export const filesKeys = {
  list: (workspaceId: string) => ["files", workspaceId] as const,
  trash: (workspaceId: string) => ["files-trash", workspaceId] as const,
};

export const extractFilesError = (err: unknown): string | null => {
  if (isAxiosError(err)) {
    const data = err.response?.data as
      | { message?: string | string[] }
      | undefined;
    const msg = data?.message;
    if (Array.isArray(msg)) return msg.join(", ");
    return msg ?? null;
  }
  return null;
};
