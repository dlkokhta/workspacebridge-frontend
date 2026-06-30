import { Fragment, useMemo, useState } from "react";
import { Trash2, ChevronRight } from "lucide-react";
import {
  useAdminErrorLogs,
  useDeleteErrorLog,
  type ErrorLogRow,
} from "../../../hooks/useAdminErrorLogs";
import { SearchInput } from "./SearchInput";
import { FilterSelect } from "./FilterSelect";
import { Pagination, usePagination } from "./Pagination";

const SOURCE_STYLE: Record<string, string> = {
  "window.onerror": "bg-[#c25a4a]/10 text-[#a8453a] dark:text-[#e07b6b] border-[#c25a4a]/30",
  unhandledrejection: "bg-[#d4a843]/10 text-[#a68a2a] dark:text-[#d4a843] border-[#d4a843]/30",
  "react-error-boundary": "bg-[#9b7abf]/10 text-[#7a5a9b] dark:text-[#b89adb] border-[#9b7abf]/30",
};

const SOURCE_OPTIONS = [
  { value: "", label: "All sources" },
  { value: "window.onerror", label: "Uncaught error" },
  { value: "unhandledrejection", label: "Promise rejection" },
  { value: "react-error-boundary", label: "Render crash" },
];

const userLabel = (e: ErrorLogRow) => e.user?.email ?? "—";

export const ErrorLogsTable = () => {
  const { data: logs, isLoading } = useAdminErrorLogs();
  const deleteLog = useDeleteErrorLog();
  const [search, setSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");
  const [page, setPage] = useState(1);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const toggle = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const fmt = (d: string) =>
    new Date(d).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });

  const filtered = useMemo(() => {
    if (!logs) return [];
    const q = search.toLowerCase();
    return logs.filter((e) => {
      if (sourceFilter && e.source !== sourceFilter) return false;
      if (q) {
        const haystack = `${e.message} ${userLabel(e)} ${e.url ?? ""}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [logs, search, sourceFilter]);

  const { totalPages, paginate } = usePagination(filtered, 12);
  const paged = paginate(page);

  return (
    <div className="rounded-xl border border-black/[0.08] dark:border-white/[0.07] bg-white dark:bg-[#151a17] overflow-hidden">
      <div className="px-5 py-4 border-b border-black/[0.06] dark:border-white/[0.05]">
        <h3 className="text-[14px] font-semibold text-[#1a201c] dark:text-[#e8ece9]">Error Logs</h3>
        <p className="text-[12px] text-[#858c87] dark:text-[#6e7672] mt-0.5">
          {filtered.length} error{filtered.length === 1 ? "" : "s"} · click a row for the stack trace
        </p>
        <div className="flex flex-wrap items-center gap-2 mt-3">
          <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search errors…" />
          <FilterSelect value={sourceFilter} onChange={(v) => { setSourceFilter(v); setPage(1); }} options={SOURCE_OPTIONS} />
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <p className="text-[13px] text-[#858c87] dark:text-[#6e7672]">Loading…</p>
        </div>
      )}

      {paged.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-black/[0.06] dark:border-white/[0.05]">
                {["Source", "Message", "User", "When", ""].map((h) => (
                  <th key={h} className="px-5 py-2.5 text-left text-[11px] uppercase tracking-[0.06em] font-medium text-[#858c87] dark:text-[#6e7672]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paged.map((e) => {
                const isOpen = expanded.has(e.id);
                return (
                  <Fragment key={e.id}>
                    <tr className="border-b border-black/[0.04] dark:border-white/[0.04] hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors cursor-pointer" onClick={() => toggle(e.id)}>
                      <td className="px-5 py-3">
                        <span className={`inline-flex items-center h-[20px] px-2 rounded-full border text-[10px] font-medium ${SOURCE_STYLE[e.source] ?? SOURCE_STYLE["window.onerror"]}`}>{e.source}</span>
                      </td>
                      <td className="px-5 py-3 text-[13px] text-[#1a201c] dark:text-[#e8ece9] max-w-[380px]">
                        <div className="flex items-start gap-1.5">
                          <ChevronRight size={13} className={`mt-0.5 shrink-0 text-[#858c87] transition-transform ${isOpen ? "rotate-90" : ""}`} />
                          <span className="truncate">{e.message}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-[12px] text-[#858c87] dark:text-[#6e7672] max-w-[160px] truncate">{userLabel(e)}</td>
                      <td className="px-5 py-3 text-[12px] text-[#858c87] dark:text-[#6e7672] whitespace-nowrap">{fmt(e.createdAt)}</td>
                      <td className="px-5 py-3">
                        <button
                          onClick={(ev) => { ev.stopPropagation(); deleteLog.mutate(e.id); }}
                          disabled={deleteLog.isPending}
                          aria-label="Delete error log"
                          className="flex h-7 w-7 items-center justify-center rounded-md text-[#858c87] hover:bg-[#c25a4a]/10 hover:text-[#c25a4a] dark:text-[#6e7672] dark:hover:text-[#e07b6b] transition-colors disabled:opacity-40"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                    {isOpen && (
                      <tr className="border-b border-black/[0.04] dark:border-white/[0.04] bg-[#fafaf7] dark:bg-[#10130f]">
                        <td colSpan={5} className="px-5 py-3 space-y-2">
                          {e.url && <p className="text-[11px] font-mono text-[#858c87] dark:text-[#6e7672]">URL: {e.url}</p>}
                          {e.stack && (
                            <pre className="text-[11px] font-mono text-[#5a625e] dark:text-[#a0a8a3] whitespace-pre-wrap break-words max-h-64 overflow-y-auto">{e.stack}</pre>
                          )}
                          {e.componentStack && (
                            <pre className="text-[11px] font-mono text-[#858c87] dark:text-[#6e7672] whitespace-pre-wrap break-words max-h-48 overflow-y-auto border-t border-black/[0.06] dark:border-white/[0.05] pt-2">{e.componentStack}</pre>
                          )}
                          {!e.stack && !e.componentStack && (
                            <p className="text-[12px] text-[#b5bbb7] dark:text-[#4a514d]">No stack trace captured.</p>
                          )}
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      {!isLoading && filtered.length === 0 && (
        <p className="text-center py-10 text-[13px] text-[#858c87] dark:text-[#6e7672]">No errors logged.</p>
      )}
    </div>
  );
};
