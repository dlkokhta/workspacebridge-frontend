import { useCallback, useEffect, useRef, useState } from "react";
import {
  CaptureUpdateAction,
  Excalidraw,
  reconcileElements,
} from "@excalidraw/excalidraw";
import "@excalidraw/excalidraw/index.css";
import type {
  BinaryFileData,
  BinaryFiles,
  Collaborator,
  ExcalidrawImperativeAPI,
  SocketId,
} from "@excalidraw/excalidraw/types";
import type { OrderedExcalidrawElement } from "@excalidraw/excalidraw/element/types";
import type { RemoteExcalidrawElement } from "@excalidraw/excalidraw/data/reconcile";
import { useWhiteboardSocket } from "../../../hooks/useWhiteboardSocket";
import { useTheme } from "../../../context/ThemeContext";

interface WhiteboardCanvasProps {
  boardId: string;
}

interface BoardStatePayload {
  elements: unknown[];
  files?: BinaryFiles | null;
}

interface SceneUpdatePayload {
  elements: unknown[];
  files?: BinaryFiles | null;
}

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

const SYNC_DEBOUNCE_MS = 300;
const POINTER_THROTTLE_MS = 50;
const COLLABORATOR_TTL_MS = 10000;
const COLLABORATOR_SWEEP_MS = 3000;

const CURSOR_COLORS = [
  { background: "#fef3c7", stroke: "#d97706" },
  { background: "#dbeafe", stroke: "#2563eb" },
  { background: "#fce7f3", stroke: "#db2777" },
  { background: "#d1fae5", stroke: "#059669" },
  { background: "#ede9fe", stroke: "#7c3aed" },
  { background: "#fee2e2", stroke: "#dc2626" },
];

const hashStr = (s: string): number => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
};

const colorFor = (userId: string) =>
  CURSOR_COLORS[hashStr(userId) % CURSOR_COLORS.length];

const sigOf = (elements: readonly OrderedExcalidrawElement[]) =>
  elements.map((e) => `${e.id}:${e.version}`).join("|");

const displayNameFor = (entry: CollaboratorEntry) => {
  const first = entry.firstname?.trim();
  const last = entry.lastname?.trim();
  if (first && last) return `${first} ${last[0]}.`;
  if (first) return first;
  if (last) return last;
  return entry.email.split("@")[0];
};

export const WhiteboardCanvas = ({ boardId }: WhiteboardCanvasProps) => {
  const { socket, connected } = useWhiteboardSocket();
  const { theme } = useTheme();
  const [initialElements, setInitialElements] = useState<
    OrderedExcalidrawElement[] | null
  >(null);
  const [initialFiles, setInitialFiles] = useState<BinaryFiles>({});
  const [dirty, setDirty] = useState(false);

  const apiRef = useRef<ExcalidrawImperativeAPI | null>(null);
  const lastSyncedSigRef = useRef<string>("");
  const lastSentFileIdsRef = useRef<Set<string>>(new Set());
  const knownRemoteFileIdsRef = useRef<Set<string>>(new Set());

  const sendTimerRef = useRef<number | null>(null);
  const pendingElementsRef = useRef<readonly OrderedExcalidrawElement[] | null>(
    null,
  );
  const pendingFilesRef = useRef<BinaryFiles | null>(null);

  const pointerTimerRef = useRef<number | null>(null);
  const lastPointerSentRef = useRef<number>(0);
  const pendingPointerRef = useRef<{
    pointer: { x: number; y: number };
    button: "up" | "down";
  } | null>(null);

  const collaboratorsRef = useRef<Map<string, CollaboratorEntry>>(new Map());
  const hasJoinedRef = useRef<boolean>(false);
  const flushSendRef = useRef<() => void>(() => {});

  const pushCollaboratorsToScene = useCallback(() => {
    if (!apiRef.current) return;
    const map = new Map<SocketId, Collaborator>();
    for (const [userId, entry] of collaboratorsRef.current) {
      map.set(userId as SocketId, {
        id: userId,
        socketId: userId as SocketId,
        pointer: { ...entry.pointer, tool: "pointer" },
        button: entry.button,
        username: displayNameFor(entry),
        color: colorFor(userId),
      });
    }
    apiRef.current.updateScene({
      collaborators: map,
      captureUpdate: CaptureUpdateAction.NEVER,
    });
  }, []);

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

    socket.on("boardState", onBoardState);
    socket.on("sceneUpdate", onSceneUpdate);
    socket.on("pointerUpdate", onRemotePointer);
    socket.on("collaboratorLeft", onCollaboratorLeft);

    let flushTimer: number | null = null;
    if (pendingElementsRef.current !== null) {
      flushTimer = window.setTimeout(() => flushSendRef.current(), 100);
    }

    return () => {
      socket.off("boardState", onBoardState);
      socket.off("sceneUpdate", onSceneUpdate);
      socket.off("pointerUpdate", onRemotePointer);
      socket.off("collaboratorLeft", onCollaboratorLeft);
      if (flushTimer !== null) window.clearTimeout(flushTimer);
    };
  }, [socket, connected, boardId, pushCollaboratorsToScene]);

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
      if (sendTimerRef.current !== null) {
        window.clearTimeout(sendTimerRef.current);
      }
      if (pointerTimerRef.current !== null) {
        window.clearTimeout(pointerTimerRef.current);
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
      _appState: unknown,
      files: BinaryFiles,
    ) => {
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

  if (initialElements === null) {
    return (
      <div className="flex-1 min-h-0 w-full flex items-center justify-center text-[13px] text-[#858c87] dark:text-[#6e7672]">
        Loading whiteboard…
      </div>
    );
  }

  const status: "offline" | "saving" | "saved" = !connected
    ? "offline"
    : dirty
      ? "saving"
      : "saved";

  const statusLabel =
    status === "offline" ? "Offline" : status === "saving" ? "Saving…" : "Saved";
  const statusDot =
    status === "offline"
      ? "bg-[#858c87]"
      : status === "saving"
        ? "bg-[#d97706]"
        : "bg-[#5a8a6b]";

  return (
    <div className="flex-1 min-h-0 w-full relative">
      <div className="absolute top-2.5 right-2.5 z-10 inline-flex items-center gap-1.5 h-6 px-2.5 rounded-full bg-white/95 dark:bg-[#151a17]/95 border border-black/[0.08] dark:border-white/[0.07] backdrop-blur text-[11px] text-[#5a625e] dark:text-[#a0a8a3] shadow-sm pointer-events-none">
        <span className={`w-1.5 h-1.5 rounded-full ${statusDot}`} />
        {statusLabel}
      </div>
      <Excalidraw
        key={boardId}
        theme={theme}
        initialData={{ elements: initialElements, files: initialFiles }}
        excalidrawAPI={(api) => {
          apiRef.current = api;
        }}
        onChange={onChange}
        onPointerUpdate={onPointerUpdate}
        isCollaborating
      />
    </div>
  );
};
