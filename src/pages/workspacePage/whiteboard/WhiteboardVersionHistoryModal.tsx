import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import "@excalidraw/excalidraw/index.css";
import { History, X } from "lucide-react";
import {
  useWhiteboardVersions,
  type RestoredBoard,
  type WhiteboardVersionDetail,
} from "../../../hooks/useWhiteboardVersions";
import { useTheme } from "../../../context/ThemeContext";
import { VersionsList } from "./versions/VersionsList";
import { VersionPreview } from "./versions/VersionPreview";

interface WhiteboardVersionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  boardId: string;
  onRestored: (restored: RestoredBoard) => void;
}

export const WhiteboardVersionHistoryModal = ({
  isOpen,
  onClose,
  boardId,
  onRestored,
}: WhiteboardVersionHistoryModalProps) => {
  const { theme } = useTheme();
  const { versions, loading, error, getVersion, restoreVersion } =
    useWhiteboardVersions(boardId);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<WhiteboardVersionDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [restoreError, setRestoreError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setSelectedId(null);
      setDetail(null);
      setRestoreError(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || versions.length === 0) return;
    if (!selectedId || !versions.some((v) => v.id === selectedId)) {
      setSelectedId(versions[0].id);
    }
  }, [isOpen, versions, selectedId]);

  useEffect(() => {
    if (!selectedId) {
      setDetail(null);
      return;
    }
    let cancelled = false;
    setDetailLoading(true);
    getVersion(selectedId)
      .then((data) => {
        if (!cancelled) setDetail(data);
      })
      .catch(() => {
        if (!cancelled) setDetail(null);
      })
      .finally(() => {
        if (!cancelled) setDetailLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedId, getVersion]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !restoring) onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose, restoring]);

  const selectedSummary = useMemo(
    () => versions.find((v) => v.id === selectedId) ?? null,
    [versions, selectedId],
  );

  const handleRestore = async () => {
    if (!selectedId || restoring) return;
    setRestoring(true);
    setRestoreError(null);
    try {
      const restored = await restoreVersion(selectedId);
      onRestored(restored);
      onClose();
    } catch {
      setRestoreError("Could not restore this version. Try again.");
    } finally {
      setRestoring(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      onClick={(e) => {
        if (e.target === e.currentTarget && !restoring) onClose();
      }}
    >
      <div className="w-full max-w-[1100px] h-[80vh] flex flex-col rounded-lg border border-black/[0.08] dark:border-white/[0.07] bg-white dark:bg-[#1a201c] shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-black/[0.06] dark:border-white/[0.05]">
          <div className="inline-flex items-center gap-2">
            <History size={16} className="text-[#5a625e] dark:text-[#a0a8a3]" />
            <h2 className="text-[15px] font-medium text-[#1a201c] dark:text-[#fafaf7]">
              Version history
            </h2>
            <span className="text-[12px] text-[#858c87] dark:text-[#6e7672]">
              {versions.length} {versions.length === 1 ? "version" : "versions"}
            </span>
          </div>
          <button
            onClick={onClose}
            disabled={restoring}
            aria-label="Close"
            className="h-8 w-8 inline-flex items-center justify-center rounded-md text-[#5a625e] dark:text-[#a0a8a3] hover:bg-black/[0.04] dark:hover:bg-white/[0.04] cursor-pointer disabled:opacity-50"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 min-h-0 flex">
          <aside className="w-[260px] shrink-0 border-r border-black/[0.06] dark:border-white/[0.05] overflow-y-auto">
            <VersionsList
              versions={versions}
              loading={loading}
              error={error}
              selectedId={selectedId}
              onSelect={setSelectedId}
            />
          </aside>

          <section className="flex-1 min-w-0 flex flex-col bg-black/[0.015] dark:bg-white/[0.015]">
            <VersionPreview
              selectedSummary={selectedSummary}
              detail={detail}
              detailLoading={detailLoading}
              restoring={restoring}
              restoreError={restoreError}
              theme={theme}
              hasVersions={versions.length > 0}
              onRestore={() => void handleRestore()}
            />
          </section>
        </div>
      </div>
    </div>,
    document.body,
  );
};
