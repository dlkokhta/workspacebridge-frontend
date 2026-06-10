import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../../../../context/AuthContext";

export interface SessionInfo {
  id: string;
  ip: string | null;
  userAgent: string | null;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
  isCurrent: boolean;
}

export const sessionsKey = ["sessions"] as const;

export const useSessions = (enabled: boolean) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: sessionsKey,
    queryFn: async () => {
      const { data } = await axiosInstance.get<SessionInfo[]>("/user/sessions");
      return data;
    },
    enabled,
  });

  const revokeSession = useMutation({
    mutationFn: async (sessionId: string) => {
      await axiosInstance.delete(`/user/sessions/${sessionId}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: sessionsKey }),
  });

  const revokeOthers = useMutation({
    mutationFn: async () => {
      const { data } = await axiosInstance.delete<{
        message: string;
        count: number;
      }>("/user/sessions");
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: sessionsKey }),
  });

  return { query, revokeSession, revokeOthers };
};
