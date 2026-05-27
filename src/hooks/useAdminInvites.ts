import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../context/AuthContext";

export interface AdminInvite {
  id: string;
  email: string | null;
  createdAt: string;
  expiresAt: string;
  usedAt: string | null;
  workspace: {
    id: string;
    name: string;
    owner: {
      id: string;
      email: string;
      firstname: string | null;
      lastname: string | null;
    };
  };
}

const keys = {
  list: () => ["admin-invites"] as const,
};

export const useAdminInvites = () => {
  const queryClient = useQueryClient();

  const listQuery = useQuery({
    queryKey: keys.list(),
    queryFn: async () => {
      const { data } = await axiosInstance.get<AdminInvite[]>("/admin/invites");
      return data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await axiosInstance.delete(`/admin/invites/${id}`);
      return id;
    },
    onSuccess: (id) => {
      queryClient.setQueryData<AdminInvite[]>(keys.list(), (prev) =>
        prev?.filter((inv) => inv.id !== id),
      );
    },
  });

  return {
    invites: listQuery.data ?? [],
    loading: listQuery.isLoading,
    error: listQuery.error,
    revokeInvite: (id: string) =>
      deleteMutation.mutateAsync(id).then(() => undefined),
    revokingId: deleteMutation.isPending
      ? (deleteMutation.variables ?? null)
      : null,
  };
};
