import { lazy, Suspense } from "react";
import type {
  WhiteboardVersionDetail,
  WhiteboardVersionSummary,
} from "../../../../hooks/useWhiteboardVersions";
import { formatExactTime, formatPersonName, formatRelativeTime } from "../utils";

const ExcalidrawPreview = lazy(() =>
  import("@excalidraw/excalidraw").then((m) => ({ default: m.Excalidraw })),
);

interface VersionPreviewProps {
  selectedSummary: WhiteboardVersionSummary | null;
  detail: WhiteboardVersionDetail | null;
  detailLoading: boolean;
  restoring: boolean;
  restoreError: string | null;
  theme: "light" | "dark";
  hasVersions: boolean;
  onRestore: () => void;
}

export const VersionPreview = ({
  selectedSummary,
  detail,
  detailLoading,
  restoring,
  restoreError,
  theme,
  hasVersions,
  onRestore,
}: VersionPreviewProps) => {
  if (!selectedSummary) {
    return (
      <div className="flex-1 flex items-center justify-center text-[12px] text-[#858c87] dark:text-[#6e7672]">
        {!hasVersions
          ? "No versions to preview."
          : "Pick a version on the left to preview it."}
      </div>
    );
  }

  return (
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
            {selectedSummary.type === "MANUAL" ? "Manual" : "Auto-saved"}
          </p>
        </div>
        <button
          onClick={onRestore}
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
  );
};
