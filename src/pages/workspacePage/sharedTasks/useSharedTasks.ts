import { useCallback, useEffect, useRef, useState } from "react";
import { isAxiosError } from "axios";
import { io, type Socket } from "socket.io-client";
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

export const useSharedTasks = (workspaceId: string): UseSharedTasksResult => {
  const { accessToken } = useAuth();
  const [tasks, setTasks] = useState<Task[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        const { data } = await axiosInstance.get<Task[]>(
          `/workspace/${workspaceId}/shared-tasks`,
        );
        if (!cancelled) setTasks(data);
      } catch (err) {
        if (!cancelled) {
          setError(extractApiError(err) ?? "Could not load shared tasks.");
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

  // Real-time sync: open a socket, join the workspace room, listen for
  // create/update/delete events. The socket is scoped to this hook so it
  // disconnects when the user leaves the tab or switches workspace.
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
      setTasks((prev) => {
        if (!prev) return [task];
        if (prev.some((t) => t.id === task.id)) return prev;
        return [task, ...prev];
      });
    });

    socket.on("sharedTaskUpdated", (task: Task) => {
      setTasks(
        (prev) => prev?.map((t) => (t.id === task.id ? task : t)) ?? null,
      );
    });

    socket.on("sharedTaskDeleted", ({ id }: { id: string }) => {
      setTasks((prev) => prev?.filter((t) => t.id !== id) ?? null);
    });

    return () => {
      socket.disconnect();
    };
  }, [workspaceId, accessToken]);

  const addTask = useCallback(
    async (title: string) => {
      const capturedWorkspaceId = workspaceId;
      setError(null);
      try {
        await axiosInstance.post<Task>(
          `/workspace/${capturedWorkspaceId}/shared-tasks`,
          { title },
        );
        // The socket "sharedTaskCreated" event will add it to the list,
        // so no manual setTasks here — prevents a brief duplicate.
      } catch (err) {
        const message = extractApiError(err) ?? "Could not add task.";
        setError(message);
        throw new Error(message);
      }
    },
    [workspaceId],
  );

  const toggleTask = useCallback(
    async (taskId: string, nextStatus: TaskStatus) => {
      const capturedWorkspaceId = workspaceId;
      const snapshot = tasks;
      // Optimistic update — server will confirm via socket shortly.
      setTasks(
        snapshot?.map((t) =>
          t.id === taskId ? { ...t, status: nextStatus } : t,
        ) ?? null,
      );
      try {
        await axiosInstance.patch<Task>(`/shared-tasks/${taskId}`, {
          status: nextStatus,
        });
      } catch (err) {
        if (workspaceIdRef.current === capturedWorkspaceId) {
          setTasks(snapshot);
        }
        setError(extractApiError(err) ?? "Could not update task.");
      }
    },
    [tasks, workspaceId],
  );

  const removeTask = useCallback(
    async (taskId: string) => {
      const capturedWorkspaceId = workspaceId;
      const snapshot = tasks;
      setTasks(snapshot?.filter((t) => t.id !== taskId) ?? null);
      try {
        await axiosInstance.delete(`/shared-tasks/${taskId}`);
      } catch (err) {
        if (workspaceIdRef.current === capturedWorkspaceId) {
          setTasks(snapshot);
        }
        setError(extractApiError(err) ?? "Could not delete task.");
      }
    },
    [tasks, workspaceId],
  );

  const clearError = useCallback(() => setError(null), []);

  return { tasks, loading, error, addTask, toggleTask, removeTask, clearError };
};
