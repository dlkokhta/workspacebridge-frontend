import { useEffect } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { Socket } from "socket.io-client";
import { useQueryClient } from "@tanstack/react-query";
import { boardsKeys, type BoardSummary } from "./boardsKeys";

interface UseWorkspaceBoardSyncParams {
  workspaceId: string;
  socket: Socket | null;
  connected: boolean;
  isOwner: boolean;
  selectedId: string | null;
  setSelectedId: Dispatch<SetStateAction<string | null>>;
}

// Keeps every participant's whiteboard tab bar — and, for clients, the active
// board — in sync in real time. Board CRUD runs over REST; the server then
// broadcasts lifecycle + presenter events to the workspace room, which we apply
// to the React Query cache here. The owner is the presenter: when their active
// board changes we emit `presentBoard` so clients follow along.
export const useWorkspaceBoardSync = ({
  workspaceId,
  socket,
  connected,
  isOwner,
  selectedId,
  setSelectedId,
}: UseWorkspaceBoardSyncParams) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!socket || !connected || !workspaceId) return;

    socket.emit("joinWorkspaceBoards", { workspaceId });
    const key = boardsKeys.list(workspaceId);

    // Add or replace a board in the cached list, deduped by id so the
    // originator's own optimistic update plus the echoed broadcast stay stable.
    const upsert = (board: BoardSummary) =>
      queryClient.setQueryData<BoardSummary[]>(key, (prev) => {
        if (!prev) return [board];
        const idx = prev.findIndex((b) => b.id === board.id);
        if (idx === -1) return [...prev, board];
        const next = [...prev];
        next[idx] = { ...next[idx], ...board };
        return next;
      });

    const onDeleted = ({ id }: { id: string }) => {
      let remainingFirst: string | null = null;
      queryClient.setQueryData<BoardSummary[]>(key, (prev) => {
        if (!prev) return prev;
        const next = prev.filter((b) => b.id !== id);
        remainingFirst = next[0]?.id ?? null;
        return next;
      });
      // If we were viewing the board that just vanished, fall back to the first
      // remaining one so the canvas never points at a dead board.
      setSelectedId((prev) => (prev === id ? remainingFirst : prev));
    };

    // Presenter follow — only clients react; the owner is the one driving.
    const onPresented = ({ boardId }: { boardId: string }) => {
      if (isOwner) return;
      setSelectedId(boardId);
    };

    socket.on("boardCreated", upsert);
    socket.on("boardRenamed", upsert);
    socket.on("boardDeleted", onDeleted);
    socket.on("boardPresented", onPresented);

    return () => {
      socket.emit("leaveWorkspaceBoards", { workspaceId });
      socket.off("boardCreated", upsert);
      socket.off("boardRenamed", upsert);
      socket.off("boardDeleted", onDeleted);
      socket.off("boardPresented", onPresented);
    };
  }, [socket, connected, workspaceId, isOwner, queryClient, setSelectedId]);

  // Presenter broadcast: whenever the owner's active board changes, tell the
  // clients in the workspace room to follow it.
  useEffect(() => {
    if (!socket || !connected || !isOwner || !selectedId) return;
    socket.emit("presentBoard", { boardId: selectedId });
  }, [socket, connected, isOwner, selectedId]);
};
