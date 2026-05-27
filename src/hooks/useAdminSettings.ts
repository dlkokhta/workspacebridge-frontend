import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../context/AuthContext";

export interface PlatformSetting {
  key: string;
  value: unknown;
  updatedAt: string;
}

const keys = {
  list: () => ["admin-settings"] as const,
};

export const useAdminSettings = () => {
  const queryClient = useQueryClient();

  const listQuery = useQuery({
    queryKey: keys.list(),
    queryFn: async () => {
      const { data } = await axiosInstance.get<PlatformSetting[]>(
        "/admin/settings",
      );
      return data;
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (vars: { key: string; value: unknown }) => {
      await axiosInstance.patch(`/admin/settings/${vars.key}`, {
        value: vars.value,
      });
      return vars;
    },
    onMutate: async ({ key, value }) => {
      await queryClient.cancelQueries({ queryKey: keys.list() });
      const snapshot = queryClient.getQueryData<PlatformSetting[]>(keys.list());
      queryClient.setQueryData<PlatformSetting[]>(keys.list(), (prev) =>
        prev?.map((s) => (s.key === key ? { ...s, value } : s)),
      );
      return { snapshot };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.snapshot) {
        queryClient.setQueryData(keys.list(), ctx.snapshot);
      }
    },
  });

  const settingsMap = new Map(
    (listQuery.data ?? []).map((s) => [s.key, s]),
  );

  return {
    settings: listQuery.data ?? [],
    settingsMap,
    loading: listQuery.isLoading,
    error: listQuery.error,
    updateSetting: (key: string, value: unknown) =>
      updateMutation.mutateAsync({ key, value }).then(() => undefined),
    isUpdating: updateMutation.isPending,
    updatingKey: updateMutation.isPending
      ? (updateMutation.variables?.key ?? null)
      : null,
  };
};
