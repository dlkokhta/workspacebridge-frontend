import { useCallback, useEffect, useRef, useState } from "react";
import { isAxiosError } from "axios";
import { axiosInstance } from "../../../context/AuthContext";
import type { SharedLink } from "../types";

interface CreateSharedLinkInput {
  url: string;
  title?: string;
}

interface UseSharedLinksResult {
  links: SharedLink[] | null;
  loading: boolean;
  error: string | null;
  addLink: (input: CreateSharedLinkInput) => Promise<void>;
  removeLink: (linkId: string) => Promise<void>;
  clearError: () => void;
}

const extractApiError = (err: unknown): string | null => {
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

export const useSharedLinks = (workspaceId: string): UseSharedLinksResult => {
  const [links, setLinks] = useState<SharedLink[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mirrors useFiles: drop async state writes after a workspace switch.
  const workspaceIdRef = useRef(workspaceId);
  useEffect(() => {
    workspaceIdRef.current = workspaceId;
  }, [workspaceId]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const load = async () => {
      try {
        const { data } = await axiosInstance.get<SharedLink[]>(
          `/workspace/${workspaceId}/links`,
        );
        if (!cancelled) setLinks(data);
      } catch (err) {
        if (!cancelled) {
          setError(extractApiError(err) ?? "Could not load links.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [workspaceId]);

  const addLink = useCallback(
    async (input: CreateSharedLinkInput) => {
      const capturedWorkspaceId = workspaceId;
      setError(null);
      try {
        const { data } = await axiosInstance.post<SharedLink>(
          `/workspace/${capturedWorkspaceId}/links`,
          input,
        );
        if (workspaceIdRef.current === capturedWorkspaceId) {
          setLinks((prev) => (prev ? [data, ...prev] : [data]));
        }
      } catch (err) {
        const message = extractApiError(err) ?? "Could not add link.";
        setError(message);
        throw new Error(message);
      }
    },
    [workspaceId],
  );

  const removeLink = useCallback(
    async (linkId: string) => {
      const capturedWorkspaceId = workspaceId;
      const snapshot = links;
      setLinks(snapshot?.filter((l) => l.id !== linkId) ?? null);
      try {
        await axiosInstance.delete(`/links/${linkId}`);
      } catch (err) {
        if (workspaceIdRef.current === capturedWorkspaceId) {
          setLinks(snapshot);
        }
        setError(extractApiError(err) ?? "Could not delete link.");
      }
    },
    [links, workspaceId],
  );

  const clearError = useCallback(() => setError(null), []);

  return { links, loading, error, addLink, removeLink, clearError };
};
