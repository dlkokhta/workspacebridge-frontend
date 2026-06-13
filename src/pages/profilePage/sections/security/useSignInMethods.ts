import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../../../../context/AuthContext";
import { currentUserKey } from "../../../../hooks/useCurrentUser";

export interface SignInMethods {
  hasPassword: boolean;
  providers: string[];
}

export const signInMethodsKey = ["sign-in-methods"] as const;

export const useSignInMethods = (enabled: boolean) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: signInMethodsKey,
    queryFn: async () => {
      const { data } = await axiosInstance.get<SignInMethods>(
        "/user/me/sign-in-methods",
      );
      return data;
    },
    enabled,
  });

  const setPassword = useMutation({
    mutationFn: async (newPassword: string) => {
      await axiosInstance.post("/user/me/password/set", { newPassword });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: signInMethodsKey });
      // The profile's `method` may now allow password sign-in — refresh it.
      queryClient.invalidateQueries({ queryKey: currentUserKey });
    },
  });

  const disconnectProvider = useMutation({
    mutationFn: async (provider: string) => {
      await axiosInstance.delete(`/user/me/accounts/${provider}`);
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: signInMethodsKey }),
  });

  return { query, setPassword, disconnectProvider };
};
