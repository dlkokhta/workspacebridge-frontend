import { useCallback, useEffect, useState } from "react";
import type { Socket } from "socket.io-client";

interface ReadEntry {
  userId: string;
  lastReadAt: string;
}

/**
 * Tracks how far the *other* chat participants have read (for rendering
 * "seen") and exposes `markRead` to report that the current user has caught up.
 */
export const useReadReceipts = (
  socket: Socket | null,
  connected: boolean,
  workspaceId: string,
) => {
  // userId -> lastReadAt as epoch ms.
  const [othersRead, setOthersRead] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!socket || !connected) return;

    const onReadState = (entries: ReadEntry[]) => {
      const next: Record<string, number> = {};
      entries.forEach((e) => {
        next[e.userId] = new Date(e.lastReadAt).getTime();
      });
      setOthersRead(next);
    };
    const onReadReceipt = ({ userId, lastReadAt }: ReadEntry) => {
      setOthersRead((prev) => ({
        ...prev,
        [userId]: new Date(lastReadAt).getTime(),
      }));
    };

    socket.on("readState", onReadState);
    socket.on("readReceipt", onReadReceipt);
    return () => {
      socket.off("readState", onReadState);
      socket.off("readReceipt", onReadReceipt);
    };
  }, [socket, connected]);

  // Drop stale read state when switching workspaces.
  useEffect(() => {
    setOthersRead({});
  }, [workspaceId]);

  const markRead = useCallback(() => {
    if (!socket || !connected) return;
    socket.emit("markRead", { workspaceId });
  }, [socket, connected, workspaceId]);

  const values = Object.values(othersRead);
  const seenUpTo = values.length > 0 ? Math.max(...values) : null;

  return { seenUpTo, markRead };
};
