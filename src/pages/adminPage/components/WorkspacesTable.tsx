import { Trash2 } from "lucide-react";
import type { AdminWorkspace } from "../../../hooks/useAdminWorkspaces";
import { getStatusBadgeClass } from "../utils/badgeClasses";

interface WorkspacesTableProps {
  workspaces: AdminWorkspace[];
  updatingStatusId: string | null;
  deletingWorkspaceId: string | null;
  onStatusChange: (ws: AdminWorkspace, newStatus: string) => void;
  onDeleteClick: (ws: AdminWorkspace) => void;
}

export const WorkspacesTable = ({
  workspaces,
  updatingStatusId,
  deletingWorkspaceId,
  onStatusChange,
  onDeleteClick,
}: WorkspacesTableProps) => (
  <div className="rounded-xl border border-black/[0.08] dark:border-white/[0.07] bg-white dark:bg-[#151a17] overflow-hidden">
    <div className="px-5 py-4 border-b border-black/[0.06] dark:border-white/[0.05]">
      <h3 className="text-[14px] font-semibold text-[#1a201c] dark:text-[#e8ece9]">Workspaces</h3>
      <p className="text-[12px] text-[#858c87] dark:text-[#6e7672] mt-0.5">
        {workspaces.length} workspace{workspaces.length !== 1 && "s"}
      </p>
    </div>

    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-black/[0.06] dark:border-white/[0.05]">
            {["Workspace", "Owner", "Members", "Status", "Created"].map((h) => (
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
          {workspaces.map((ws) => (
            <tr
              key={ws.id}
              className="border-b border-black/[0.04] dark:border-white/[0.04] last:border-0 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors"
            >
              <td className="px-5 py-3">
                <div className="flex items-center gap-2.5">
                  <span
                    className="w-7 h-7 rounded-md flex items-center justify-center text-[11px] font-semibold text-white shrink-0"
                    style={{ background: ws.color }}
                  >
                    {ws.name[0].toUpperCase()}
                  </span>
                  <div className="min-w-0">
                    <div className="text-[13px] font-medium text-[#1a201c] dark:text-[#e8ece9] truncate">
                      {ws.name}
                    </div>
                    {ws.description && (
                      <div className="text-[11px] text-[#858c87] dark:text-[#6e7672] truncate max-w-[200px]">
                        {ws.description}
                      </div>
                    )}
                  </div>
                </div>
              </td>
              <td className="px-5 py-3">
                <div className="text-[13px] text-[#1a201c] dark:text-[#e8ece9]">
                  {ws.owner.firstname || ws.owner.lastname
                    ? `${ws.owner.firstname ?? ""} ${ws.owner.lastname ?? ""}`.trim()
                    : ws.owner.email}
                </div>
                {(ws.owner.firstname || ws.owner.lastname) && (
                  <div className="text-[11px] text-[#858c87] dark:text-[#6e7672]">
                    {ws.owner.email}
                  </div>
                )}
              </td>
              <td className="px-5 py-3 text-[13px] text-[#1a201c] dark:text-[#e8ece9]">
                {ws._count.members}
              </td>
              <td className="px-5 py-3">
                <select
                  value={ws.status}
                  disabled={updatingStatusId === ws.id}
                  onChange={(e) => onStatusChange(ws, e.target.value)}
                  className={`h-[24px] px-2 rounded-md text-[11px] font-medium border cursor-pointer focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${getStatusBadgeClass(ws.status)}`}
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="COMPLETED">COMPLETED</option>
                  <option value="ARCHIVED">ARCHIVED</option>
                </select>
              </td>
              <td className="px-5 py-3 text-[12px] text-[#858c87] dark:text-[#6e7672]">
                {new Date(ws.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </td>
              <td className="px-5 py-3">
                <button
                  onClick={() => onDeleteClick(ws)}
                  disabled={deletingWorkspaceId === ws.id}
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-[#858c87] dark:text-[#6e7672] hover:bg-[#c25a4a]/10 hover:text-[#c25a4a] dark:hover:text-[#e07b6b] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Delete workspace"
                >
                  <Trash2 size={13} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    {workspaces.length === 0 && (
      <p className="text-center py-10 text-[13px] text-[#858c87] dark:text-[#6e7672]">
        No workspaces found.
      </p>
    )}
  </div>
);
