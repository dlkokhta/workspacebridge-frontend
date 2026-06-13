import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { startRegistration } from "@simplewebauthn/browser";
import type { PublicKeyCredentialCreationOptionsJSON } from "@simplewebauthn/browser";
import { axiosInstance } from "../../../../context/AuthContext";

export interface Passkey {
  id: string;
  name: string | null;
  deviceType: string | null;
  backedUp: boolean;
  createdAt: string;
  lastUsedAt: string | null;
}

export const passkeysKey = ["passkeys"] as const;

export const usePasskeys = (enabled: boolean) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: passkeysKey,
    queryFn: async () => {
      const { data } = await axiosInstance.get<Passkey[]>("/auth/passkeys");
      return data;
    },
    enabled,
  });

  // Full enrolment flow: fetch options (sets the challenge cookie) → run the
  // native authenticator prompt → verify and store the new credential.
  const addPasskey = useMutation({
    mutationFn: async (name?: string) => {
      const { data: options } =
        await axiosInstance.post<PublicKeyCredentialCreationOptionsJSON>(
          "/auth/passkeys/register/options",
        );
      const attestation = await startRegistration({ optionsJSON: options });
      await axiosInstance.post("/auth/passkeys/register/verify", {
        response: attestation,
        name: name?.trim() || undefined,
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: passkeysKey }),
  });

  const removePasskey = useMutation({
    mutationFn: async (id: string) => {
      await axiosInstance.delete(`/auth/passkeys/${id}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: passkeysKey }),
  });

  return { query, addPasskey, removePasskey };
};
