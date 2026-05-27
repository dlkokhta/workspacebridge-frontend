import {
  Users,
  LayoutGrid,
  TrendingUp,
  CheckCircle2,
  Archive,
  CalendarDays,
} from "lucide-react";
import { useAdminStats } from "../../../hooks/useAdminStats";
import { StatCard } from "./StatCard";
import { ActivityChart } from "./ActivityChart";

export const OverviewTab = () => {
  const statsQuery = useAdminStats();
  const stats = statsQuery.data;

  if (statsQuery.isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-[13px] text-[#858c87] dark:text-[#6e7672]">Loading stats…</p>
      </div>
    );
  }

  if (!stats) return null;

  return (
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

      <div className="rounded-xl border border-black/[0.08] dark:border-white/[0.07] bg-white dark:bg-[#151a17] p-5">
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
  );
};
