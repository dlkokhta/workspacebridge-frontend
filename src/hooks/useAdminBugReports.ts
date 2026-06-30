import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../context/AuthContext";
import type { BugReportStatus, BugSeverity } from "../components/bugReport/types";

export interface BugReportRow {
  id: string;
  description: string;
  severity: BugSeverity;
  status: BugReportStatus;
  url: string | null;
  userAgent: string | null;
  lastError: string | null;
  reporterEmail: string | null;
  reporter: {
    id: string;
    firstname: string | null;
    lastname: string | null;
    email: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}

const KEY = ["admin-bug-reports"];

export const useAdminBugReports = () =>
  useQuery({
    queryKey: KEY,
    queryFn: async () => {
      const { data } = await axiosInstance.get<BugReportRow[]>(
        "/feedback/bug-reports",
      );
      return data;
    },
  });

export const useUpdateBugReportStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { id: string; status: BugReportStatus }) => {
      await axiosInstance.patch(`/feedback/bug-reports/${vars.id}`, {
        status: vars.status,
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
};

export const useDeleteBugReport = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await axiosInstance.delete(`/feedback/bug-reports/${id}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
};
