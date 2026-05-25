import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "../context/AuthContext";
import type { WorkspaceDetail } from "../pages/workspacePage/types";

export const workspaceDetailKey = (workspaceId: string) =>
  ["workspace-detail", workspaceId] as const;

export const useWorkspaceDetail = (workspaceId: string) => {
  return useQuery({
    queryKey: workspaceDetailKey(workspaceId),
    queryFn: async () => {
      const { data } = await axiosInstance.get<WorkspaceDetail>(
        `/workspace/${workspaceId}`,
      );
      return data;
    },
  });
};
