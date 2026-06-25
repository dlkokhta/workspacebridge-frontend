import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosInstance, useAuth } from "../../../context/AuthContext";
import { filesKeys, type FileSummary } from "./filesKeys";

// Drives the Files tab "new files" dot: whether files from others have landed
// since the user last opened the tab. The query seeds the initial state on
// load; while the tab is inactive a /files socket lights the dot live as other
// people upload. Opening the tab marks everything seen and clears the dot.
export const useNewFiles = (
  workspaceId: string,
  isActive: boolean,
  userId: string,
): boolean => {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();
  const [liveNew, setLiveNew] = useState(false);

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
    if (isActive && workspaceId) {
      markSeen();
      setLiveNew(false);
    }
  }, [isActive, workspaceId, markSeen]);

  // While the tab is closed, listen for files from *others* and light the dot.
  // The active list (useFilesList) owns the socket when the tab is open, so we
  // only connect here when inactive — at most one /files socket at a time.
  useEffect(() => {
    if (!accessToken || !workspaceId || isActive) return;

    const socket = io(`${import.meta.env.VITE_SOCKET_URL}/files`, {
      auth: { token: accessToken },
      transports: ["websocket"],
    });

    socket.on("connect", () => {
      socket.emit("joinFilesRoom", { workspaceId });
    });

    socket.on("fileCreated", (file: FileSummary) => {
      if (file.uploadedBy?.id !== userId) setLiveNew(true);
    });

    return () => {
      socket.disconnect();
    };
  }, [workspaceId, accessToken, isActive, userId]);

  return isActive ? false : liveNew || (data ?? false);
};
