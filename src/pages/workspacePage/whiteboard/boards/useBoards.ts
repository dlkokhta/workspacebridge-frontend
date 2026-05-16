import { useEffect, useState } from "react";
import { axiosInstance } from "../../../../context/AuthContext";
import type { WhiteboardTemplate } from "../whiteboardTemplates";

export interface BoardSummary {
  id: string;
  name: string;
  updatedAt: string;
}

interface UseBoardsResult {
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

export const useBoards = (workspaceId: string): UseBoardsResult => {
  const [boards, setBoards] = useState<BoardSummary[] | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const { data } = await axiosInstance.get<BoardSummary[]>(
          `/workspace/${workspaceId}/whiteboards`,
        );
        if (cancelled) return;

        if (data.length === 0) {
          const { data: created } = await axiosInstance.post<BoardSummary>(
            `/workspace/${workspaceId}/whiteboards`,
            {},
          );
          if (cancelled) return;
          setBoards([created]);
          setSelectedId(created.id);
        } else {
          setBoards(data);
          setSelectedId(data[0].id);
        }
      } catch {
        if (!cancelled) setError("Could not load whiteboards.");
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [workspaceId]);

  const createBoard = async (template: WhiteboardTemplate, name: string) => {
    setCreating(true);
    try {
      const { data } = await axiosInstance.post<BoardSummary>(
        `/workspace/${workspaceId}/whiteboards`,
        { name, elements: template.elements },
      );
      setBoards((prev) => (prev ? [...prev, data] : [data]));
      setSelectedId(data.id);
    } catch {
      setError("Could not create board.");
    } finally {
      setCreating(false);
    }
  };

  const renameBoard = async (boardId: string, name: string) => {
    const current = boards?.find((b) => b.id === boardId);
    if (!current || current.name === name) return;
    const previous = current.name;
    setBoards((prev) =>
      prev ? prev.map((b) => (b.id === boardId ? { ...b, name } : b)) : prev,
    );
    try {
      await axiosInstance.patch(`/whiteboards/${boardId}/rename`, { name });
    } catch {
      setBoards((prev) =>
        prev
          ? prev.map((b) => (b.id === boardId ? { ...b, name: previous } : b))
          : prev,
      );
      setError("Could not rename board.");
    }
  };

  const duplicateBoard = async (board: BoardSummary) => {
    try {
      const { data } = await axiosInstance.post<BoardSummary>(
        `/whiteboards/${board.id}/duplicate`,
      );
      setBoards((prev) => (prev ? [...prev, data] : [data]));
      setSelectedId(data.id);
    } catch {
      setError("Could not duplicate board.");
    }
  };

  const deleteBoard = async (board: BoardSummary) => {
    const remaining = (boards ?? []).filter((b) => b.id !== board.id);
    try {
      await axiosInstance.delete(`/whiteboards/${board.id}`);
      if (remaining.length === 0) {
        const { data: created } = await axiosInstance.post<BoardSummary>(
          `/workspace/${workspaceId}/whiteboards`,
          {},
        );
        setBoards([created]);
        setSelectedId(created.id);
        return;
      }
      setBoards(remaining);
      if (selectedId === board.id) setSelectedId(remaining[0].id);
    } catch {
      setError("Could not delete board.");
    }
  };

  return {
    boards,
    selectedId,
    setSelectedId,
    error,
    creating,
    createBoard,
    renameBoard,
    duplicateBoard,
    deleteBoard,
  };
};
