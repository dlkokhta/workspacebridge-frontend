import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../context/AuthContext";

export interface AdminFile {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  deletedAt: string | null;
  createdAt: string;
  workspace: {
    id: string;
    name: string;
  };
  uploadedBy: {
    id: string;
    email: string;
    firstname: string | null;
    lastname: string | null;
  } | null;
}

interface WorkspaceFileStats {
  workspaceId: string;
  workspaceName: string;
  fileCount: number;
  totalSize: number;
}

export interface AdminFileStats {
  totalFiles: number;
  totalSize: number;
  perWorkspace: WorkspaceFileStats[];
}

const keys = {
  list: () => ["admin-files"] as const,
  stats: () => ["admin-files-stats"] as const,
};

export const useAdminFiles = () => {
  const queryClient = useQueryClient();

  const listQuery = useQuery({
    queryKey: keys.list(),
    queryFn: async () => {
      const { data } = await axiosInstance.get<AdminFile[]>("/admin/files");
      return data;
    },
  });

  const statsQuery = useQuery({
    queryKey: keys.stats(),
    queryFn: async () => {
      const { data } = await axiosInstance.get<AdminFileStats>(
        "/admin/files/stats",
      );
      return data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await axiosInstance.delete(`/admin/files/${id}`);
      return id;
    },
    onSuccess: (id) => {
      queryClient.setQueryData<AdminFile[]>(keys.list(), (prev) =>
        prev?.filter((f) => f.id !== id),
      );
      void queryClient.invalidateQueries({ queryKey: keys.stats() });
    },
  });

  return {
    files: listQuery.data ?? [],
    stats: statsQuery.data ?? null,
    loading: listQuery.isLoading,
    deleteFile: (id: string) =>
      deleteMutation.mutateAsync(id).then(() => undefined),
    deletingId: deleteMutation.isPending
      ? (deleteMutation.variables ?? null)
      : null,
  };
};
