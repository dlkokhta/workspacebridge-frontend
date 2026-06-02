import type { SearchResult } from "../../hooks/useSearch";
import { SEARCH_TYPE_META } from "./searchMeta";
import { SearchHighlight } from "./SearchHighlight";

interface SearchResultRowProps {
  result: SearchResult;
  active: boolean;
  onSelect: () => void;
  onHover: () => void;
}

export const SearchResultRow = ({
  result,
  active,
  onSelect,
  onHover,
}: SearchResultRowProps) => {
  const meta = SEARCH_TYPE_META[result.type];
  const Icon = meta.icon;

  return (
    <button
      type="button"
      onClick={onSelect}
      onMouseMove={onHover}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors cursor-pointer ${
        active
          ? "bg-[#5a8a6b]/10"
          : "hover:bg-black/[0.03] dark:hover:bg-white/[0.04]"
      }`}
    >
      <span className="w-7 h-7 shrink-0 flex items-center justify-center rounded-md bg-[#f3f3ee] dark:bg-[#1c221e] text-[#5a8a6b]">
        <Icon size={14} />
      </span>
      <span className="flex flex-col min-w-0 flex-1">
        <span className="text-[13px] font-medium text-[#1a201c] dark:text-[#e8ece9] truncate">
          {result.title}
        </span>
        <span className="text-[12px] text-[#5a625e] dark:text-[#a0a8a3] truncate">
          <SearchHighlight text={result.snippet} />
        </span>
      </span>
      <span className="flex flex-col items-end gap-0.5 shrink-0">
        <span className="text-[10px] uppercase tracking-[0.06em] font-medium text-[#858c87] dark:text-[#6e7672]">
          {meta.label}
        </span>
        {result.workspaceName && result.type !== "workspace" && (
          <span className="text-[11px] text-[#858c87] dark:text-[#6e7672] truncate max-w-[120px]">
            {result.workspaceName}
          </span>
        )}
      </span>
    </button>
  );
};
