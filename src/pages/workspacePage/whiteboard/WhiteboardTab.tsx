import { lazy, Suspense, useState } from "react";
import { useWhiteboardSocket } from "../../../hooks/useWhiteboardSocket";
import { TemplatePickerModal } from "./templatePicker/TemplatePickerModal";
import { BoardTabsBar } from "./boards/BoardTabsBar";
import { DeleteBoardModal } from "./boards/DeleteBoardModal";
import { useBoards, type BoardSummary } from "./boards/useBoards";

const WhiteboardCanvas = lazy(() =>
  import("./canvas/WhiteboardCanvas").then((m) => ({
    default: m.WhiteboardCanvas,
  })),
);

interface WhiteboardTabProps {
  workspaceId: string;
  // The workspace owner (freelancer) is the presenter whose board switches
  // clients follow. Clients (portal) pass false.
  isOwner: boolean;
}

export const WhiteboardTab = ({ workspaceId, isOwner }: WhiteboardTabProps) => {
  // One whiteboard socket for the whole tab: it carries both the board-list
  // sync (here) and the per-board scene sync (passed down to the canvas).
  const { socket, connected } = useWhiteboardSocket();
  const {
    boards,
    selectedId,
    setSelectedId,
    error,
    creating,
    createBoard,
    renameBoard,
    duplicateBoard,
    deleteBoard,
  } = useBoards(workspaceId, { socket, connected, isOwner });

  const [templatePickerOpen, setTemplatePickerOpen] = useState(false);
  const [confirmBoard, setConfirmBoard] = useState<BoardSummary | null>(null);

  if (error) {
    return (
      <div className="flex-1 min-h-0 w-full flex items-center justify-center text-[13px] text-[#c25a4a]">
        {error}
      </div>
    );
  }

  if (!boards || !selectedId) {
    return (
      <div className="flex-1 min-h-0 w-full flex items-center justify-center text-[13px] text-[#858c87] dark:text-[#6e7672]">
        Loading whiteboards…
      </div>
    );
  }

  const handleConfirmDelete = async () => {
    if (!confirmBoard) return;
    const board = confirmBoard;
    setConfirmBoard(null);
    await deleteBoard(board);
  };

  return (
    <div className="flex flex-col flex-1 overflow-hidden min-h-0">
      <BoardTabsBar
        boards={boards}
        selectedId={selectedId}
        creating={creating}
        onSelect={setSelectedId}
        onRename={renameBoard}
        onDuplicate={duplicateBoard}
        onRequestDelete={setConfirmBoard}
        onNewBoard={() => setTemplatePickerOpen(true)}
      />
      <Suspense
        fallback={
          <div className="flex-1 min-h-0 w-full flex items-center justify-center text-[13px] text-[#858c87] dark:text-[#6e7672]">
            Loading whiteboard…
          </div>
        }
      >
        <WhiteboardCanvas
          boardId={selectedId}
          socket={socket}
          connected={connected}
        />
      </Suspense>
      <TemplatePickerModal
        isOpen={templatePickerOpen}
        onClose={() => {
          if (!creating) setTemplatePickerOpen(false);
        }}
        onCreate={async (template, name) => {
          await createBoard(template, name);
          setTemplatePickerOpen(false);
        }}
        creating={creating}
      />
      {confirmBoard && (
        <DeleteBoardModal
          boardName={confirmBoard.name}
          onConfirm={() => void handleConfirmDelete()}
          onCancel={() => setConfirmBoard(null)}
        />
      )}
    </div>
  );
};
