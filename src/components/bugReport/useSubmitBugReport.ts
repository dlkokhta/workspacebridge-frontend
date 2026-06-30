import { useMutation } from "@tanstack/react-query";
import { axiosInstance } from "../../context/AuthContext";
import type { BugSeverity } from "./types";

interface BugReportInput {
  description: string;
  severity: BugSeverity;
  url: string;
  lastError?: string;
}

export const useSubmitBugReport = () =>
  useMutation({
    mutationFn: async (input: BugReportInput) => {
      const { data } = await axiosInstance.post<{ id: string }>(
        "/feedback/bug-report",
        input,
      );
      return data;
    },
  });
