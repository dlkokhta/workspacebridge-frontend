import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  browserSupportsWebAuthn,
  startAuthentication,
} from "@simplewebauthn/browser";
import type { PublicKeyCredentialRequestOptionsJSON } from "@simplewebauthn/browser";
import { Fingerprint } from "lucide-react";
import { axiosInstance, useAuth } from "../../../context/AuthContext";

interface PasskeyLoginResponse {
  accessToken: string;
  user: { role: "ADMIN" | "CLIENT" | "FREELANCER" };
}

const dashboardForRole = (
  role: PasskeyLoginResponse["user"]["role"],
): string => {
  if (role === "ADMIN") return "/adminPanel";
  if (role === "CLIENT") return "/portal";
  return "/dashboard";
};

const extractApiMessage = (err: unknown): string | null =>
  (err as { response?: { data?: { message?: string } } })?.response?.data
    ?.message ?? null;

// Usernameless passkey sign-in: the browser offers any passkey registered for
// this site, the assertion is verified, and the server issues a full session
// (no password and no 2FA step).
export const PasskeyLoginButton = () => {
  const navigate = useNavigate();
  const { setAccessToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!browserSupportsWebAuthn()) return null;

  const handlePasskeyLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      const { data: options } =
        await axiosInstance.post<PublicKeyCredentialRequestOptionsJSON>(
          "/auth/passkeys/login/options",
        );
      const assertion = await startAuthentication({ optionsJSON: options });
      const { data } = await axiosInstance.post<PasskeyLoginResponse>(
        "/auth/passkeys/login/verify",
        { response: assertion, rememberMe: true },
      );
      setAccessToken(data.accessToken);
      navigate(dashboardForRole(data.user.role));
    } catch (err: unknown) {
      // The user dismissed the native prompt — not worth a loud error.
      const name = (err as { name?: string })?.name;
      if (name === "NotAllowedError" || name === "AbortError") return;
      setError(
        extractApiMessage(err) ?? "Passkey sign-in failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4">
      <button
        type="button"
        onClick={() => void handlePasskeyLogin()}
        disabled={loading}
        className="w-full h-11 flex items-center justify-center gap-2 rounded-lg border border-black/[0.08] dark:border-white/[0.07] bg-white dark:bg-[#151a17] text-[13px] font-medium text-[#1a201c] dark:text-[#e8ece9] hover:bg-[#f6f6f1] dark:hover:bg-[#222b26] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Fingerprint size={16} />
        {loading ? "Waiting for passkey…" : "Sign in with a passkey"}
      </button>
      {error && <p className="mt-2 text-[12px] text-red-500">{error}</p>}
    </div>
  );
};
