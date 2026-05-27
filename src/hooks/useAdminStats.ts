import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "../context/AuthContext";

interface DayCount {
  date: string;
  count: number;
}

export interface AdminStats {
  totalUsers: number;
  totalWorkspaces: number;
  activeWorkspaces: number;
  completedWorkspaces: number;
  archivedWorkspaces: number;
  usersThisWeek: number;
  usersThisMonth: number;
  signupsByDay: DayCount[];
  workspacesByDay: DayCount[];
}

export const useAdminStats = () => {
  return useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const { data } = await axiosInstance.get<AdminStats>("/admin/stats");
      return data;
    },
  });
};
