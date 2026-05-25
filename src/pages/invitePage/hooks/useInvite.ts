import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "../../../context/AuthContext";

export interface InviteInfo {
  email: string | null;
  workspace: {
    id: string;
    name: string;
    color: string;
    description: string | null;
  };
}

export const useInvite = (token: string | undefined) => {
  return useQuery({
    queryKey: ["invite", token] as const,
    queryFn: async () => {
      const { data } = await axiosInstance.get<InviteInfo>(`/invite/${token}`);
      return data;
    },
    enabled: Boolean(token),
    retry: false,
  });
};
