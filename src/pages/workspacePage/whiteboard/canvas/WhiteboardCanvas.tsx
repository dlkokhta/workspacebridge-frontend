import { useCallback, useEffect, useMemo, useState } from "react";
import { Excalidraw } from "@excalidraw/excalidraw";
import "@excalidraw/excalidraw/index.css";
import type { OrderedExcalidrawElement } from "@excalidraw/excalidraw/element/types";
import { useWhiteboardSocket } from "../../../../hooks/useWhiteboardSocket";
import { useWhiteboardVersions } from "../../../../hooks/useWhiteboardVersions";
import { useTheme } from "../../../../context/ThemeContext";
import { useAuth } from "../../../../context/AuthContext";
import { WhiteboardCommentLayer } from "../WhiteboardCommentLayer";
import { WhiteboardSaveVersionDialog } from "../WhiteboardSaveVersionDialog";
import { WhiteboardVersionHistoryModal } from "../WhiteboardVersionHistoryModal";
import { decodeUserIdFromToken } from "../utils";
import { WhiteboardToolbar } from "./WhiteboardToolbar";
import { useWhiteboardSync } from "./hooks/whiteboardSync/useWhiteboardSync";
import { useCollaboratorCursors } from "./hooks/useCollaboratorCursors";

interface WhiteboardCanvasProps {
  boardId: string;
}

export const WhiteboardCanvas = ({ boardId }: WhiteboardCanvasProps) => {
  const { socket, connected } = useWhiteboardSocket();
  const { theme } = useTheme();
  const { accessToken } = useAuth();
  const currentUserId = useMemo(
    () => decodeUserIdFromToken(accessToken),
    [accessToken],
  );

  const sync = useWhiteboardSync(boardId, socket, connected);
  const { onPointerUpdate } = useCollaboratorCursors(
    boardId,
    socket,
    connected,
    sync.apiRef,
  );

  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const { saveVersion } = useWhiteboardVersions(boardId);

  useEffect(() => {
    setSaveDialogOpen(false);
    setHistoryOpen(false);
  }, [boardId]);

  const handleSaveVersion = useCallback(
    async (label: string) => {
      const api = sync.apiRef.current;
      const elements = api
        ? (api.getSceneElementsIncludingDeleted() as readonly OrderedExcalidrawElement[])
        : sync.initialElements ?? [];
      const files = api ? api.getFiles() : sync.initialFiles;
      const appState = api
        ? (api.getAppState() as unknown as Record<string, unknown>)
        : undefined;
      await saveVersion({
        label: label || undefined,
        elements: [...elements],
        appState,
        files: files as unknown as Record<string, unknown>,
      });
    },
    [saveVersion, sync.apiRef, sync.initialElements, sync.initialFiles],
  );

  if (sync.initialElements === null) {
    return (
      <div className="flex-1 min-h-0 w-full flex items-center justify-center text-[13px] text-[#858c87] dark:text-[#6e7672]">
        Loading whiteboard…
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-0 w-full relative">
      <WhiteboardToolbar
        connected={connected}
        dirty={sync.dirty}
        onSaveVersion={() => setSaveDialogOpen(true)}
        onOpenHistory={() => setHistoryOpen(true)}
      />
      <Excalidraw
        key={`${boardId}-${sync.restoreEpoch}`}
        theme={theme}
        initialData={{
          elements: sync.initialElements,
          files: sync.initialFiles,
        }}
        excalidrawAPI={(api) => {
          sync.apiRef.current = api;
        }}
        onChange={sync.onChange}
        onPointerUpdate={onPointerUpdate}
        isCollaborating
      />
      <WhiteboardCommentLayer
        boardId={boardId}
        socket={socket}
        currentUserId={currentUserId}
        elements={sync.overlay.elements}
        scrollX={sync.overlay.scrollX}
        scrollY={sync.overlay.scrollY}
        zoom={sync.overlay.zoom}
        selectedElementId={sync.overlay.selectedElementId}
      />
      <WhiteboardSaveVersionDialog
        isOpen={saveDialogOpen}
        onClose={() => setSaveDialogOpen(false)}
        onSave={handleSaveVersion}
      />
      <WhiteboardVersionHistoryModal
        isOpen={historyOpen}
        onClose={() => setHistoryOpen(false)}
        boardId={boardId}
        onRestored={() => {
          setHistoryOpen(false);
        }}
      />
    </div>
  );
};
