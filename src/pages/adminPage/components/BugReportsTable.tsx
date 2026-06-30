import { useMemo, useState } from "react";
import { Trash2 } from "lucide-react";
import {
  useAdminBugReports,
  useDeleteBugReport,
  useUpdateBugReportStatus,
  type BugReportRow,
} from "../../../hooks/useAdminBugReports";
import type { BugReportStatus } from "../../../components/bugReport/types";
import { SearchInput } from "./SearchInput";
import { FilterSelect } from "./FilterSelect";
import { Pagination, usePagination } from "./Pagination";

const SEVERITY_STYLE: Record<string, string> = {
  LOW: "bg-[#7a9bbf]/10 text-[#4a6a8a] dark:text-[#7a9bbf] border-[#7a9bbf]/30",
  MEDIUM: "bg-[#d4a843]/10 text-[#a68a2a] dark:text-[#d4a843] border-[#d4a843]/30",
  HIGH: "bg-[#c25a4a]/10 text-[#a8453a] dark:text-[#e07b6b] border-[#c25a4a]/30",
};

const STATUS_OPTIONS: { value: BugReportStatus; label: string }[] = [
  { value: "OPEN", label: "Open" },
  { value: "IN_PROGRESS", label: "In progress" },
  { value: "RESOLVED", label: "Resolved" },
  { value: "CLOSED", label: "Closed" },
];

const FILTER_OPTIONS = [{ value: "", label: "All statuses" }, ...STATUS_OPTIONS];

const reporterLabel = (r: BugReportRow) =>
  r.reporter?.email ?? r.reporterEmail ?? "—";

export const BugReportsTable = () => {
  const { data: reports, isLoading } = useAdminBugReports();
  const updateStatus = useUpdateBugReportStatus();
  const deleteReport = useDeleteBugReport();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);

  const fmt = (d: string) =>
    new Date(d).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });

  const filtered = useMemo(() => {
    if (!reports) return [];
    const q = search.toLowerCase();
    return reports.filter((r) => {
      if (statusFilter && r.status !== statusFilter) return false;
      if (q) {
        const haystack = `${r.description} ${reporterLabel(r)} ${r.url ?? ""}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [reports, search, statusFilter]);

  const { totalPages, paginate } = usePagination(filtered, 12);
  const paged = paginate(page);

  return (
    <div className="rounded-xl border border-black/[0.08] dark:border-white/[0.07] bg-white dark:bg-[#151a17] overflow-hidden">
      <div className="px-5 py-4 border-b border-black/[0.06] dark:border-white/[0.05]">
        <h3 className="text-[14px] font-semibold text-[#1a201c] dark:text-[#e8ece9]">Bug Reports</h3>
        <p className="text-[12px] text-[#858c87] dark:text-[#6e7672] mt-0.5">
          {filtered.length} report{filtered.length === 1 ? "" : "s"}
        </p>
        <div className="flex flex-wrap items-center gap-2 mt-3">
          <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search reports…" />
          <FilterSelect value={statusFilter} onChange={(v) => { setStatusFilter(v); setPage(1); }} options={FILTER_OPTIONS} />
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
                {["Severity", "Description", "Reporter", "Status", "When", ""].map((h) => (
                  <th key={h} className="px-5 py-2.5 text-left text-[11px] uppercase tracking-[0.06em] font-medium text-[#858c87] dark:text-[#6e7672]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paged.map((r) => (
                <tr key={r.id} className="border-b border-black/[0.04] dark:border-white/[0.04] last:border-0 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors align-top">
                  <td className="px-5 py-3">
                    <span className={`inline-flex items-center h-[20px] px-2 rounded-full border text-[10px] font-medium ${SEVERITY_STYLE[r.severity]}`}>{r.severity}</span>
                  </td>
                  <td className="px-5 py-3 text-[13px] text-[#1a201c] dark:text-[#e8ece9] max-w-[340px]">
                    <p className="whitespace-pre-wrap break-words">{r.description}</p>
                    {r.url && <p className="mt-1 text-[11px] font-mono text-[#858c87] dark:text-[#6e7672] truncate">{r.url}</p>}
                  </td>
                  <td className="px-5 py-3 text-[12px] text-[#858c87] dark:text-[#6e7672] max-w-[180px] truncate">{reporterLabel(r)}</td>
                  <td className="px-5 py-3">
                    <select
                      value={r.status}
                      disabled={updateStatus.isPending}
                      onChange={(e) => updateStatus.mutate({ id: r.id, status: e.target.value as BugReportStatus })}
                      className="h-[28px] px-2 rounded-lg border border-black/[0.08] dark:border-white/[0.07] bg-white dark:bg-[#1c221e] text-[11px] text-[#1a201c] dark:text-[#e8ece9] cursor-pointer focus:outline-none"
                    >
                      {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </td>
                  <td className="px-5 py-3 text-[12px] text-[#858c87] dark:text-[#6e7672] whitespace-nowrap">{fmt(r.createdAt)}</td>
                  <td className="px-5 py-3">
                    <button
                      onClick={() => deleteReport.mutate(r.id)}
                      disabled={deleteReport.isPending}
                      aria-label="Delete report"
                      className="flex h-7 w-7 items-center justify-center rounded-md text-[#858c87] hover:bg-[#c25a4a]/10 hover:text-[#c25a4a] dark:text-[#6e7672] dark:hover:text-[#e07b6b] transition-colors disabled:opacity-40"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      {!isLoading && filtered.length === 0 && (
        <p className="text-center py-10 text-[13px] text-[#858c87] dark:text-[#6e7672]">No bug reports found.</p>
      )}
    </div>
  );
};
