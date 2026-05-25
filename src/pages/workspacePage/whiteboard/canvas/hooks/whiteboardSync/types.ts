import type { Dispatch, RefObject, SetStateAction } from "react";
import type {
  AppState,
  BinaryFiles,
  ExcalidrawImperativeAPI,
} from "@excalidraw/excalidraw/types";
import type { OrderedExcalidrawElement } from "@excalidraw/excalidraw/element/types";

export interface UseWhiteboardSyncResult {
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

export interface BoardStatePayload {
  elements: unknown[];
  files?: BinaryFiles | null;
}

export interface SceneUpdatePayload {
  elements: unknown[];
  files?: BinaryFiles | null;
}

export interface BoardRestoredPayload {
  boardId: string;
  elements: unknown;
  appState: unknown;
  files: unknown;
}

export interface OverlayState {
  elements: readonly OrderedExcalidrawElement[];
  scrollX: number;
  scrollY: number;
  zoom: number;
  selectedElementId: string | null;
}

export const EMPTY_OVERLAY: OverlayState = {
  elements: [],
  scrollX: 0,
  scrollY: 0,
  zoom: 1,
  selectedElementId: null,
};

// Shared mutable state passed to subscription handlers. Refs are owned by
// the hook; handlers read and write them as the protocol requires.
export interface SyncContext {
  boardId: string;
  apiRef: RefObject<ExcalidrawImperativeAPI | null>;
  hasJoinedRef: RefObject<boolean>;
  lastSyncedSigRef: RefObject<string>;
  knownRemoteFileIdsRef: RefObject<Set<string>>;
  lastSentFileIdsRef: RefObject<Set<string>>;
  pendingElementsRef: RefObject<readonly OrderedExcalidrawElement[] | null>;
  pendingFilesRef: RefObject<BinaryFiles | null>;
  sendTimerRef: RefObject<number | null>;
  setInitialElements: Dispatch<SetStateAction<OrderedExcalidrawElement[] | null>>;
  setInitialFiles: Dispatch<SetStateAction<BinaryFiles>>;
  setDirty: Dispatch<SetStateAction<boolean>>;
  setRestoreEpoch: Dispatch<SetStateAction<number>>;
}
