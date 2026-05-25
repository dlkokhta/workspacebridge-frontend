import type { Dispatch, RefObject, SetStateAction } from "react";
import type { BinaryFiles } from "@excalidraw/excalidraw/types";
import type { OrderedExcalidrawElement } from "@excalidraw/excalidraw/element/types";
import type { Socket } from "socket.io-client";

interface FlushSendDeps {
  socket: Socket | null;
  connected: boolean;
  boardId: string;
  pendingElementsRef: RefObject<readonly OrderedExcalidrawElement[] | null>;
  pendingFilesRef: RefObject<BinaryFiles | null>;
  lastSentFileIdsRef: RefObject<Set<string>>;
  sendTimerRef: RefObject<number | null>;
  setDirty: Dispatch<SetStateAction<boolean>>;
}

// Drain the pending scene buffer and emit it to the server. Files are only
// re-sent when the set of file IDs has actually changed since the last send,
// so we don't ship the same image bytes twice.
export const flushPendingScene = (deps: FlushSendDeps): void => {
  const {
    socket,
    connected,
    boardId,
    pendingElementsRef,
    pendingFilesRef,
    lastSentFileIdsRef,
    sendTimerRef,
    setDirty,
  } = deps;

  sendTimerRef.current = null;
  if (!socket || !connected) return;

  const elements = pendingElementsRef.current;
  if (!elements) return;
  const files = pendingFilesRef.current;
  pendingElementsRef.current = null;
  pendingFilesRef.current = null;

  const currentIds = files ? Object.keys(files) : [];
  const lastIds = lastSentFileIdsRef.current;
  const filesChanged =
    currentIds.length !== lastIds.size ||
    currentIds.some((id) => !lastIds.has(id));

  const payload: {
    boardId: string;
    elements: readonly OrderedExcalidrawElement[];
    files?: BinaryFiles;
  } = { boardId, elements };

  if (filesChanged && files) {
    payload.files = files;
    lastSentFileIdsRef.current = new Set(currentIds);
  }

  socket.emit("sceneUpdate", payload);
  setDirty(false);
};
