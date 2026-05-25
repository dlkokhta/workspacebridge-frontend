import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "../context/AuthContext";

export interface Workspace {
  id: string;
  name: string;
  description: string | null;
  color: string;
  status: "ACTIVE" | "COMPLETED" | "ARCHIVED";
  createdAt: string;
}

export const workspacesKey = ["workspaces"] as const;

export const useWorkspaces = () => {
  return useQuery({
    queryKey: workspacesKey,
    queryFn: async () => {
      const { data } = await axiosInstance.get<Workspace[]>("/workspace");
      return data;
    },
  });
};
