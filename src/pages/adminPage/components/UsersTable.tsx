import { useMemo, useState } from "react";
import { Trash2 } from "lucide-react";
import type { AdminUser } from "../../../hooks/useAdminUsers";
import { getRoleBadgeClass } from "../utils/badgeClasses";
import { SearchInput } from "./SearchInput";
import { FilterSelect } from "./FilterSelect";

interface UsersTableProps {
  users: AdminUser[];
  updatingRoleId: string | null;
  deletingUserId: string | null;
  onRoleChange: (user: AdminUser, newRole: string) => void;
  onDeleteClick: (user: AdminUser) => void;
  onRowClick: (userId: string) => void;
}

const ROLE_OPTIONS = [
  { value: "", label: "All roles" },
  { value: "FREELANCER", label: "Freelancer" },
  { value: "CLIENT", label: "Client" },
  { value: "ADMIN", label: "Admin" },
];

const VERIFIED_OPTIONS = [
  { value: "", label: "All" },
  { value: "true", label: "Verified" },
  { value: "false", label: "Unverified" },
];

export const UsersTable = ({
  users,
  updatingRoleId,
  deletingUserId,
  onRoleChange,
  onDeleteClick,
  onRowClick,
}: UsersTableProps) => {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [verifiedFilter, setVerifiedFilter] = useState("");

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return users.filter((u) => {
      if (q && !u.email.toLowerCase().includes(q) && !`${u.firstname ?? ""} ${u.lastname ?? ""}`.toLowerCase().includes(q)) return false;
      if (roleFilter && u.role !== roleFilter) return false;
      if (verifiedFilter && String(u.isVerified) !== verifiedFilter) return false;
      return true;
    });
  }, [users, search, roleFilter, verifiedFilter]);

  return (
    <div className="rounded-xl border border-black/[0.08] dark:border-white/[0.07] bg-white dark:bg-[#151a17] overflow-hidden">
      <div className="px-5 py-4 border-b border-black/[0.06] dark:border-white/[0.05]">
        <h3 className="text-[14px] font-semibold text-[#1a201c] dark:text-[#e8ece9]">Users</h3>
        <p className="text-[12px] text-[#858c87] dark:text-[#6e7672] mt-0.5">
          {filtered.length} of {users.length} user{users.length !== 1 && "s"}
        </p>
        <div className="flex flex-wrap items-center gap-2 mt-3">
          <SearchInput value={search} onChange={setSearch} placeholder="Search by email or name…" />
          <FilterSelect value={roleFilter} onChange={setRoleFilter} options={ROLE_OPTIONS} />
          <FilterSelect value={verifiedFilter} onChange={setVerifiedFilter} options={VERIFIED_OPTIONS} />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-black/[0.06] dark:border-white/[0.05]">
              {["Email", "Name", "Role", "Method", "Verified", "Created"].map((h) => (
                <th
                  key={h}
                  className="px-5 py-2.5 text-left text-[11px] uppercase tracking-[0.06em] font-medium text-[#858c87] dark:text-[#6e7672]"
                >
                  {h}
                </th>
              ))}
              <th className="px-5 py-2.5" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((user) => (
              <tr
                key={user.id}
                onClick={() => onRowClick(user.id)}
                className="border-b border-black/[0.04] dark:border-white/[0.04] last:border-0 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors cursor-pointer"
              >
                <td className="px-5 py-3 text-[13px] text-[#1a201c] dark:text-[#e8ece9]">
                  {user.email}
                </td>
                <td className="px-5 py-3 text-[13px] text-[#1a201c] dark:text-[#e8ece9]">
                  {user.firstname || user.lastname
                    ? `${user.firstname ?? ""} ${user.lastname ?? ""}`.trim()
                    : <span className="text-[#b5bbb7] dark:text-[#4a514d]">—</span>}
                </td>
                <td className="px-5 py-3" onClick={(e) => e.stopPropagation()}>
                  <select
                    value={user.role}
                    disabled={updatingRoleId === user.id}
                    onChange={(e) => onRoleChange(user, e.target.value)}
                    className={`h-[24px] px-2 rounded-md text-[11px] font-medium border cursor-pointer focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${getRoleBadgeClass(user.role)}`}
                  >
                    <option value="FREELANCER">FREELANCER</option>
                    <option value="CLIENT">CLIENT</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </td>
                <td className="px-5 py-3 text-[12px] text-[#858c87] dark:text-[#6e7672]">
                  {user.method}
                </td>
                <td className="px-5 py-3">
                  <span
                    className={`inline-flex items-center h-[20px] px-2 rounded-full border text-[10px] font-medium ${
                      user.isVerified
                        ? "bg-[#5a8a6b]/10 text-[#3e6a4d] dark:text-[#6db383] border-[#5a8a6b]/30"
                        : "bg-[#c25a4a]/10 text-[#c25a4a] dark:text-[#e07b6b] border-[#c25a4a]/30"
                    }`}
                  >
                    {user.isVerified ? "Verified" : "Unverified"}
                  </span>
                </td>
                <td className="px-5 py-3 text-[12px] text-[#858c87] dark:text-[#6e7672]">
                  {new Date(user.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </td>
                <td className="px-5 py-3" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => onDeleteClick(user)}
                    disabled={deletingUserId === user.id}
                    className="w-7 h-7 flex items-center justify-center rounded-lg text-[#858c87] dark:text-[#6e7672] hover:bg-[#c25a4a]/10 hover:text-[#c25a4a] dark:hover:text-[#e07b6b] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Delete user"
                  >
                    <Trash2 size={13} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filtered.length === 0 && (
        <p className="text-center py-10 text-[13px] text-[#858c87] dark:text-[#6e7672]">
          No users found.
        </p>
      )}
    </div>
  );
};
