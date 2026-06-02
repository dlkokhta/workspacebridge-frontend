import { useEffect, useMemo, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X } from "lucide-react";
import {
  MIN_SEARCH_LENGTH,
  useSearch,
  type SearchResult,
} from "../../hooks/useSearch";
import { SEARCH_TYPE_META } from "./searchMeta";
import { SearchResultRow } from "./SearchResultRow";

interface SearchPaletteProps {
  open: boolean;
  onClose: () => void;
  /** When set, search is scoped to this workspace instead of going global. */
  workspaceId?: string;
  /** Overrides the default freelancer navigation (used by the client portal,
   *  which switches its own tab instead of routing to /workspace/:id). */
  onNavigate?: (result: SearchResult) => void;
}

export const SearchPalette = ({
  open,
  onClose,
  workspaceId,
  onNavigate,
}: SearchPaletteProps) => {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data, isFetching } = useSearch({ q, workspaceId, enabled: open });
  const results = useMemo(() => data?.results ?? [], [data]);

  // Reset and focus the input each time the palette opens.
  useEffect(() => {
    if (open) {
      setQ("");
      setActiveIndex(0);
      inputRef.current?.focus();
    }
  }, [open]);

  // Snap the highlight back to the top whenever the result set changes.
  useEffect(() => {
    setActiveIndex(0);
  }, [results]);

  if (!open) return null;

  const go = (result: SearchResult) => {
    onClose();
    if (onNavigate) {
      onNavigate(result);
      return;
    }
    if (!result.workspaceId) {
      navigate("/dashboard");
      return;
    }
    if (result.type === "workspace") {
      navigate(`/workspace/${result.workspaceId}`);
      return;
    }
    const { tab } = SEARCH_TYPE_META[result.type];
    const focusId = result.parentId ?? result.id;
    navigate(`/workspace/${result.workspaceId}?tab=${tab}&focus=${focusId}`);
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && results[activeIndex]) {
      e.preventDefault();
      go(results[activeIndex]);
    } else if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    }
  };

  const tooShort = q.trim().length < MIN_SEARCH_LENGTH;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 pt-[12vh]"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-white dark:bg-[#151a17] border border-black/[0.08] dark:border-white/[0.07] rounded-2xl shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={onKeyDown}
      >
        <div className="flex items-center gap-2.5 px-4 h-14 border-b border-black/[0.06] dark:border-white/[0.05]">
          <Search
            size={16}
            className="text-[#858c87] dark:text-[#6e7672] shrink-0"
          />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search messages, files, tasks…"
            className="flex-1 bg-transparent outline-none text-[14px] text-[#1a201c] dark:text-[#e8ece9] placeholder:text-[#b5bbb7] dark:placeholder:text-[#4a514d]"
          />
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-[#858c87] dark:text-[#6e7672] hover:bg-black/[0.05] dark:hover:bg-white/[0.05] cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>

        <div className="max-h-[52vh] overflow-y-auto p-2">
          {tooShort ? (
            <p className="px-3 py-8 text-center text-[13px] text-[#858c87] dark:text-[#6e7672]">
              Type at least {MIN_SEARCH_LENGTH} characters to search.
            </p>
          ) : isFetching && results.length === 0 ? (
            <p className="px-3 py-8 text-center text-[13px] text-[#858c87] dark:text-[#6e7672]">
              Searching…
            </p>
          ) : results.length === 0 ? (
            <p className="px-3 py-8 text-center text-[13px] text-[#858c87] dark:text-[#6e7672]">
              No results for “{q.trim()}”.
            </p>
          ) : (
            results.map((result, i) => (
              <SearchResultRow
                key={`${result.type}-${result.id}`}
                result={result}
                active={i === activeIndex}
                onSelect={() => go(result)}
                onHover={() => setActiveIndex(i)}
              />
            ))
          )}
        </div>

        <div className="flex items-center gap-4 px-4 h-9 border-t border-black/[0.06] dark:border-white/[0.05] text-[11px] text-[#858c87] dark:text-[#6e7672]">
          <span>↑↓ navigate</span>
          <span>↵ open</span>
          <span>esc close</span>
        </div>
      </div>
    </div>
  );
};
