import { WhiteboardPanel } from "../components/WhiteboardPanel";

interface WhiteboardTabProps {
  workspaceId: string;
}

export const WhiteboardTab = ({ workspaceId }: WhiteboardTabProps) => {
  return <WhiteboardPanel workspaceId={workspaceId} />;
};
