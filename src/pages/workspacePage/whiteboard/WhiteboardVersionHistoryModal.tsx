import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import "@excalidraw/excalidraw/index.css";
import { History, Save, X } from "lucide-react";
import {
  useWhiteboardVersions,
  type RestoredBoard,
  type WhiteboardVersionDetail,
  type WhiteboardVersionSummary,
} from "../../../hooks/useWhiteboardVersions";
import { useTheme } from "../../../context/ThemeContext";
import {
  formatExactTime,
  formatPersonName,
  formatRelativeTime,
} from "./utils";

const ExcalidrawPreview = lazy(() =>
  import("@excalidraw/excalidraw").then((m) => ({ default: m.Excalidraw })),
);

interface WhiteboardVersionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  boardId: string;
  onRestored: (restored: RestoredBoard) => void;
}

interface VersionRowProps {
  version: WhiteboardVersionSummary;
  isSelected: boolean;
  onClick: () => void;
}

const VersionRow = ({ version, isSelected, onClick }: VersionRowProps) => (
  <button
    onClick={onClick}
    className={`w-full text-left px-3 py-2 border-l-2 transition-colors cursor-pointer ${
      isSelected
        ? "border-[#5a8a6b] bg-[#5a8a6b]/[0.08] dark:bg-[#5a8a6b]/[0.15]"
        : "border-transparent hover:bg-black/[0.03] dark:hover:bg-white/[0.03]"
    }`}
  >
    <div className="flex items-center justify-between gap-2">
      <span className="text-[13px] font-medium text-[#1a201c] dark:text-[#fafaf7] truncate">
        {version.label?.trim() || formatRelativeTime(version.createdAt)}
      </span>
      {version.type === "AUTO" && (
        <span className="shrink-0 text-[10px] font-medium uppercase tracking-wide text-[#858c87] dark:text-[#6e7672]">
          Auto
        </span>
      )}
    </div>
    <div className="mt-0.5 text-[11px] text-[#858c87] dark:text-[#6e7672]">
      {formatRelativeTime(version.createdAt)} · {formatPersonName(version.createdBy)}
    </div>
  </button>
);

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
            <History
              size={16}
              className="text-[#5a625e] dark:text-[#a0a8a3]"
            />
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
            {loading ? (
              <div className="p-4 text-[12px] text-[#858c87] dark:text-[#6e7672]">
                Loading…
              </div>
            ) : error ? (
              <div className="p-4 text-[12px] text-[#c25a4a]">{error}</div>
            ) : versions.length === 0 ? (
              <div className="p-4 text-[12px] text-[#858c87] dark:text-[#6e7672]">
                <Save size={14} className="inline mr-1.5" />
                No versions yet. Click <span className="font-medium">Save version</span> on the board to capture a snapshot.
              </div>
            ) : (
              <div>
                {versions.map((v) => (
                  <VersionRow
                    key={v.id}
                    version={v}
                    isSelected={v.id === selectedId}
                    onClick={() => setSelectedId(v.id)}
                  />
                ))}
              </div>
            )}
          </aside>

          <section className="flex-1 min-w-0 flex flex-col bg-black/[0.015] dark:bg-white/[0.015]">
            {selectedSummary ? (
              <>
                <div className="px-4 py-3 border-b border-black/[0.06] dark:border-white/[0.05] flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[13px] font-medium text-[#1a201c] dark:text-[#fafaf7] truncate">
                      {selectedSummary.label?.trim() ||
                        `Snapshot from ${formatRelativeTime(selectedSummary.createdAt)}`}
                    </p>
                    <p className="mt-0.5 text-[11px] text-[#858c87] dark:text-[#6e7672]">
                      {formatExactTime(selectedSummary.createdAt)} ·{" "}
                      {formatPersonName(selectedSummary.createdBy)} ·{" "}
                      {selectedSummary.type === "MANUAL"
                        ? "Manual"
                        : "Auto-saved"}
                    </p>
                  </div>
                  <button
                    onClick={() => void handleRestore()}
                    disabled={restoring || detailLoading}
                    className="h-8 px-3 rounded-md text-[12px] font-medium bg-[#5a8a6b] text-white hover:bg-[#4d7a5d] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                  >
                    {restoring ? "Restoring…" : "Restore this version"}
                  </button>
                </div>
                {restoreError && (
                  <p className="px-4 py-2 text-[12px] text-[#c25a4a] border-b border-black/[0.06] dark:border-white/[0.05]">
                    {restoreError}
                  </p>
                )}
                <div className="flex-1 min-h-0 relative">
                  {detailLoading ? (
                    <div className="absolute inset-0 flex items-center justify-center text-[12px] text-[#858c87] dark:text-[#6e7672]">
                      Loading preview…
                    </div>
                  ) : detail ? (
                    <Suspense
                      fallback={
                        <div className="absolute inset-0 flex items-center justify-center text-[12px] text-[#858c87] dark:text-[#6e7672]">
                          Loading preview…
                        </div>
                      }
                    >
                      <ExcalidrawPreview
                        key={detail.id}
                        theme={theme}
                        viewModeEnabled
                        initialData={{
                          elements: detail.elements as never,
                          files: (detail.files ?? {}) as never,
                        }}
                      />
                    </Suspense>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-[12px] text-[#c25a4a]">
                      Could not load preview.
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-[12px] text-[#858c87] dark:text-[#6e7672]">
                {versions.length === 0
                  ? "No versions to preview."
                  : "Pick a version on the left to preview it."}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>,
    document.body,
  );
};
