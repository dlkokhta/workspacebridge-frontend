import type { WhiteboardVersionSummary } from "../../../../hooks/useWhiteboardVersions";
import { formatPersonName, formatRelativeTime } from "../utils";

interface VersionRowProps {
  version: WhiteboardVersionSummary;
  isSelected: boolean;
  onClick: () => void;
}

export const VersionRow = ({ version, isSelected, onClick }: VersionRowProps) => (
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
