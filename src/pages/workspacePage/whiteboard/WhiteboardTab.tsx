import { lazy, Suspense, useState } from "react";
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
}

export const WhiteboardTab = ({ workspaceId }: WhiteboardTabProps) => {
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
  } = useBoards(workspaceId);

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
        <WhiteboardCanvas boardId={selectedId} />
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
