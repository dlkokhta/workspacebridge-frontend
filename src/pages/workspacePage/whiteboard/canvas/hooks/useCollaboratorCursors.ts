import { useCallback, useEffect, useRef } from "react";
import type { RefObject } from "react";
import { CaptureUpdateAction } from "@excalidraw/excalidraw";
import type {
  Collaborator,
  ExcalidrawImperativeAPI,
  SocketId,
} from "@excalidraw/excalidraw/types";
import type { Socket } from "socket.io-client";
import {
  COLLABORATOR_SWEEP_MS,
  COLLABORATOR_TTL_MS,
  POINTER_THROTTLE_MS,
  colorFor,
  formatCollaboratorName,
} from "../../utils";

interface RemotePointerPayload {
  userId: string;
  email: string;
  firstname?: string | null;
  lastname?: string | null;
  pointer: { x: number; y: number };
  button?: "up" | "down";
}

interface CollaboratorLeftPayload {
  userId: string;
}

interface CollaboratorEntry {
  pointer: { x: number; y: number };
  button?: "up" | "down";
  email: string;
  firstname?: string | null;
  lastname?: string | null;
  lastSeen: number;
}

interface UseCollaboratorCursorsResult {
  onPointerUpdate: (payload: {
    pointer: { x: number; y: number; tool: "pointer" | "laser" };
    button: "down" | "up";
  }) => void;
}

export const useCollaboratorCursors = (
  boardId: string,
  socket: Socket | null,
  connected: boolean,
  apiRef: RefObject<ExcalidrawImperativeAPI | null>,
): UseCollaboratorCursorsResult => {
  const collaboratorsRef = useRef<Map<string, CollaboratorEntry>>(new Map());
  const pointerTimerRef = useRef<number | null>(null);
  const lastPointerSentRef = useRef<number>(0);
  const pendingPointerRef = useRef<{
    pointer: { x: number; y: number };
    button: "up" | "down";
  } | null>(null);

  const pushCollaboratorsToScene = useCallback(() => {
    if (!apiRef.current) return;
    const map = new Map<SocketId, Collaborator>();
    for (const [userId, entry] of collaboratorsRef.current) {
      map.set(userId as SocketId, {
        id: userId,
        socketId: userId as SocketId,
        pointer: { ...entry.pointer, tool: "pointer" },
        button: entry.button,
        username: formatCollaboratorName(entry),
        color: colorFor(userId),
      });
    }
    apiRef.current.updateScene({
      collaborators: map,
      captureUpdate: CaptureUpdateAction.NEVER,
    });
  }, [apiRef]);

  useEffect(() => {
    if (!socket || !connected) return;

    const onRemotePointer = (payload: RemotePointerPayload) => {
      collaboratorsRef.current.set(payload.userId, {
        pointer: payload.pointer,
        button: payload.button,
        email: payload.email,
        firstname: payload.firstname,
        lastname: payload.lastname,
        lastSeen: Date.now(),
      });
      pushCollaboratorsToScene();
    };

    const onCollaboratorLeft = (payload: CollaboratorLeftPayload) => {
      if (collaboratorsRef.current.delete(payload.userId)) {
        pushCollaboratorsToScene();
      }
    };

    socket.on("pointerUpdate", onRemotePointer);
    socket.on("collaboratorLeft", onCollaboratorLeft);

    return () => {
      socket.off("pointerUpdate", onRemotePointer);
      socket.off("collaboratorLeft", onCollaboratorLeft);
    };
  }, [socket, connected, pushCollaboratorsToScene]);

  useEffect(() => {
    const sweep = window.setInterval(() => {
      const now = Date.now();
      let changed = false;
      for (const [userId, entry] of collaboratorsRef.current) {
        if (now - entry.lastSeen > COLLABORATOR_TTL_MS) {
          collaboratorsRef.current.delete(userId);
          changed = true;
        }
      }
      if (changed) pushCollaboratorsToScene();
    }, COLLABORATOR_SWEEP_MS);

    return () => window.clearInterval(sweep);
  }, [pushCollaboratorsToScene]);

  useEffect(() => {
    return () => {
      if (pointerTimerRef.current !== null) {
        window.clearTimeout(pointerTimerRef.current);
      }
    };
  }, []);

  const flushPointer = useCallback(() => {
    pointerTimerRef.current = null;
    const data = pendingPointerRef.current;
    pendingPointerRef.current = null;
    if (!data || !socket || !connected) return;
    socket.emit("pointerUpdate", {
      boardId,
      pointer: data.pointer,
      button: data.button,
    });
    lastPointerSentRef.current = Date.now();
  }, [socket, connected, boardId]);

  const onPointerUpdate = useCallback(
    (payload: {
      pointer: { x: number; y: number; tool: "pointer" | "laser" };
      button: "down" | "up";
    }) => {
      pendingPointerRef.current = {
        pointer: { x: payload.pointer.x, y: payload.pointer.y },
        button: payload.button,
      };

      const now = Date.now();
      const elapsed = now - lastPointerSentRef.current;

      if (elapsed >= POINTER_THROTTLE_MS) {
        flushPointer();
      } else if (pointerTimerRef.current === null) {
        pointerTimerRef.current = window.setTimeout(
          flushPointer,
          POINTER_THROTTLE_MS - elapsed,
        );
      }
    },
    [flushPointer],
  );

  return { onPointerUpdate };
};
