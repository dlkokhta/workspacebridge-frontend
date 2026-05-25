import { CaptureUpdateAction, reconcileElements } from "@excalidraw/excalidraw";
import type {
  BinaryFileData,
  BinaryFiles,
  ExcalidrawImperativeAPI,
} from "@excalidraw/excalidraw/types";
import type { RemoteExcalidrawElement } from "@excalidraw/excalidraw/data/reconcile";

// Reconcile remote elements against the local scene and apply the result
// without re-capturing the change (we already know it came from the wire).
export const applyReconciledScene = (
  api: ExcalidrawImperativeAPI,
  remoteElements: RemoteExcalidrawElement[],
): RemoteExcalidrawElement[] => {
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
  return reconciled as RemoteExcalidrawElement[];
};

// Add only the files we haven't seen before to the Excalidraw scene, and
// update the known-file set so we don't add them twice.
export const mergeIncomingFiles = (
  api: ExcalidrawImperativeAPI,
  files: BinaryFiles,
  knownIds: Set<string>,
): void => {
  const incoming: BinaryFileData[] = [];
  for (const [id, file] of Object.entries(files)) {
    if (!knownIds.has(id)) {
      incoming.push(file);
      knownIds.add(id);
    }
  }
  if (incoming.length > 0) api.addFiles(incoming);
};
