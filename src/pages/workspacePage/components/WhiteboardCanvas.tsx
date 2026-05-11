import { Excalidraw } from "@excalidraw/excalidraw";
import "@excalidraw/excalidraw/index.css";

interface WhiteboardCanvasProps {
  workspaceId: string;
}

export const WhiteboardCanvas = ({ workspaceId }: WhiteboardCanvasProps) => {
  return (
    <div className="flex-1 min-h-0 w-full">
      <Excalidraw key={workspaceId} />
    </div>
  );
};
