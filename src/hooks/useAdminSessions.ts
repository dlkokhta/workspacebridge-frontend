import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../context/AuthContext";

export interface AdminSession {
  id: string;
  ip: string | null;
  userAgent: string | null;
  createdAt: string;
  expiresAt: string;
  user: {
    id: string;
    email: string;
    firstname: string | null;
    lastname: string | null;
  };
}

const keys = {
  list: () => ["admin-sessions"] as const,
};

export const useAdminSessions = () => {
  const queryClient = useQueryClient();

  const listQuery = useQuery({
    queryKey: keys.list(),
    queryFn: async () => {
      const { data } = await axiosInstance.get<AdminSession[]>(
        "/admin/sessions",
      );
      return data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await axiosInstance.delete(`/admin/sessions/${id}`);
      return id;
    },
    onSuccess: (id) => {
      queryClient.setQueryData<AdminSession[]>(keys.list(), (prev) =>
        prev?.filter((s) => s.id !== id),
      );
    },
  });

  return {
    sessions: listQuery.data ?? [],
    loading: listQuery.isLoading,
    error: listQuery.error,
    revokeSession: (id: string) =>
      deleteMutation.mutateAsync(id).then(() => undefined),
    revokingId: deleteMutation.isPending
      ? (deleteMutation.variables ?? null)
      : null,
  };
};
