import { useMemo, useState } from "react";
import { X } from "lucide-react";
import { useAdminInvites } from "../../../hooks/useAdminInvites";
import { SearchInput } from "./SearchInput";
import { FilterSelect } from "./FilterSelect";

const STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: "used", label: "Used" },
  { value: "expired", label: "Expired" },
  { value: "pending", label: "Pending" },
];

const statusCls = {
  used: "bg-[#5a8a6b]/10 text-[#3e6a4d] dark:text-[#6db383] border-[#5a8a6b]/30",
  expired: "bg-[#c25a4a]/10 text-[#c25a4a] dark:text-[#e07b6b] border-[#c25a4a]/30",
  pending: "bg-[#d4a843]/10 text-[#a68a2a] dark:text-[#d4a843] border-[#d4a843]/30",
};

const getStatus = (inv: { usedAt: string | null; expiresAt: string }) => {
  if (inv.usedAt) return "used" as const;
  if (new Date(inv.expiresAt) < new Date()) return "expired" as const;
  return "pending" as const;
};

export const InvitesTable = () => {
  const { invites, revokingId, revokeInvite } = useAdminInvites();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const fmt = (d: string) =>
    new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return invites.filter((inv) => {
      if (q && !(inv.email ?? "").toLowerCase().includes(q) && !inv.workspace.name.toLowerCase().includes(q)) return false;
      if (statusFilter && getStatus(inv) !== statusFilter) return false;
      return true;
    });
  }, [invites, search, statusFilter]);

  return (
    <div className="rounded-xl border border-black/[0.08] dark:border-white/[0.07] bg-white dark:bg-[#151a17] overflow-hidden">
      <div className="px-5 py-4 border-b border-black/[0.06] dark:border-white/[0.05]">
        <h3 className="text-[14px] font-semibold text-[#1a201c] dark:text-[#e8ece9]">Invites</h3>
        <p className="text-[12px] text-[#858c87] dark:text-[#6e7672] mt-0.5">
          {filtered.length} of {invites.length} invite{invites.length !== 1 && "s"}
        </p>
        <div className="flex flex-wrap items-center gap-2 mt-3">
          <SearchInput value={search} onChange={setSearch} placeholder="Search by email or workspace…" />
          <FilterSelect value={statusFilter} onChange={setStatusFilter} options={STATUS_OPTIONS} />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-black/[0.06] dark:border-white/[0.05]">
              {["Email", "Workspace", "Sent by", "Status", "Created", "Expires"].map((h) => (
                <th key={h} className="px-5 py-2.5 text-left text-[11px] uppercase tracking-[0.06em] font-medium text-[#858c87] dark:text-[#6e7672]">{h}</th>
              ))}
              <th className="px-5 py-2.5" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((inv) => {
              const status = getStatus(inv);
              return (
                <tr key={inv.id} className="border-b border-black/[0.04] dark:border-white/[0.04] last:border-0 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                  <td className="px-5 py-3 text-[13px] text-[#1a201c] dark:text-[#e8ece9]">
                    {inv.email ?? <span className="text-[#b5bbb7] dark:text-[#4a514d]">Link invite</span>}
                  </td>
                  <td className="px-5 py-3 text-[13px] text-[#1a201c] dark:text-[#e8ece9]">{inv.workspace.name}</td>
                  <td className="px-5 py-3 text-[12px] text-[#858c87] dark:text-[#6e7672]">
                    {inv.workspace.owner.firstname || inv.workspace.owner.lastname
                      ? `${inv.workspace.owner.firstname ?? ""} ${inv.workspace.owner.lastname ?? ""}`.trim()
                      : inv.workspace.owner.email}
                  </td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex items-center h-[20px] px-2 rounded-full border text-[10px] font-medium capitalize ${statusCls[status]}`}>{status}</span>
                  </td>
                  <td className="px-5 py-3 text-[12px] text-[#858c87] dark:text-[#6e7672]">{fmt(inv.createdAt)}</td>
                  <td className="px-5 py-3 text-[12px] text-[#858c87] dark:text-[#6e7672]">{fmt(inv.expiresAt)}</td>
                  <td className="px-5 py-3">
                    {status !== "used" && (
                      <button onClick={() => revokeInvite(inv.id)} disabled={revokingId === inv.id} className="w-7 h-7 flex items-center justify-center rounded-lg text-[#858c87] dark:text-[#6e7672] hover:bg-[#c25a4a]/10 hover:text-[#c25a4a] dark:hover:text-[#e07b6b] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed" title="Revoke invite">
                        <X size={13} />
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {filtered.length === 0 && (
        <p className="text-center py-10 text-[13px] text-[#858c87] dark:text-[#6e7672]">No invites found.</p>
      )}
    </div>
  );
};
