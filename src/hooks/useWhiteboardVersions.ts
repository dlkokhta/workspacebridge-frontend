import { useCallback, useEffect, useRef, useState } from "react";
import { axiosInstance } from "../context/AuthContext";

export type WhiteboardVersionType = "MANUAL" | "AUTO";

export interface VersionAuthor {
  id: string;
  firstname: string | null;
  lastname: string | null;
  email: string;
  picture: string | null;
}

export interface WhiteboardVersionSummary {
  id: string;
  whiteboardId: string;
  label: string | null;
  type: WhiteboardVersionType;
  createdAt: string;
  createdBy: VersionAuthor;
}

export interface WhiteboardVersionDetail extends WhiteboardVersionSummary {
  elements: unknown[];
  appState: Record<string, unknown> | null;
  files: Record<string, unknown> | null;
}

export interface RestoredBoard {
  id: string;
  name: string;
  elements: unknown[];
  appState: Record<string, unknown> | null;
  files: Record<string, unknown> | null;
  updatedAt: string;
}

interface SaveVersionInput {
  label?: string;
  elements: unknown[];
  appState?: Record<string, unknown> | null;
  files?: Record<string, unknown> | null;
}

interface UseWhiteboardVersionsResult {
  versions: WhiteboardVersionSummary[];
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
  saveVersion: (input: SaveVersionInput) => Promise<WhiteboardVersionSummary>;
  getVersion: (versionId: string) => Promise<WhiteboardVersionDetail>;
  restoreVersion: (versionId: string) => Promise<RestoredBoard>;
}

export const useWhiteboardVersions = (
  boardId: string,
): UseWhiteboardVersionsResult => {
  const [versions, setVersions] = useState<WhiteboardVersionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const cancelRef = useRef(false);

  const fetchList = useCallback(async () => {
    try {
      const { data } = await axiosInstance.get<WhiteboardVersionSummary[]>(
        `/whiteboards/${boardId}/versions`,
      );
      if (cancelRef.current) return;
      setVersions(data);
      setError(null);
    } catch {
      if (cancelRef.current) return;
      setError("Could not load version history.");
    } finally {
      if (cancelRef.current) return;
      setLoading(false);
    }
  }, [boardId]);

  useEffect(() => {
    cancelRef.current = false;
    setVersions([]);
    setError(null);
    setLoading(true);
    void fetchList();
    return () => {
      cancelRef.current = true;
    };
  }, [boardId, fetchList]);

  const saveVersion = useCallback(
    async (input: SaveVersionInput) => {
      const { data } = await axiosInstance.post<WhiteboardVersionSummary>(
        `/whiteboards/${boardId}/versions`,
        {
          label: input.label?.trim() || undefined,
          elements: input.elements,
          appState: input.appState ?? undefined,
          files: input.files ?? undefined,
        },
      );
      setVersions((prev) =>
        prev.some((v) => v.id === data.id) ? prev : [data, ...prev],
      );
      return data;
    },
    [boardId],
  );

  const getVersion = useCallback(
    async (versionId: string) => {
      const { data } = await axiosInstance.get<WhiteboardVersionDetail>(
        `/whiteboards/${boardId}/versions/${versionId}`,
      );
      return data;
    },
    [boardId],
  );

  const restoreVersion = useCallback(
    async (versionId: string) => {
      const { data } = await axiosInstance.post<RestoredBoard>(
        `/whiteboards/${boardId}/versions/${versionId}/restore`,
      );
      await fetchList();
      return data;
    },
    [boardId, fetchList],
  );

  return {
    versions,
    loading,
    error,
    reload: fetchList,
    saveVersion,
    getVersion,
    restoreVersion,
  };
};
