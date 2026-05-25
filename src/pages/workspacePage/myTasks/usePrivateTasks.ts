import { useCallback, useState } from "react";
import { isAxiosError } from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../../../context/AuthContext";
import type { PrivateTask, TaskStatus } from "../types";

interface UsePrivateTasksResult {
  tasks: PrivateTask[] | null;
  loading: boolean;
  error: string | null;
  addTask: (title: string) => Promise<void>;
  toggleTask: (taskId: string, nextStatus: TaskStatus) => Promise<void>;
  removeTask: (taskId: string) => Promise<void>;
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
  list: (workspaceId: string) => ["private-tasks", workspaceId] as const,
};

export const usePrivateTasks = (workspaceId: string): UsePrivateTasksResult => {
  const queryClient = useQueryClient();
  const [mutationError, setMutationError] = useState<string | null>(null);

  const listQuery = useQuery({
    queryKey: keys.list(workspaceId),
    queryFn: async () => {
      const { data } = await axiosInstance.get<PrivateTask[]>(
        `/workspace/${workspaceId}/private-tasks`,
      );
      return data;
    },
  });

  const addMutation = useMutation({
    mutationFn: async (title: string) => {
      const { data } = await axiosInstance.post<PrivateTask>(
        `/workspace/${workspaceId}/private-tasks`,
        { title },
      );
      return data;
    },
    onSuccess: (created) => {
      queryClient.setQueryData<PrivateTask[]>(keys.list(workspaceId), (prev) =>
        prev ? [created, ...prev] : [created],
      );
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async (vars: { taskId: string; nextStatus: TaskStatus }) => {
      const { data } = await axiosInstance.patch<PrivateTask>(
        `/private-tasks/${vars.taskId}`,
        { status: vars.nextStatus },
      );
      return data;
    },
    onMutate: async ({ taskId, nextStatus }) => {
      await queryClient.cancelQueries({ queryKey: keys.list(workspaceId) });
      const snapshot = queryClient.getQueryData<PrivateTask[]>(
        keys.list(workspaceId),
      );
      queryClient.setQueryData<PrivateTask[]>(keys.list(workspaceId), (prev) =>
        prev?.map((t) =>
          t.id === taskId ? { ...t, status: nextStatus } : t,
        ),
      );
      return { snapshot };
    },
    onSuccess: (updated) => {
      // Replace the optimistic copy with the canonical server version.
      queryClient.setQueryData<PrivateTask[]>(keys.list(workspaceId), (prev) =>
        prev?.map((t) => (t.id === updated.id ? updated : t)),
      );
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.snapshot) {
        queryClient.setQueryData(keys.list(workspaceId), ctx.snapshot);
      }
    },
  });

  const removeMutation = useMutation({
    mutationFn: async (taskId: string) => {
      await axiosInstance.delete(`/private-tasks/${taskId}`);
      return taskId;
    },
    onMutate: async (taskId) => {
      await queryClient.cancelQueries({ queryKey: keys.list(workspaceId) });
      const snapshot = queryClient.getQueryData<PrivateTask[]>(
        keys.list(workspaceId),
      );
      queryClient.setQueryData<PrivateTask[]>(keys.list(workspaceId), (prev) =>
        prev?.filter((t) => t.id !== taskId),
      );
      return { snapshot };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.snapshot) {
        queryClient.setQueryData(keys.list(workspaceId), ctx.snapshot);
      }
    },
  });

  const addTask = useCallback(
    async (title: string) => {
      setMutationError(null);
      try {
        await addMutation.mutateAsync(title);
      } catch (err) {
        const message = extractApiError(err) ?? "Could not add task.";
        setMutationError(message);
        throw new Error(message);
      }
    },
    [addMutation],
  );

  const toggleTask = useCallback(
    async (taskId: string, nextStatus: TaskStatus) => {
      try {
        await toggleMutation.mutateAsync({ taskId, nextStatus });
      } catch (err) {
        setMutationError(extractApiError(err) ?? "Could not update task.");
      }
    },
    [toggleMutation],
  );

  const removeTask = useCallback(
    async (taskId: string) => {
      try {
        await removeMutation.mutateAsync(taskId);
      } catch (err) {
        setMutationError(extractApiError(err) ?? "Could not delete task.");
      }
    },
    [removeMutation],
  );

  const clearError = useCallback(() => setMutationError(null), []);

  const queryError = listQuery.error
    ? (extractApiError(listQuery.error) ?? "Could not load private tasks.")
    : null;

  return {
    tasks: listQuery.data ?? null,
    loading: listQuery.isLoading,
    error: mutationError ?? queryError,
    addTask,
    toggleTask,
    removeTask,
    clearError,
  };
};
