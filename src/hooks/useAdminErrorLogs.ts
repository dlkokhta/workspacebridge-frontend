import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../context/AuthContext";

export interface ErrorLogRow {
  id: string;
  message: string;
  stack: string | null;
  source: string;
  url: string | null;
  userAgent: string | null;
  componentStack: string | null;
  user: {
    id: string;
    firstname: string | null;
    lastname: string | null;
    email: string;
  } | null;
  createdAt: string;
}

const KEY = ["admin-error-logs"];

export const useAdminErrorLogs = () =>
  useQuery({
    queryKey: KEY,
    queryFn: async () => {
      const { data } = await axiosInstance.get<ErrorLogRow[]>(
        "/feedback/error-logs",
      );
      return data;
    },
  });

export const useDeleteErrorLog = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await axiosInstance.delete(`/feedback/error-logs/${id}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
};
