import { useCallback, useEffect, useRef, useState } from "react";
import type { RefObject } from "react";
import { CaptureUpdateAction, reconcileElements } from "@excalidraw/excalidraw";
import type {
  AppState,
  BinaryFileData,
  BinaryFiles,
  ExcalidrawImperativeAPI,
} from "@excalidraw/excalidraw/types";
import type { OrderedExcalidrawElement } from "@excalidraw/excalidraw/element/types";
import type { RemoteExcalidrawElement } from "@excalidraw/excalidraw/data/reconcile";
import type { Socket } from "socket.io-client";
import { SYNC_DEBOUNCE_MS, sigOf } from "../../utils";

interface BoardStatePayload {
  elements: unknown[];
  files?: BinaryFiles | null;
}

interface SceneUpdatePayload {
  elements: unknown[];
  files?: BinaryFiles | null;
}

interface BoardRestoredPayload {
  boardId: string;
  elements: unknown;
  appState: unknown;
  files: unknown;
}

interface OverlayState {
  elements: readonly OrderedExcalidrawElement[];
  scrollX: number;
  scrollY: number;
  zoom: number;
  selectedElementId: string | null;
}

const EMPTY_OVERLAY: OverlayState = {
  elements: [],
  scrollX: 0,
  scrollY: 0,
  zoom: 1,
  selectedElementId: null,
};

interface UseWhiteboardSyncResult {
  initialElements: OrderedExcalidrawElement[] | null;
  initialFiles: BinaryFiles;
  dirty: boolean;
  overlay: OverlayState;
  restoreEpoch: number;
  apiRef: RefObject<ExcalidrawImperativeAPI | null>;
  onChange: (
    elements: readonly OrderedExcalidrawElement[],
    appState: AppState,
    files: BinaryFiles,
  ) => void;
}

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

  useEffect(() => {
    if (!socket || !connected) return;

    socket.emit("joinBoard", { boardId });

    const onBoardState = (payload: BoardStatePayload) => {
      const elements = (payload.elements ?? []) as OrderedExcalidrawElement[];
      const files = payload.files ?? {};

      if (!hasJoinedRef.current) {
        lastSyncedSigRef.current = sigOf(elements);
        knownRemoteFileIdsRef.current = new Set(Object.keys(files));
        lastSentFileIdsRef.current = new Set(Object.keys(files));
        setInitialFiles(files);
        setInitialElements(elements);
        hasJoinedRef.current = true;
        return;
      }

      const api = apiRef.current;
      if (!api) return;
      const localElements = api.getSceneElementsIncludingDeleted();
      const reconciled = reconcileElements(
        localElements,
        elements as RemoteExcalidrawElement[],
        api.getAppState(),
      );
      lastSyncedSigRef.current = sigOf(reconciled);
      api.updateScene({
        elements: reconciled,
        captureUpdate: CaptureUpdateAction.NEVER,
      });
      const incomingFiles: BinaryFileData[] = [];
      for (const [id, file] of Object.entries(files)) {
        if (!knownRemoteFileIdsRef.current.has(id)) {
          incomingFiles.push(file);
          knownRemoteFileIdsRef.current.add(id);
        }
      }
      if (incomingFiles.length > 0) api.addFiles(incomingFiles);
    };

    const onSceneUpdate = (payload: SceneUpdatePayload) => {
      const remoteElements = (payload.elements ?? []) as RemoteExcalidrawElement[];
      lastSyncedSigRef.current = sigOf(remoteElements);

      const api = apiRef.current;
      if (api) {
        const localElements = api.getSceneElementsIncludingDeleted();
        const reconciled = reconcileElements(
          localElements,
          remoteElements,
          api.getAppState(),
        );
        api.updateScene({
          elements: reconciled,
          captureUpdate: CaptureUpdateAction.NEVER,
        });
      }
      if (payload.files) {
        const incoming: BinaryFileData[] = [];
        for (const [id, file] of Object.entries(payload.files)) {
          if (!knownRemoteFileIdsRef.current.has(id)) {
            incoming.push(file);
            knownRemoteFileIdsRef.current.add(id);
          }
        }
        if (incoming.length > 0) apiRef.current?.addFiles(incoming);
      }
    };

    const onBoardRestored = (payload: BoardRestoredPayload) => {
      if (payload.boardId !== boardId) return;
      const elements = (Array.isArray(payload.elements)
        ? payload.elements
        : []) as OrderedExcalidrawElement[];
      const files = (payload.files ?? {}) as BinaryFiles;
      lastSyncedSigRef.current = sigOf(elements);
      knownRemoteFileIdsRef.current = new Set(Object.keys(files));
      lastSentFileIdsRef.current = new Set(Object.keys(files));
      pendingElementsRef.current = null;
      pendingFilesRef.current = null;
      if (sendTimerRef.current !== null) {
        window.clearTimeout(sendTimerRef.current);
        sendTimerRef.current = null;
      }
      setInitialElements(elements);
      setInitialFiles(files);
      hasJoinedRef.current = true;
      setDirty(false);
      setRestoreEpoch((prev) => prev + 1);
    };

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
  }, [socket, connected, boardId]);

  useEffect(() => {
    return () => {
      if (sendTimerRef.current !== null) {
        window.clearTimeout(sendTimerRef.current);
      }
    };
  }, []);

  const flushSend = useCallback(() => {
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
