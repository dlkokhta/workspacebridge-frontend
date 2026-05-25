import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../context/AuthContext";

export interface AdminUser {
  id: string;
  email: string;
  firstname: string | null;
  lastname: string | null;
  role: string;
  method: string;
  isVerified: boolean;
  createdAt: string;
}

interface UseAdminUsersResult {
  users: AdminUser[];
  loading: boolean;
  error: unknown;
  updateRole: (userId: string, role: string) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  updatingRoleId: string | null;
  deletingId: string | null;
}

const keys = {
  list: () => ["admin-users"] as const,
};

export const useAdminUsers = (): UseAdminUsersResult => {
  const queryClient = useQueryClient();

  const listQuery = useQuery({
    queryKey: keys.list(),
    queryFn: async () => {
      const { data } = await axiosInstance.get<AdminUser[]>("/admin/users");
      return data;
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: async (vars: { userId: string; role: string }) => {
      await axiosInstance.patch(`/admin/users/${vars.userId}/role`, {
        role: vars.role,
      });
      return vars;
    },
    onMutate: async ({ userId, role }) => {
      await queryClient.cancelQueries({ queryKey: keys.list() });
      const snapshot = queryClient.getQueryData<AdminUser[]>(keys.list());
      queryClient.setQueryData<AdminUser[]>(keys.list(), (prev) =>
        prev?.map((u) => (u.id === userId ? { ...u, role } : u)),
      );
      return { snapshot };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.snapshot) {
        queryClient.setQueryData(keys.list(), ctx.snapshot);
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (userId: string) => {
      await axiosInstance.delete(`/admin/users/${userId}`);
      return userId;
    },
    onSuccess: (userId) => {
      queryClient.setQueryData<AdminUser[]>(keys.list(), (prev) =>
        prev?.filter((u) => u.id !== userId),
      );
    },
  });

  return {
    users: listQuery.data ?? [],
    loading: listQuery.isLoading,
    error: listQuery.error,
    updateRole: (userId, role) =>
      updateRoleMutation.mutateAsync({ userId, role }).then(() => undefined),
    deleteUser: (userId) =>
      deleteMutation.mutateAsync(userId).then(() => undefined),
    updatingRoleId: updateRoleMutation.isPending
      ? (updateRoleMutation.variables?.userId ?? null)
      : null,
    deletingId: deleteMutation.isPending
      ? (deleteMutation.variables ?? null)
      : null,
  };
};
