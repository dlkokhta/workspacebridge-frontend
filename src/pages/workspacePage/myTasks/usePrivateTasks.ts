import { useCallback, useEffect, useRef, useState } from "react";
import { isAxiosError } from "axios";
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

export const usePrivateTasks = (workspaceId: string): UsePrivateTasksResult => {
  const [tasks, setTasks] = useState<PrivateTask[] | null>(null);
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
        const { data } = await axiosInstance.get<PrivateTask[]>(
          `/workspace/${workspaceId}/private-tasks`,
        );
        if (!cancelled) setTasks(data);
      } catch (err) {
        if (!cancelled) {
          setError(extractApiError(err) ?? "Could not load private tasks.");
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

  const addTask = useCallback(
    async (title: string) => {
      const capturedWorkspaceId = workspaceId;
      setError(null);
      try {
        const { data } = await axiosInstance.post<PrivateTask>(
          `/workspace/${capturedWorkspaceId}/private-tasks`,
          { title },
        );
        if (workspaceIdRef.current === capturedWorkspaceId) {
          setTasks((prev) => (prev ? [data, ...prev] : [data]));
        }
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
      setTasks(
        snapshot?.map((t) =>
          t.id === taskId ? { ...t, status: nextStatus } : t,
        ) ?? null,
      );
      try {
        const { data } = await axiosInstance.patch<PrivateTask>(
          `/private-tasks/${taskId}`,
          { status: nextStatus },
        );
        if (workspaceIdRef.current === capturedWorkspaceId) {
          setTasks(
            (prev) => prev?.map((t) => (t.id === taskId ? data : t)) ?? null,
          );
        }
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
        await axiosInstance.delete(`/private-tasks/${taskId}`);
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
