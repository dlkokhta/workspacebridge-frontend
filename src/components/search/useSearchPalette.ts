import { useCallback, useEffect, useState } from "react";

/**
 * Owns the open/closed state of the global search palette and the global
 * Cmd/Ctrl+K shortcut that toggles it.
 */
export const useSearchPalette = () => {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return { open, setOpen, close };
};
