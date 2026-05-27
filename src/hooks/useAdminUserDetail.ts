import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../context/AuthContext";

interface WorkspaceSummary {
  id: string;
  name: string;
  color: string;
  status: "ACTIVE" | "COMPLETED" | "ARCHIVED";
  createdAt: string;
}

interface Membership {
  id: string;
  role: string;
  createdAt: string;
  workspace: {
    id: string;
    name: string;
    color: string;
    status: "ACTIVE" | "COMPLETED" | "ARCHIVED";
  };
}

interface Session {
  id: string;
  ip: string | null;
  userAgent: string | null;
  createdAt: string;
  expiresAt: string;
}

interface InviteSent {
  id: string;
  email: string | null;
  createdAt: string;
  expiresAt: string;
  usedAt: string | null;
  workspace: {
    id: string;
    name: string;
  };
}

export interface AdminUserDetail {
  id: string;
  email: string;
  firstname: string | null;
  lastname: string | null;
  role: string;
  status: "ACTIVE" | "SUSPENDED";
  method: string;
  isVerified: boolean;
  isTwoFactorEnabled: boolean;
  plan: string;
  createdAt: string;
  updatedAt: string;
  ownedWorkspaces: WorkspaceSummary[];
  workspaceMemberships: Membership[];
  Session: Session[];
  invitesSent: InviteSent[];
}

const keys = {
  detail: (id: string) => ["admin-user-detail", id] as const,
  list: () => ["admin-users"] as const,
};

export const useAdminUserDetail = (userId: string | null) => {
  const queryClient = useQueryClient();

  const detailQuery = useQuery({
    queryKey: keys.detail(userId ?? ""),
    queryFn: async () => {
      const { data } = await axiosInstance.get<AdminUserDetail>(
        `/admin/users/${userId}`,
      );
      return data;
    },
    enabled: !!userId,
  });

  const suspendMutation = useMutation({
    mutationFn: async (vars: { id: string; status: string }) => {
      await axiosInstance.patch(`/admin/users/${vars.id}/status`, {
        status: vars.status,
      });
      return vars;
    },
    onSuccess: () => {
      if (userId) void queryClient.invalidateQueries({ queryKey: keys.detail(userId) });
      void queryClient.invalidateQueries({ queryKey: keys.list() });
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async (id: string) => {
      await axiosInstance.post(`/admin/users/${id}/reset-password`);
    },
  });

  const forceVerifyMutation = useMutation({
    mutationFn: async (id: string) => {
      await axiosInstance.post(`/admin/users/${id}/force-verify`);
    },
    onSuccess: () => {
      if (userId) void queryClient.invalidateQueries({ queryKey: keys.detail(userId) });
      void queryClient.invalidateQueries({ queryKey: keys.list() });
    },
  });

  return {
    user: detailQuery.data ?? null,
    loading: detailQuery.isLoading,
    error: detailQuery.error,
    updateStatus: (id: string, status: string) =>
      suspendMutation.mutateAsync({ id, status }).then(() => undefined),
    resetPassword: (id: string) =>
      resetPasswordMutation.mutateAsync(id).then(() => undefined),
    forceVerify: (id: string) =>
      forceVerifyMutation.mutateAsync(id).then(() => undefined),
    isSuspending: suspendMutation.isPending,
    isResettingPassword: resetPasswordMutation.isPending,
    isVerifying: forceVerifyMutation.isPending,
  };
};
