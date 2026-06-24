import { useEffect, useState } from "react";
import type { Socket } from "socket.io-client";
import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "../../../../context/AuthContext";
import { useWorkspaceBoardSync } from "./useWorkspaceBoardSync";
import {
  boardsKeys,
  bootstrapDefaultBoard,
  type BoardSummary,
} from "./boardsKeys";

interface BoardSyncOptions {
  socket: Socket | null;
  connected: boolean;
  isOwner: boolean;
}

// Owns the list query + selection state. Selection lives here because
// the list arrival drives the default selection, and a workspace switch
// must reset both together. Real-time list/selection sync is wired in here
// too, since it needs the same query cache and selection setter.
export const useBoardsList = (
  workspaceId: string,
  sync: BoardSyncOptions,
) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const listQuery = useQuery({
    queryKey: boardsKeys.list(workspaceId),
    queryFn: async () => {
      const { data } = await axiosInstance.get<BoardSummary[]>(
        `/workspace/${workspaceId}/whiteboards`,
      );
      if (data.length === 0) {
        const created = await bootstrapDefaultBoard(workspaceId);
        return [created];
      }
      return data;
    },
  });

  // Reset selection on workspace switch so we don't carry a stale id over.
  useEffect(() => {
    setSelectedId(null);
  }, [workspaceId]);

  // Default to the first board, and re-point selection if the current one is no
  // longer in the list (e.g. it was deleted by the other participant).
  useEffect(() => {
    const data = listQuery.data;
    if (!data || data.length === 0) return;
    setSelectedId((prev) =>
      prev && data.some((b) => b.id === prev) ? prev : data[0].id,
    );
  }, [listQuery.data]);

  useWorkspaceBoardSync({
    workspaceId,
    socket: sync.socket,
    connected: sync.connected,
    isOwner: sync.isOwner,
    selectedId,
    setSelectedId,
  });

  return {
    boards: listQuery.data ?? null,
    loadError: listQuery.error ? "Could not load whiteboards." : null,
    selectedId,
    setSelectedId,
  };
};
