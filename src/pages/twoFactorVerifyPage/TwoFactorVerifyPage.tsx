import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";

export const TwoFactorVerifyPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setAccessToken } = useAuth();

  const tempToken: string | undefined = (location.state as { tempToken?: string })?.tempToken;

  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const url = import.meta.env.VITE_API_URL;

  if (!tempToken) {
    navigate("/login");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await axios.post(
        `${url}/auth/2fa/verify`,
        { tempToken, code },
        { withCredentials: true },
      );
      setAccessToken(res.data.accessToken);
      if (res.data.user.role === "ADMIN") {
        navigate("/adminPanel");
      } else {
        navigate("/profile");
      }
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Invalid code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-6 sm:py-8 md:py-12 px-4 sm:px-6 md:px-8 dark:bg-gray-900">
      <div className="w-full max-w-md mx-auto">
        <h1
          onClick={() => navigate("/")}
          className="cursor-pointer text-center font-roboto font-medium text-xl sm:text-2xl mb-8 sm:mb-12 md:mb-16 dark:text-white"
        >
          workspacebridge
        </h1>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 border border-slate-400 dark:border-gray-600 rounded-lg px-4 sm:px-6 py-6 shadow-sm dark:bg-gray-800"
        >
          <div className="flex items-center gap-2">
            <ShieldCheck size={22} className="text-blue-500" />
            <h2 className="text-lg sm:text-xl font-semibold dark:text-white">
              Two-Factor Authentication
            </h2>
          </div>

          <p className="text-sm text-gray-500 dark:text-gray-400">
            Enter the 6-digit code from your authenticator app (Google Authenticator, Authy, etc.)
          </p>

          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            placeholder="000000"
            className="w-full text-center text-2xl tracking-[0.5em] px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-500"
            autoFocus
          />

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={loading || code.length !== 6}
            className="cursor-pointer bg-blue-500 text-white px-5 py-2 text-sm rounded-md hover:bg-blue-600 transition-colors font-medium disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Verifying..." : "Verify Code"}
          </button>

          <button
            type="button"
            onClick={() => navigate("/login")}
            className="cursor-pointer text-sm text-gray-500 dark:text-gray-400 hover:underline text-center"
          >
            ← Back to login
          </button>
        </form>
      </div>
    </div>
  );
};
