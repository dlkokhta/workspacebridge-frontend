import { WhiteboardCanvas } from "../components/WhiteboardCanvas";

interface WhiteboardTabProps {
  workspaceId: string;
}

export const WhiteboardTab = ({ workspaceId }: WhiteboardTabProps) => {
  return (
    <div className="flex flex-col flex-1 overflow-hidden min-h-0">
      <WhiteboardCanvas workspaceId={workspaceId} />
    </div>
  );
};
