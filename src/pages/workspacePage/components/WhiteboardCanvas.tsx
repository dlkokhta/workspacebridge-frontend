import { useCallback, useEffect, useRef, useState } from "react";
import { CaptureUpdateAction, Excalidraw } from "@excalidraw/excalidraw";
import "@excalidraw/excalidraw/index.css";
import type {
  ExcalidrawImperativeAPI,
} from "@excalidraw/excalidraw/types";
import type { OrderedExcalidrawElement } from "@excalidraw/excalidraw/element/types";
import { useWhiteboardSocket } from "../../../hooks/useWhiteboardSocket";

interface WhiteboardCanvasProps {
  workspaceId: string;
}

interface BoardStatePayload {
  elements: unknown[];
}

interface SceneUpdatePayload {
  elements: unknown[];
}

const SYNC_DEBOUNCE_MS = 300;

const sigOf = (elements: readonly OrderedExcalidrawElement[]) =>
  elements.map((e) => `${e.id}:${e.version}`).join("|");

export const WhiteboardCanvas = ({ workspaceId }: WhiteboardCanvasProps) => {
  const { socket, connected } = useWhiteboardSocket();
  const [initialElements, setInitialElements] = useState<OrderedExcalidrawElement[] | null>(null);
  const apiRef = useRef<ExcalidrawImperativeAPI | null>(null);
  const lastSyncedSigRef = useRef<string>("");
  const sendTimerRef = useRef<number | null>(null);
  const pendingElementsRef = useRef<readonly OrderedExcalidrawElement[] | null>(null);

  useEffect(() => {
    if (!socket || !connected) return;

    socket.emit("joinBoard", { workspaceId });

    const onBoardState = (payload: BoardStatePayload) => {
      const elements = (payload.elements ?? []) as OrderedExcalidrawElement[];
      lastSyncedSigRef.current = sigOf(elements);
      setInitialElements(elements);
    };

    const onSceneUpdate = (payload: SceneUpdatePayload) => {
      const elements = (payload.elements ?? []) as OrderedExcalidrawElement[];
      lastSyncedSigRef.current = sigOf(elements);
      apiRef.current?.updateScene({
        elements,
        captureUpdate: CaptureUpdateAction.NEVER,
      });
    };

    socket.on("boardState", onBoardState);
    socket.on("sceneUpdate", onSceneUpdate);

    return () => {
      socket.off("boardState", onBoardState);
      socket.off("sceneUpdate", onSceneUpdate);
    };
  }, [socket, connected, workspaceId]);

  useEffect(() => {
    return () => {
      if (sendTimerRef.current !== null) {
        window.clearTimeout(sendTimerRef.current);
      }
    };
  }, []);

  const flushSend = useCallback(() => {
    sendTimerRef.current = null;
    const elements = pendingElementsRef.current;
    pendingElementsRef.current = null;
    if (!elements || !socket || !connected) return;
    socket.emit("sceneUpdate", { workspaceId, elements });
  }, [socket, connected, workspaceId]);

  const onChange = useCallback(
    (elements: readonly OrderedExcalidrawElement[]) => {
      const sig = sigOf(elements);
      if (sig === lastSyncedSigRef.current) return;
      lastSyncedSigRef.current = sig;

      pendingElementsRef.current = elements;
      if (sendTimerRef.current !== null) {
        window.clearTimeout(sendTimerRef.current);
      }
      sendTimerRef.current = window.setTimeout(flushSend, SYNC_DEBOUNCE_MS);
    },
    [flushSend],
  );

  if (initialElements === null) {
    return (
      <div className="flex-1 min-h-0 w-full flex items-center justify-center text-[13px] text-[#858c87] dark:text-[#6e7672]">
        Loading whiteboard…
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-0 w-full">
      <Excalidraw
        key={workspaceId}
        initialData={{ elements: initialElements }}
        excalidrawAPI={(api) => {
          apiRef.current = api;
        }}
        onChange={onChange}
      />
    </div>
  );
};
