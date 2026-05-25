import { useCallback, useState } from "react";
import { isAxiosError } from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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

const keys = {
  list: (workspaceId: string) => ["shared-links", workspaceId] as const,
};

export const useSharedLinks = (workspaceId: string): UseSharedLinksResult => {
  const queryClient = useQueryClient();
  const [mutationError, setMutationError] = useState<string | null>(null);

  const listQuery = useQuery({
    queryKey: keys.list(workspaceId),
    queryFn: async () => {
      const { data } = await axiosInstance.get<SharedLink[]>(
        `/workspace/${workspaceId}/links`,
      );
      return data;
    },
  });

  const addMutation = useMutation({
    mutationFn: async (input: CreateSharedLinkInput) => {
      const { data } = await axiosInstance.post<SharedLink>(
        `/workspace/${workspaceId}/links`,
        input,
      );
      return data;
    },
    onSuccess: (created) => {
      queryClient.setQueryData<SharedLink[]>(keys.list(workspaceId), (prev) =>
        prev ? [created, ...prev] : [created],
      );
    },
  });

  const removeMutation = useMutation({
    mutationFn: async (linkId: string) => {
      await axiosInstance.delete(`/links/${linkId}`);
      return linkId;
    },
    // Optimistic update: drop immediately, restore from snapshot on failure.
    onMutate: async (linkId) => {
      await queryClient.cancelQueries({ queryKey: keys.list(workspaceId) });
      const snapshot = queryClient.getQueryData<SharedLink[]>(
        keys.list(workspaceId),
      );
      queryClient.setQueryData<SharedLink[]>(keys.list(workspaceId), (prev) =>
        prev?.filter((l) => l.id !== linkId),
      );
      return { snapshot };
    },
    onError: (_err, _linkId, ctx) => {
      if (ctx?.snapshot) {
        queryClient.setQueryData(keys.list(workspaceId), ctx.snapshot);
      }
    },
  });

  const addLink = useCallback(
    async (input: CreateSharedLinkInput) => {
      setMutationError(null);
      try {
        await addMutation.mutateAsync(input);
      } catch (err) {
        const message = extractApiError(err) ?? "Could not add link.";
        setMutationError(message);
        throw new Error(message);
      }
    },
    [addMutation],
  );

  const removeLink = useCallback(
    async (linkId: string) => {
      try {
        await removeMutation.mutateAsync(linkId);
      } catch (err) {
        setMutationError(extractApiError(err) ?? "Could not delete link.");
      }
    },
    [removeMutation],
  );

  const clearError = useCallback(() => setMutationError(null), []);

  const queryError = listQuery.error
    ? (extractApiError(listQuery.error) ?? "Could not load links.")
    : null;

  return {
    links: listQuery.data ?? null,
    loading: listQuery.isLoading,
    error: mutationError ?? queryError,
    addLink,
    removeLink,
    clearError,
  };
};
