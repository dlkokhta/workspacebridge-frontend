import { axiosInstance } from "../../../../context/AuthContext";
import type { WhiteboardTemplate } from "../templates";

export interface BoardSummary {
  id: string;
  name: string;
  updatedAt: string;
}

export interface UseBoardsResult {
  boards: BoardSummary[] | null;
  selectedId: string | null;
  setSelectedId: (id: string) => void;
  error: string | null;
  creating: boolean;
  createBoard: (template: WhiteboardTemplate, name: string) => Promise<void>;
  renameBoard: (boardId: string, name: string) => Promise<void>;
  duplicateBoard: (board: BoardSummary) => Promise<void>;
  deleteBoard: (board: BoardSummary) => Promise<void>;
}

export const boardsKeys = {
  list: (workspaceId: string) => ["whiteboards", workspaceId] as const,
};

// Create a fresh blank board so the canvas always has something to render.
// Used both when a workspace has zero boards and when the user deletes
// the last remaining one.
export const bootstrapDefaultBoard = async (
  workspaceId: string,
): Promise<BoardSummary> => {
  const { data } = await axiosInstance.post<BoardSummary>(
    `/workspace/${workspaceId}/whiteboards`,
    {},
  );
  return data;
};
