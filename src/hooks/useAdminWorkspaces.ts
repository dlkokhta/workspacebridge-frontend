import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../context/AuthContext";

export interface AdminWorkspace {
  id: string;
  name: string;
  description: string | null;
  color: string;
  status: "ACTIVE" | "COMPLETED" | "ARCHIVED";
  createdAt: string;
  owner: {
    id: string;
    email: string;
    firstname: string | null;
    lastname: string | null;
  };
  _count: {
    members: number;
  };
}

interface UseAdminWorkspacesResult {
  workspaces: AdminWorkspace[];
  loading: boolean;
  error: unknown;
  updateStatus: (id: string, status: string) => Promise<void>;
  deleteWorkspace: (id: string) => Promise<void>;
  updatingStatusId: string | null;
  deletingId: string | null;
}

const keys = {
  list: () => ["admin-workspaces"] as const,
};

export const useAdminWorkspaces = (): UseAdminWorkspacesResult => {
  const queryClient = useQueryClient();

  const listQuery = useQuery({
    queryKey: keys.list(),
    queryFn: async () => {
      const { data } = await axiosInstance.get<AdminWorkspace[]>(
        "/admin/workspaces",
      );
      return data;
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async (vars: { id: string; status: string }) => {
      await axiosInstance.patch(`/admin/workspaces/${vars.id}/status`, {
        status: vars.status,
      });
      return vars;
    },
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: keys.list() });
      const snapshot = queryClient.getQueryData<AdminWorkspace[]>(keys.list());
      queryClient.setQueryData<AdminWorkspace[]>(keys.list(), (prev) =>
        prev?.map((w) =>
          w.id === id
            ? { ...w, status: status as AdminWorkspace["status"] }
            : w,
        ),
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
    mutationFn: async (id: string) => {
      await axiosInstance.delete(`/admin/workspaces/${id}`);
      return id;
    },
    onSuccess: (id) => {
      queryClient.setQueryData<AdminWorkspace[]>(keys.list(), (prev) =>
        prev?.filter((w) => w.id !== id),
      );
    },
  });

  return {
    workspaces: listQuery.data ?? [],
    loading: listQuery.isLoading,
    error: listQuery.error,
    updateStatus: (id, status) =>
      updateStatusMutation.mutateAsync({ id, status }).then(() => undefined),
    deleteWorkspace: (id) =>
      deleteMutation.mutateAsync(id).then(() => undefined),
    updatingStatusId: updateStatusMutation.isPending
      ? (updateStatusMutation.variables?.id ?? null)
      : null,
    deletingId: deleteMutation.isPending
      ? (deleteMutation.variables ?? null)
      : null,
  };
};
