import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Moon,
  Sun,
  Users,
  LayoutGrid,
  CheckCircle2,
  Archive,
  TrendingUp,
  CalendarDays,
} from "lucide-react";
import { useAuth, axiosInstance } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { useAdminUsers, type AdminUser } from "../../hooks/useAdminUsers";
import { useAdminStats } from "../../hooks/useAdminStats";
import {
  useAdminWorkspaces,
  type AdminWorkspace,
} from "../../hooks/useAdminWorkspaces";
import { UserDetailDrawer } from "./components/UserDetailDrawer";
import { ConfirmDeleteModal } from "./components/ConfirmDeleteModal";
import { StatCard } from "./components/StatCard";
import { ActivityChart } from "./components/ActivityChart";
import { UsersTable } from "./components/UsersTable";
import { WorkspacesTable } from "./components/WorkspacesTable";
import { InvitesTable } from "./components/InvitesTable";
import { SessionsTable } from "./components/SessionsTable";

export const AdminPage = () => {
  const navigate = useNavigate();
  const { setAccessToken } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const {
    users,
    error,
    updateRole,
    deleteUser,
    updatingRoleId,
    deletingId: deletingUserId,
  } = useAdminUsers();
  const statsQuery = useAdminStats();
  const stats = statsQuery.data;
  const {
    workspaces: adminWorkspaces,
    updateStatus,
    deleteWorkspace,
    updatingStatusId,
    deletingId: deletingWorkspaceId,
  } = useAdminWorkspaces();

  const [confirmingUser, setConfirmingUser] = useState<AdminUser | null>(null);
  const [confirmingWorkspace, setConfirmingWorkspace] =
    useState<AdminWorkspace | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  useEffect(() => {
    if (error) navigate("/login");
  }, [error, navigate]);

  const handleLogout = async () => {
    try {
      await axiosInstance.post("/auth/logout");
    } catch {
      // ignore
    } finally {
      setAccessToken(null);
      navigate("/login");
    }
  };

  const handleRoleChange = (user: AdminUser, newRole: string) => {
    if (user.role === newRole) return;
    void updateRole(user.id, newRole);
  };

  const handleStatusChange = (ws: AdminWorkspace, newStatus: string) => {
    if (ws.status === newStatus) return;
    void updateStatus(ws.id, newStatus);
  };

  return (
    <div className="min-h-screen bg-[#fafaf7] dark:bg-[#0e1310]">
      {confirmingUser && (
        <ConfirmDeleteModal
          title="Delete User"
          description={
            <>
              Are you sure you want to delete{" "}
              <span className="font-medium text-[#1a201c] dark:text-[#e8ece9]">
                {confirmingUser.email}
              </span>
              ? This cannot be undone.
            </>
          }
          onConfirm={() => {
            const id = confirmingUser.id;
            setConfirmingUser(null);
            void deleteUser(id);
          }}
          onCancel={() => setConfirmingUser(null)}
        />
      )}

      {confirmingWorkspace && (
        <ConfirmDeleteModal
          title="Delete Workspace"
          description={
            <>
              Are you sure you want to delete{" "}
              <span className="font-medium text-[#1a201c] dark:text-[#e8ece9]">
                {confirmingWorkspace.name}
              </span>
              ? All messages, files, and members will be removed. This cannot be
              undone.
            </>
          }
          onConfirm={() => {
            const id = confirmingWorkspace.id;
            setConfirmingWorkspace(null);
            void deleteWorkspace(id);
          }}
          onCancel={() => setConfirmingWorkspace(null)}
        />
      )}

      {/* Topbar */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-black/[0.06] dark:border-white/[0.05] bg-[#fafaf7] dark:bg-[#0e1310]">
        <div>
          <div className="text-[11px] uppercase tracking-[0.08em] font-medium text-[#858c87] dark:text-[#6e7672]">
            WorkspaceBridge
          </div>
          <div className="text-[16px] font-semibold mt-0.5 text-[#1a201c] dark:text-[#e8ece9]">
            Admin Panel
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-black/[0.08] dark:border-white/[0.07] bg-white dark:bg-[#1c221e] text-[#5a625e] dark:text-[#a0a8a3] hover:bg-[#f6f6f1] dark:hover:bg-[#222b26] transition-colors cursor-pointer"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
          </button>
          <button
            onClick={handleLogout}
            className="h-8 px-3 inline-flex items-center gap-1.5 rounded-lg border border-[#c25a4a]/30 text-[#c25a4a] dark:text-[#e07b6b] text-[12px] font-medium hover:bg-[#c25a4a]/5 transition-colors cursor-pointer"
          >
            Sign out
          </button>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-6">
        {stats && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
              <StatCard icon={<Users size={14} />} label="Total users" value={stats.totalUsers} />
              <StatCard icon={<LayoutGrid size={14} />} label="Total workspaces" value={stats.totalWorkspaces} />
              <StatCard icon={<TrendingUp size={14} />} label="Active" value={stats.activeWorkspaces} accent="green" />
              <StatCard icon={<CheckCircle2 size={14} />} label="Completed" value={stats.completedWorkspaces} accent="blue" />
              <StatCard icon={<Archive size={14} />} label="Archived" value={stats.archivedWorkspaces} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              <StatCard icon={<CalendarDays size={14} />} label="Users this week" value={stats.usersThisWeek} accent="green" />
              <StatCard icon={<CalendarDays size={14} />} label="Users this month" value={stats.usersThisMonth} accent="green" />
            </div>

            <div className="rounded-xl border border-black/[0.08] dark:border-white/[0.07] bg-white dark:bg-[#151a17] p-5 mb-6">
              <h3 className="text-[14px] font-semibold text-[#1a201c] dark:text-[#e8ece9] mb-1">
                Activity — Last 30 days
              </h3>
              <p className="text-[12px] text-[#858c87] dark:text-[#6e7672] mb-4">
                Signups and workspace creation over time
              </p>
              <div className="flex items-center gap-4 mb-3 text-[11px]">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#5a8a6b]" />
                  <span className="text-[#858c87] dark:text-[#6e7672]">Signups</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#7a9bbf]" />
                  <span className="text-[#858c87] dark:text-[#6e7672]">Workspaces</span>
                </span>
              </div>
              <ActivityChart signups={stats.signupsByDay} workspaces={stats.workspacesByDay} />
            </div>
          </>
        )}

        {statsQuery.isLoading && (
          <div className="flex items-center justify-center py-12">
            <p className="text-[13px] text-[#858c87] dark:text-[#6e7672]">Loading stats…</p>
          </div>
        )}

        <UsersTable
          users={users}
          updatingRoleId={updatingRoleId}
          deletingUserId={deletingUserId}
          onRoleChange={handleRoleChange}
          onDeleteClick={setConfirmingUser}
          onRowClick={setSelectedUserId}
        />

        <WorkspacesTable
          workspaces={adminWorkspaces}
          updatingStatusId={updatingStatusId}
          deletingWorkspaceId={deletingWorkspaceId}
          onStatusChange={handleStatusChange}
          onDeleteClick={setConfirmingWorkspace}
        />

        <InvitesTable />

        <SessionsTable />
      </div>

      {selectedUserId && (
        <UserDetailDrawer
          userId={selectedUserId}
          onClose={() => setSelectedUserId(null)}
        />
      )}
    </div>
  );
};
