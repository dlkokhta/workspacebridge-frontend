import { useMemo, useState } from "react";
import { useAdminAuditLog } from "../../../hooks/useAdminAuditLog";
import { SearchInput } from "./SearchInput";
import { FilterSelect } from "./FilterSelect";

const ACTION_LABELS: Record<string, string> = {
  "user.role_change": "Role changed",
  "user.status_change": "Status changed",
  "user.delete": "User deleted",
  "user.reset_password": "Password reset sent",
  "user.force_verify": "Email force-verified",
  "workspace.status_change": "Workspace status changed",
  "workspace.delete": "Workspace deleted",
  "invite.revoke": "Invite revoked",
  "session.revoke": "Session revoked",
  "file.delete": "File deleted",
};

const TARGET_STYLE: Record<string, string> = {
  user: "bg-[#9b7abf]/10 text-[#7a5a9b] dark:text-[#b89adb] border-[#9b7abf]/30",
  workspace: "bg-[#5a8a6b]/10 text-[#3e6a4d] dark:text-[#6db383] border-[#5a8a6b]/30",
  invite: "bg-[#d4a843]/10 text-[#a68a2a] dark:text-[#d4a843] border-[#d4a843]/30",
  session: "bg-[#7a9bbf]/10 text-[#4a6a8a] dark:text-[#7a9bbf] border-[#7a9bbf]/30",
  file: "bg-black/[0.04] dark:bg-white/[0.04] text-[#858c87] dark:text-[#6e7672] border-black/[0.08] dark:border-white/[0.07]",
};

const TARGET_OPTIONS = [
  { value: "", label: "All targets" },
  { value: "user", label: "User" },
  { value: "workspace", label: "Workspace" },
  { value: "invite", label: "Invite" },
  { value: "session", label: "Session" },
  { value: "file", label: "File" },
];

const formatMeta = (meta: Record<string, string> | null) => {
  if (!meta) return null;
  const parts: string[] = [];
  if (meta.email) parts.push(meta.email);
  if (meta.name) parts.push(meta.name);
  if (meta.from && meta.to) parts.push(`${meta.from} → ${meta.to}`);
  return parts.length > 0 ? parts.join(" · ") : null;
};

export const AuditLogTable = () => {
  const { data: entries, isLoading } = useAdminAuditLog();
  const [search, setSearch] = useState("");
  const [targetFilter, setTargetFilter] = useState("");

  const fmtFull = (d: string) =>
    new Date(d).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });

  const filtered = useMemo(() => {
    if (!entries) return [];
    const q = search.toLowerCase();
    return entries.filter((e) => {
      if (targetFilter && e.targetType !== targetFilter) return false;
      if (q) {
        const label = (ACTION_LABELS[e.action] ?? e.action).toLowerCase();
        const meta = formatMeta(e.metadata)?.toLowerCase() ?? "";
        if (!label.includes(q) && !meta.includes(q) && !e.targetType.includes(q)) return false;
      }
      return true;
    });
  }, [entries, search, targetFilter]);

  return (
    <div className="rounded-xl border border-black/[0.08] dark:border-white/[0.07] bg-white dark:bg-[#151a17] overflow-hidden">
      <div className="px-5 py-4 border-b border-black/[0.06] dark:border-white/[0.05]">
        <h3 className="text-[14px] font-semibold text-[#1a201c] dark:text-[#e8ece9]">Audit Log</h3>
        <p className="text-[12px] text-[#858c87] dark:text-[#6e7672] mt-0.5">
          {filtered.length} entr{filtered.length === 1 ? "y" : "ies"}
        </p>
        <div className="flex flex-wrap items-center gap-2 mt-3">
          <SearchInput value={search} onChange={setSearch} placeholder="Search actions or details…" />
          <FilterSelect value={targetFilter} onChange={setTargetFilter} options={TARGET_OPTIONS} />
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <p className="text-[13px] text-[#858c87] dark:text-[#6e7672]">Loading…</p>
        </div>
      )}

      {filtered.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-black/[0.06] dark:border-white/[0.05]">
                {["Action", "Target", "Details", "Actor", "Time"].map((h) => (
                  <th key={h} className="px-5 py-2.5 text-left text-[11px] uppercase tracking-[0.06em] font-medium text-[#858c87] dark:text-[#6e7672]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((entry) => {
                const meta = formatMeta(entry.metadata);
                return (
                  <tr key={entry.id} className="border-b border-black/[0.04] dark:border-white/[0.04] last:border-0 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-3 text-[13px] text-[#1a201c] dark:text-[#e8ece9]">{ACTION_LABELS[entry.action] ?? entry.action}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center h-[20px] px-2 rounded-full border text-[10px] font-medium capitalize ${TARGET_STYLE[entry.targetType] ?? TARGET_STYLE.file}`}>{entry.targetType}</span>
                    </td>
                    <td className="px-5 py-3 text-[12px] text-[#858c87] dark:text-[#6e7672] max-w-[250px] truncate">
                      {meta ?? <span className="text-[#b5bbb7] dark:text-[#4a514d]">—</span>}
                    </td>
                    <td className="px-5 py-3 text-[12px] text-[#858c87] dark:text-[#6e7672] font-mono">{entry.actorId.slice(0, 8)}…</td>
                    <td className="px-5 py-3 text-[12px] text-[#858c87] dark:text-[#6e7672]">{fmtFull(entry.createdAt)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {!isLoading && filtered.length === 0 && (
        <p className="text-center py-10 text-[13px] text-[#858c87] dark:text-[#6e7672]">No audit log entries found.</p>
      )}
    </div>
  );
};
