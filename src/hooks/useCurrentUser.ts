import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "../context/AuthContext";

export interface UserProfile {
  id: string;
  firstname: string | null;
  lastname: string | null;
  email: string;
  role: "FREELANCER" | "CLIENT" | "ADMIN";
  picture: string | null;
  method: string;
  createdAt: string;
  isTwoFactorEnabled: boolean;
}

export const currentUserKey = ["current-user"] as const;

export const useCurrentUser = () => {
  return useQuery({
    queryKey: currentUserKey,
    queryFn: async () => {
      const { data } = await axiosInstance.get<UserProfile>("/user/me");
      return data;
    },
  });
};
