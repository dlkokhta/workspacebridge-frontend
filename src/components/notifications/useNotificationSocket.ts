import { useEffect } from "react";
import { io } from "socket.io-client";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../context/AuthContext";
import { notificationKeys } from "./notificationKeys";

// Opens a push-only socket while logged in and refreshes the notification
// caches whenever the server emits one, so the bell badge updates live.
export const useNotificationSocket = () => {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!accessToken) return;

    const socket = io(`${import.meta.env.VITE_SOCKET_URL}/notifications`, {
      auth: { token: accessToken },
      transports: ["websocket"],
    });

    const refresh = () => {
      void queryClient.invalidateQueries({
        queryKey: notificationKeys.unread(),
      });
      void queryClient.invalidateQueries({ queryKey: notificationKeys.list() });
    };
    socket.on("notification", refresh);

    return () => {
      socket.off("notification", refresh);
      socket.disconnect();
    };
  }, [accessToken, queryClient]);
};
