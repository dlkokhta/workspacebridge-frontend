import { useEffect, useRef, useState } from "react";
import { useSocket } from "../context/SocketContext";
import type { Message } from "../pages/workspacePage/types";

interface UnreadCountPayload {
  workspaceId: string;
  count: number;
}

// Drives the Messages tab badge. Seeds from the server's unread count (messages
// from others after the user's last read), ticks up live on incoming messages
// while the tab is inactive, and clears to zero the moment it's opened.
export const useUnreadMessages = (
  workspaceId: string,
  userId: string,
  isActive: boolean,
): number => {
  const { socket, connected } = useSocket();
  const [unread, setUnread] = useState(0);
  const isActiveRef = useRef(isActive);

  // Opening the tab marks the thread read, so the badge clears and stays at
  // zero until the user navigates away.
  useEffect(() => {
    isActiveRef.current = isActive;
    if (isActive) setUnread(0);
  }, [isActive]);

  useEffect(() => {
    if (!socket || !connected || !workspaceId) return;
    setUnread(0);

    const onCount = (payload: UnreadCountPayload) => {
      if (payload.workspaceId !== workspaceId) return;
      setUnread(isActiveRef.current ? 0 : payload.count);
    };
    const onNewMessage = (message: Message) => {
      if (message.sender.id === userId || isActiveRef.current) return;
      setUnread((n) => n + 1);
    };

    socket.on("unreadCount", onCount);
    socket.on("newMessage", onNewMessage);
    socket.emit("getUnreadCount", { workspaceId });

    return () => {
      socket.off("unreadCount", onCount);
      socket.off("newMessage", onNewMessage);
    };
  }, [socket, connected, workspaceId, userId]);

  return unread;
};
