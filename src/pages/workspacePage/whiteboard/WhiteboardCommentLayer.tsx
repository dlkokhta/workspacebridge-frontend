import { useEffect, useMemo, useRef, useState } from "react";
import type { Socket } from "socket.io-client";
import type { OrderedExcalidrawElement } from "@excalidraw/excalidraw/element/types";
import { useWhiteboardComments } from "../../../hooks/useWhiteboardComments";
import { sceneToScreen } from "./utils";
import { CommentPin } from "./comments/CommentPin";
import { AddCommentButton } from "./comments/AddCommentButton";
import { CommentPopover } from "./comments/CommentPopover";

interface WhiteboardCommentLayerProps {
  boardId: string;
  socket: Socket | null;
  currentUserId: string | null;
  elements: readonly OrderedExcalidrawElement[];
  scrollX: number;
  scrollY: number;
  zoom: number;
  selectedElementId: string | null;
}

export const WhiteboardCommentLayer = ({
  boardId,
  socket,
  currentUserId,
  elements,
  scrollX,
  scrollY,
  zoom,
  selectedElementId,
}: WhiteboardCommentLayerProps) => {
  const { commentsByElement, addComment, deleteComment } = useWhiteboardComments(
    boardId,
    socket,
  );

  const containerRef = useRef<HTMLDivElement | null>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [openElementId, setOpenElementId] = useState<string | null>(null);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;
    const updateSize = () => {
      setContainerSize({
        width: node.clientWidth,
        height: node.clientHeight,
      });
    };
    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const elementsById = useMemo(() => {
    const map = new Map<string, OrderedExcalidrawElement>();
    for (const element of elements) {
      if (!element.isDeleted) map.set(element.id, element);
    }
    return map;
  }, [elements]);

  const pins = useMemo(() => {
    const result: Array<{
      element: OrderedExcalidrawElement;
      count: number;
    }> = [];
    for (const [elementId, list] of commentsByElement) {
      const element = elementsById.get(elementId);
      if (!element || list.length === 0) continue;
      result.push({ element, count: list.length });
    }
    return result;
  }, [commentsByElement, elementsById]);

  const selectedElement = selectedElementId
    ? elementsById.get(selectedElementId) ?? null
    : null;
  const selectedHasComments = selectedElementId
    ? commentsByElement.has(selectedElementId)
    : false;

  const openElement = openElementId ? elementsById.get(openElementId) : null;
  const openComments = openElementId
    ? commentsByElement.get(openElementId) ?? []
    : [];

  return (
    <div ref={containerRef} className="absolute inset-0 pointer-events-none">
      <div className="absolute inset-0">
        {pins.map(({ element, count }) => {
          const point = sceneToScreen(
            element.x + element.width,
            element.y,
            scrollX,
            scrollY,
            zoom,
          );
          return (
            <div key={element.id} className="pointer-events-auto">
              <CommentPin
                point={point}
                count={count}
                isActive={openElementId === element.id}
                onClick={() =>
                  setOpenElementId((prev) =>
                    prev === element.id ? null : element.id,
                  )
                }
              />
            </div>
          );
        })}

        {selectedElement &&
          !selectedHasComments &&
          openElementId !== selectedElement.id && (
            <div className="pointer-events-auto">
              <AddCommentButton
                point={sceneToScreen(
                  selectedElement.x + selectedElement.width,
                  selectedElement.y,
                  scrollX,
                  scrollY,
                  zoom,
                )}
                onClick={() => setOpenElementId(selectedElement.id)}
              />
            </div>
          )}

        {openElement && (
          <div className="pointer-events-auto">
            <CommentPopover
              point={sceneToScreen(
                openElement.x + openElement.width,
                openElement.y,
                scrollX,
                scrollY,
                zoom,
              )}
              containerWidth={containerSize.width}
              containerHeight={containerSize.height}
              comments={openComments}
              currentUserId={currentUserId}
              onClose={() => setOpenElementId(null)}
              onAdd={(body) => addComment(openElement.id, body)}
              onDelete={(commentId) => deleteComment(commentId)}
            />
          </div>
        )}
      </div>
    </div>
  );
};
