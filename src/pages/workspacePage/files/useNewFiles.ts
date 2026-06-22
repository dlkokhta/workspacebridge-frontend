import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../../../context/AuthContext";
import { filesKeys } from "./filesKeys";

// Drives the Files tab "new files" dot: whether files from others have landed
// since the user last opened the tab. Opening it marks everything seen and
// clears the dot. Files have no socket, so this refreshes on load and on
// window focus (React Query default) rather than live.
export const useNewFiles = (workspaceId: string, isActive: boolean): boolean => {
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: filesKeys.hasNew(workspaceId),
    queryFn: async () => {
      const res = await axiosInstance.get<{ hasNew: boolean }>(
        `/workspace/${workspaceId}/files/new`,
      );
      return res.data.hasNew;
    },
    enabled: !!workspaceId,
  });

  const { mutate: markSeen } = useMutation({
    mutationFn: async () => {
      await axiosInstance.post(`/workspace/${workspaceId}/files/seen`);
    },
    onSuccess: () => {
      queryClient.setQueryData(filesKeys.hasNew(workspaceId), false);
    },
  });

  // Opening the tab catches the user up, so the dot clears.
  useEffect(() => {
    if (isActive && workspaceId) markSeen();
  }, [isActive, workspaceId, markSeen]);

  return isActive ? false : (data ?? false);
};
