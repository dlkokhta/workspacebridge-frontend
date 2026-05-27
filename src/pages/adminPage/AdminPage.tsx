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
  Trash2,
} from "lucide-react";
import { useAuth, axiosInstance } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { useAdminUsers, type AdminUser } from "../../hooks/useAdminUsers";
import { useAdminStats } from "../../hooks/useAdminStats";

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
    deletingId,
  } = useAdminUsers();
  const statsQuery = useAdminStats();
  const stats = statsQuery.data;

  const [confirmingUser, setConfirmingUser] = useState<AdminUser | null>(null);

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

  const handleConfirmDelete = () => {
    if (!confirmingUser) return;
    const id = confirmingUser.id;
    setConfirmingUser(null);
    void deleteUser(id);
  };

  return (
    <div className="min-h-screen bg-[#fafaf7] dark:bg-[#0e1310]">
      {/* Delete confirmation modal */}
      {confirmingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/60">
          <div className="w-full max-w-sm mx-4 rounded-xl border border-black/[0.08] dark:border-white/[0.07] bg-white dark:bg-[#151a17] p-6 shadow-lg">
            <h2 className="text-[15px] font-semibold text-[#1a201c] dark:text-[#e8ece9] mb-2">
              Delete User
            </h2>
            <p className="text-[13px] text-[#858c87] dark:text-[#6e7672] mb-5">
              Are you sure you want to delete{" "}
              <span className="font-medium text-[#1a201c] dark:text-[#e8ece9]">
                {confirmingUser.email}
              </span>
              ? This cannot be undone.
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleConfirmDelete}
                className="h-8 px-3.5 rounded-lg bg-[#c25a4a] hover:bg-[#b04a3a] text-white text-[12px] font-medium transition-colors cursor-pointer"
              >
                Yes, delete
              </button>
              <button
                onClick={() => setConfirmingUser(null)}
                className="h-8 px-3.5 rounded-lg border border-black/[0.08] dark:border-white/[0.07] bg-white dark:bg-[#1c221e] text-[#5a625e] dark:text-[#a0a8a3] text-[12px] font-medium hover:bg-[#f6f6f1] dark:hover:bg-[#222b26] transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
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
        {/* Stats cards */}
        {stats && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
              <StatCard icon={<Users size={14} />} label="Total users" value={stats.totalUsers} />
              <StatCard icon={<LayoutGrid size={14} />} label="Total workspaces" value={stats.totalWorkspaces} />
              <StatCard
                icon={<TrendingUp size={14} />}
                label="Active"
                value={stats.activeWorkspaces}
                accent="green"
              />
              <StatCard
                icon={<CheckCircle2 size={14} />}
                label="Completed"
                value={stats.completedWorkspaces}
                accent="blue"
              />
              <StatCard
                icon={<Archive size={14} />}
                label="Archived"
                value={stats.archivedWorkspaces}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              <StatCard
                icon={<CalendarDays size={14} />}
                label="Users this week"
                value={stats.usersThisWeek}
                accent="green"
              />
              <StatCard
                icon={<CalendarDays size={14} />}
                label="Users this month"
                value={stats.usersThisMonth}
                accent="green"
              />
            </div>

            {/* Activity chart */}
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
              <ActivityChart
                signups={stats.signupsByDay}
                workspaces={stats.workspacesByDay}
              />
            </div>
          </>
        )}

        {statsQuery.isLoading && (
          <div className="flex items-center justify-center py-12">
            <p className="text-[13px] text-[#858c87] dark:text-[#6e7672]">Loading stats…</p>
          </div>
        )}

        {/* Users table */}
        <div className="rounded-xl border border-black/[0.08] dark:border-white/[0.07] bg-white dark:bg-[#151a17] overflow-hidden">
          <div className="px-5 py-4 border-b border-black/[0.06] dark:border-white/[0.05]">
            <h3 className="text-[14px] font-semibold text-[#1a201c] dark:text-[#e8ece9]">
              Users
            </h3>
            <p className="text-[12px] text-[#858c87] dark:text-[#6e7672] mt-0.5">
              {users.length} registered user{users.length !== 1 && "s"}
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-black/[0.06] dark:border-white/[0.05]">
                  <th className="px-5 py-2.5 text-left text-[11px] uppercase tracking-[0.06em] font-medium text-[#858c87] dark:text-[#6e7672]">
                    Email
                  </th>
                  <th className="px-5 py-2.5 text-left text-[11px] uppercase tracking-[0.06em] font-medium text-[#858c87] dark:text-[#6e7672]">
                    Name
                  </th>
                  <th className="px-5 py-2.5 text-left text-[11px] uppercase tracking-[0.06em] font-medium text-[#858c87] dark:text-[#6e7672]">
                    Role
                  </th>
                  <th className="px-5 py-2.5 text-left text-[11px] uppercase tracking-[0.06em] font-medium text-[#858c87] dark:text-[#6e7672]">
                    Method
                  </th>
                  <th className="px-5 py-2.5 text-left text-[11px] uppercase tracking-[0.06em] font-medium text-[#858c87] dark:text-[#6e7672]">
                    Verified
                  </th>
                  <th className="px-5 py-2.5 text-left text-[11px] uppercase tracking-[0.06em] font-medium text-[#858c87] dark:text-[#6e7672]">
                    Created
                  </th>
                  <th className="px-5 py-2.5" />
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-black/[0.04] dark:border-white/[0.04] last:border-0 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-5 py-3 text-[13px] text-[#1a201c] dark:text-[#e8ece9]">
                      {user.email}
                    </td>
                    <td className="px-5 py-3 text-[13px] text-[#1a201c] dark:text-[#e8ece9]">
                      {user.firstname || user.lastname
                        ? `${user.firstname ?? ""} ${user.lastname ?? ""}`.trim()
                        : <span className="text-[#b5bbb7] dark:text-[#4a514d]">—</span>}
                    </td>
                    <td className="px-5 py-3">
                      <select
                        value={user.role}
                        disabled={updatingRoleId === user.id}
                        onChange={(e) => handleRoleChange(user, e.target.value)}
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
                    <td className="px-5 py-3">
                      <button
                        onClick={() => setConfirmingUser(user)}
                        disabled={deletingId === user.id}
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

          {users.length === 0 && (
            <p className="text-center py-10 text-[13px] text-[#858c87] dark:text-[#6e7672]">
              No users found.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

function getRoleBadgeClass(role: string): string {
  switch (role) {
    case "ADMIN":
      return "bg-[#9b7abf]/10 text-[#7a5a9b] dark:text-[#b89adb] border-[#9b7abf]/30";
    case "FREELANCER":
      return "bg-[#5a8a6b]/10 text-[#3e6a4d] dark:text-[#6db383] border-[#5a8a6b]/30";
    case "CLIENT":
      return "bg-[#7a9bbf]/10 text-[#4a6a8a] dark:text-[#7a9bbf] border-[#7a9bbf]/30";
    default:
      return "bg-black/[0.04] dark:bg-white/[0.04] text-[#858c87] dark:text-[#6e7672] border-black/[0.08] dark:border-white/[0.07]";
  }
}

function StatCard({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  accent?: "green" | "blue";
}) {
  const iconColor =
    accent === "green"
      ? "text-[#5a8a6b]"
      : accent === "blue"
        ? "text-[#7a9bbf]"
        : "text-[#858c87] dark:text-[#6e7672]";

  return (
    <div className="px-4 py-3.5 rounded-xl border border-black/[0.08] dark:border-white/[0.07] bg-white dark:bg-[#151a17]">
      <div className={`mb-2 ${iconColor}`}>{icon}</div>
      <div className="text-[24px] font-semibold tracking-[-0.02em] text-[#1a201c] dark:text-[#e8ece9]">
        {value}
      </div>
      <div className="text-[12px] text-[#858c87] dark:text-[#6e7672] mt-0.5">{label}</div>
    </div>
  );
}

function ActivityChart({
  signups,
  workspaces,
}: {
  signups: { date: string; count: number }[];
  workspaces: { date: string; count: number }[];
}) {
  const maxCount = Math.max(
    1,
    ...signups.map((d) => d.count),
    ...workspaces.map((d) => d.count),
  );

  const chartW = 700;
  const chartH = 140;
  const padL = 28;
  const padR = 8;
  const padT = 8;
  const padB = 24;
  const innerW = chartW - padL - padR;
  const innerH = chartH - padT - padB;

  const toX = (i: number) => padL + (i / Math.max(1, signups.length - 1)) * innerW;
  const toY = (v: number) => padT + innerH - (v / maxCount) * innerH;

  const buildPath = (data: { count: number }[]) =>
    data.map((d, i) => `${i === 0 ? "M" : "L"}${toX(i).toFixed(1)},${toY(d.count).toFixed(1)}`).join(" ");

  const gridLines = [0, 0.25, 0.5, 0.75, 1].map((f) => Math.round(maxCount * f));

  const labelIndices: number[] = [];
  if (signups.length > 0) {
    const step = Math.max(1, Math.floor(signups.length / 6));
    for (let i = 0; i < signups.length; i += step) labelIndices.push(i);
    if (!labelIndices.includes(signups.length - 1)) labelIndices.push(signups.length - 1);
  }

  return (
    <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full h-auto" preserveAspectRatio="xMidYMid meet">
      {/* Grid lines */}
      {gridLines.map((v) => (
        <g key={v}>
          <line
            x1={padL}
            y1={toY(v)}
            x2={chartW - padR}
            y2={toY(v)}
            className="stroke-black/[0.06] dark:stroke-white/[0.06]"
            strokeWidth={0.5}
          />
          <text
            x={padL - 4}
            y={toY(v) + 3}
            textAnchor="end"
            className="fill-[#b5bbb7] dark:fill-[#4a514d] text-[8px]"
          >
            {v}
          </text>
        </g>
      ))}

      {/* Date labels */}
      {labelIndices.map((i) => (
        <text
          key={i}
          x={toX(i)}
          y={chartH - 4}
          textAnchor="middle"
          className="fill-[#b5bbb7] dark:fill-[#4a514d] text-[7px]"
        >
          {signups[i].date.slice(5)}
        </text>
      ))}

      {/* Lines */}
      {signups.length > 1 && (
        <>
          <path d={buildPath(signups)} fill="none" stroke="#5a8a6b" strokeWidth={1.5} strokeLinejoin="round" />
          <path d={buildPath(workspaces)} fill="none" stroke="#7a9bbf" strokeWidth={1.5} strokeLinejoin="round" strokeDasharray="4 2" />
        </>
      )}

      {/* Dots */}
      {signups.map((d, i) =>
        d.count > 0 ? (
          <circle key={`s-${i}`} cx={toX(i)} cy={toY(d.count)} r={2.5} fill="#5a8a6b" />
        ) : null,
      )}
      {workspaces.map((d, i) =>
        d.count > 0 ? (
          <circle key={`w-${i}`} cx={toX(i)} cy={toY(d.count)} r={2.5} fill="#7a9bbf" />
        ) : null,
      )}
    </svg>
  );
}
