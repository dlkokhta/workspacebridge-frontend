import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
} from "react";

interface MenuPosition {
  top: number;
  left: number;
}

export const useBoardMenu = () => {
  const [openId, setOpenId] = useState<string | null>(null);
  const [pos, setPos] = useState<MenuPosition | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const close = useCallback(() => {
    setOpenId(null);
    setPos(null);
  }, []);

  const toggle = useCallback(
    (e: ReactMouseEvent<HTMLButtonElement>, boardId: string) => {
      if (openId === boardId) {
        close();
        return;
      }
      const rect = e.currentTarget.getBoundingClientRect();
      setPos({ top: rect.bottom + 4, left: rect.right - 140 });
      setOpenId(boardId);
    },
    [openId, close],
  );

  // Close on outside click, scroll, or resize so the popup never drifts
  // from its anchor.
  useEffect(() => {
    if (!openId) return;
    const onMouseDown = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        close();
      }
    };
    document.addEventListener("mousedown", onMouseDown);
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [openId, close]);

  return { openId, pos, containerRef, toggle, close };
};
