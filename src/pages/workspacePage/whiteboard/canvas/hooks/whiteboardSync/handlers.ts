import type {
  BinaryFiles,
} from "@excalidraw/excalidraw/types";
import type { OrderedExcalidrawElement } from "@excalidraw/excalidraw/element/types";
import type { RemoteExcalidrawElement } from "@excalidraw/excalidraw/data/reconcile";
import { sigOf } from "../../../utils";
import { applyReconciledScene, mergeIncomingFiles } from "./helpers";
import type {
  BoardRestoredPayload,
  BoardStatePayload,
  SceneUpdatePayload,
  SyncContext,
} from "./types";

// Initial join: cache the canonical elements/files. Subsequent boardState
// emits (e.g. a peer requested a refresh) reconcile against the local scene.
export const makeBoardStateHandler =
  (ctx: SyncContext) => (payload: BoardStatePayload) => {
    const elements = (payload.elements ?? []) as OrderedExcalidrawElement[];
    const files = payload.files ?? {};

    if (!ctx.hasJoinedRef.current) {
      ctx.lastSyncedSigRef.current = sigOf(elements);
      ctx.knownRemoteFileIdsRef.current = new Set(Object.keys(files));
      ctx.lastSentFileIdsRef.current = new Set(Object.keys(files));
      ctx.setInitialFiles(files);
      ctx.setInitialElements(elements);
      ctx.hasJoinedRef.current = true;
      return;
    }

    const api = ctx.apiRef.current;
    if (!api) return;
    const reconciled = applyReconciledScene(
      api,
      elements as RemoteExcalidrawElement[],
    );
    ctx.lastSyncedSigRef.current = sigOf(reconciled);
    mergeIncomingFiles(api, files, ctx.knownRemoteFileIdsRef.current);
  };

// Live updates from peers as they edit the board.
export const makeSceneUpdateHandler =
  (ctx: SyncContext) => (payload: SceneUpdatePayload) => {
    const remoteElements = (payload.elements ?? []) as RemoteExcalidrawElement[];
    ctx.lastSyncedSigRef.current = sigOf(remoteElements);

    const api = ctx.apiRef.current;
    if (api) {
      applyReconciledScene(api, remoteElements);
    }
    if (payload.files && api) {
      mergeIncomingFiles(
        api,
        payload.files as BinaryFiles,
        ctx.knownRemoteFileIdsRef.current,
      );
    }
  };

// Version restore: wipe pending edits and re-seed the scene with the
// restored version's elements/files.
export const makeBoardRestoredHandler =
  (ctx: SyncContext) => (payload: BoardRestoredPayload) => {
    if (payload.boardId !== ctx.boardId) return;
    const elements = (
      Array.isArray(payload.elements) ? payload.elements : []
    ) as OrderedExcalidrawElement[];
    const files = (payload.files ?? {}) as BinaryFiles;

    ctx.lastSyncedSigRef.current = sigOf(elements);
    ctx.knownRemoteFileIdsRef.current = new Set(Object.keys(files));
    ctx.lastSentFileIdsRef.current = new Set(Object.keys(files));
    ctx.pendingElementsRef.current = null;
    ctx.pendingFilesRef.current = null;
    if (ctx.sendTimerRef.current !== null) {
      window.clearTimeout(ctx.sendTimerRef.current);
      ctx.sendTimerRef.current = null;
    }
    ctx.setInitialElements(elements);
    ctx.setInitialFiles(files);
    ctx.hasJoinedRef.current = true;
    ctx.setDirty(false);
    ctx.setRestoreEpoch((prev) => prev + 1);
  };
