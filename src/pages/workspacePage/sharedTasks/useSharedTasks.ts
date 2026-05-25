import { useCallback, useEffect, useState } from "react";
import { isAxiosError } from "axios";
import { io, type Socket } from "socket.io-client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosInstance, useAuth } from "../../../context/AuthContext";
import type { Task, TaskStatus } from "../types";

interface UseSharedTasksResult {
  tasks: Task[] | null;
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
  list: (workspaceId: string) => ["shared-tasks", workspaceId] as const,
};

export const useSharedTasks = (workspaceId: string): UseSharedTasksResult => {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();
  const [mutationError, setMutationError] = useState<string | null>(null);

  const listQuery = useQuery({
    queryKey: keys.list(workspaceId),
    queryFn: async () => {
      const { data } = await axiosInstance.get<Task[]>(
        `/workspace/${workspaceId}/shared-tasks`,
      );
      return data;
    },
  });

  // Real-time sync: socket events write straight into the React Query cache
  // via setQueryData, so subscribers re-render with the new value. Socket is
  // scoped to this hook — disconnects on tab leave or workspace switch.
  useEffect(() => {
    if (!accessToken) return;

    const socket: Socket = io(
      `${import.meta.env.VITE_SOCKET_URL}/shared-tasks`,
      {
        auth: { token: accessToken },
        transports: ["websocket"],
      },
    );

    socket.on("connect", () => {
      socket.emit("joinSharedTasksRoom", { workspaceId });
    });

    socket.on("sharedTaskCreated", (task: Task) => {
      queryClient.setQueryData<Task[]>(keys.list(workspaceId), (prev) => {
        if (!prev) return [task];
        if (prev.some((t) => t.id === task.id)) return prev;
        return [task, ...prev];
      });
    });

    socket.on("sharedTaskUpdated", (task: Task) => {
      queryClient.setQueryData<Task[]>(keys.list(workspaceId), (prev) =>
        prev?.map((t) => (t.id === task.id ? task : t)),
      );
    });

    socket.on("sharedTaskDeleted", ({ id }: { id: string }) => {
      queryClient.setQueryData<Task[]>(keys.list(workspaceId), (prev) =>
        prev?.filter((t) => t.id !== id),
      );
    });

    return () => {
      socket.disconnect();
    };
  }, [workspaceId, accessToken, queryClient]);

  const addMutation = useMutation({
    mutationFn: async (title: string) => {
      await axiosInstance.post<Task>(
        `/workspace/${workspaceId}/shared-tasks`,
        { title },
      );
      // No cache write here — the "sharedTaskCreated" socket event will
      // add it to the list, avoiding a brief duplicate.
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async (vars: { taskId: string; nextStatus: TaskStatus }) => {
      await axiosInstance.patch<Task>(`/shared-tasks/${vars.taskId}`, {
        status: vars.nextStatus,
      });
    },
    onMutate: async ({ taskId, nextStatus }) => {
      await queryClient.cancelQueries({ queryKey: keys.list(workspaceId) });
      const snapshot = queryClient.getQueryData<Task[]>(keys.list(workspaceId));
      queryClient.setQueryData<Task[]>(keys.list(workspaceId), (prev) =>
        prev?.map((t) =>
          t.id === taskId ? { ...t, status: nextStatus } : t,
        ),
      );
      return { snapshot };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.snapshot) {
        queryClient.setQueryData(keys.list(workspaceId), ctx.snapshot);
      }
    },
  });

  const removeMutation = useMutation({
    mutationFn: async (taskId: string) => {
      await axiosInstance.delete(`/shared-tasks/${taskId}`);
      return taskId;
    },
    onMutate: async (taskId) => {
      await queryClient.cancelQueries({ queryKey: keys.list(workspaceId) });
      const snapshot = queryClient.getQueryData<Task[]>(keys.list(workspaceId));
      queryClient.setQueryData<Task[]>(keys.list(workspaceId), (prev) =>
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
    ? (extractApiError(listQuery.error) ?? "Could not load shared tasks.")
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
