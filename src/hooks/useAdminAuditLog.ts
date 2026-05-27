import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "../context/AuthContext";

export interface AuditLogEntry {
  id: string;
  action: string;
  targetType: string;
  targetId: string;
  actorId: string;
  metadata: Record<string, string> | null;
  createdAt: string;
}

export const useAdminAuditLog = () => {
  return useQuery({
    queryKey: ["admin-audit-log"],
    queryFn: async () => {
      const { data } = await axiosInstance.get<AuditLogEntry[]>(
        "/admin/audit-log",
      );
      return data;
    },
  });
};
