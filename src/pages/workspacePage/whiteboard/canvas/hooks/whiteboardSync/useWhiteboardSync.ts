import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  AppState,
  BinaryFiles,
  ExcalidrawImperativeAPI,
} from "@excalidraw/excalidraw/types";
import type { OrderedExcalidrawElement } from "@excalidraw/excalidraw/element/types";
import type { Socket } from "socket.io-client";
import { SYNC_DEBOUNCE_MS, sigOf } from "../../../utils";
import {
  makeBoardRestoredHandler,
  makeBoardStateHandler,
  makeSceneUpdateHandler,
} from "./handlers";
import { flushPendingScene } from "./transmit";
import {
  EMPTY_OVERLAY,
  type OverlayState,
  type SyncContext,
  type UseWhiteboardSyncResult,
} from "./types";

export const useWhiteboardSync = (
  boardId: string,
  socket: Socket | null,
  connected: boolean,
): UseWhiteboardSyncResult => {
  const [initialElements, setInitialElements] = useState<
    OrderedExcalidrawElement[] | null
  >(null);
  const [initialFiles, setInitialFiles] = useState<BinaryFiles>({});
  const [dirty, setDirty] = useState(false);
  const [overlay, setOverlay] = useState<OverlayState>(EMPTY_OVERLAY);
  const [restoreEpoch, setRestoreEpoch] = useState(0);

  const apiRef = useRef<ExcalidrawImperativeAPI | null>(null);
  const lastSyncedSigRef = useRef<string>("");
  const lastSentFileIdsRef = useRef<Set<string>>(new Set());
  const knownRemoteFileIdsRef = useRef<Set<string>>(new Set());

  const sendTimerRef = useRef<number | null>(null);
  const pendingElementsRef = useRef<readonly OrderedExcalidrawElement[] | null>(
    null,
  );
  const pendingFilesRef = useRef<BinaryFiles | null>(null);

  const hasJoinedRef = useRef<boolean>(false);
  const flushSendRef = useRef<() => void>(() => {});

  // Reset everything when switching to a different board.
  useEffect(() => {
    setInitialElements(null);
    setInitialFiles({});
    setDirty(false);
    setOverlay(EMPTY_OVERLAY);
    setRestoreEpoch(0);
    hasJoinedRef.current = false;
    apiRef.current = null;
    lastSyncedSigRef.current = "";
    lastSentFileIdsRef.current = new Set();
    knownRemoteFileIdsRef.current = new Set();
    pendingElementsRef.current = null;
    pendingFilesRef.current = null;
    if (sendTimerRef.current !== null) {
      window.clearTimeout(sendTimerRef.current);
      sendTimerRef.current = null;
    }
  }, [boardId]);

  const ctx = useMemo<SyncContext>(
    () => ({
      boardId,
      apiRef,
      hasJoinedRef,
      lastSyncedSigRef,
      knownRemoteFileIdsRef,
      lastSentFileIdsRef,
      pendingElementsRef,
      pendingFilesRef,
      sendTimerRef,
      setInitialElements,
      setInitialFiles,
      setDirty,
      setRestoreEpoch,
    }),
    [boardId],
  );

  useEffect(() => {
    if (!socket || !connected) return;

    socket.emit("joinBoard", { boardId });

    const onBoardState = makeBoardStateHandler(ctx);
    const onSceneUpdate = makeSceneUpdateHandler(ctx);
    const onBoardRestored = makeBoardRestoredHandler(ctx);

    socket.on("boardState", onBoardState);
    socket.on("sceneUpdate", onSceneUpdate);
    socket.on("boardRestored", onBoardRestored);

    let flushTimer: number | null = null;
    if (pendingElementsRef.current !== null) {
      flushTimer = window.setTimeout(() => flushSendRef.current(), 100);
    }

    return () => {
      socket.off("boardState", onBoardState);
      socket.off("sceneUpdate", onSceneUpdate);
      socket.off("boardRestored", onBoardRestored);
      if (flushTimer !== null) window.clearTimeout(flushTimer);
    };
  }, [socket, connected, boardId, ctx]);

  useEffect(() => {
    return () => {
      if (sendTimerRef.current !== null) {
        window.clearTimeout(sendTimerRef.current);
      }
    };
  }, []);

  const flushSend = useCallback(() => {
    flushPendingScene({
      socket,
      connected,
      boardId,
      pendingElementsRef,
      pendingFilesRef,
      lastSentFileIdsRef,
      sendTimerRef,
      setDirty,
    });
  }, [socket, connected, boardId]);

  useEffect(() => {
    flushSendRef.current = flushSend;
  }, [flushSend]);

  const onChange = useCallback(
    (
      elements: readonly OrderedExcalidrawElement[],
      appState: AppState,
      files: BinaryFiles,
    ) => {
      const selectedIds = Object.keys(appState.selectedElementIds);
      const nextSelectedId = selectedIds.length === 1 ? selectedIds[0] : null;

      setOverlay((prev) => {
        if (
          prev.elements === elements &&
          prev.scrollX === appState.scrollX &&
          prev.scrollY === appState.scrollY &&
          prev.zoom === appState.zoom.value &&
          prev.selectedElementId === nextSelectedId
        ) {
          return prev;
        }
        return {
          elements,
          scrollX: appState.scrollX,
          scrollY: appState.scrollY,
          zoom: appState.zoom.value,
          selectedElementId: nextSelectedId,
        };
      });

      const sig = sigOf(elements);
      if (sig === lastSyncedSigRef.current) return;
      lastSyncedSigRef.current = sig;

      pendingElementsRef.current = elements;
      pendingFilesRef.current = files;
      setDirty(true);
      if (sendTimerRef.current !== null) {
        window.clearTimeout(sendTimerRef.current);
      }
      sendTimerRef.current = window.setTimeout(flushSend, SYNC_DEBOUNCE_MS);
    },
    [flushSend],
  );

  return {
    initialElements,
    initialFiles,
    dirty,
    overlay,
    restoreEpoch,
    apiRef,
    onChange,
  };
};
