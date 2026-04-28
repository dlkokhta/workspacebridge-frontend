import { useEffect, useRef, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";

type Status = "loading" | "success" | "error";

export const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<Status>("loading");
  const [message, setMessage] = useState("");
  const hasFired = useRef(false);

  const url = import.meta.env.VITE_API_URL;

  useEffect(() => {
    // Guard against React StrictMode double-invocation in development
    if (hasFired.current) return;
    hasFired.current = true;

    const token = searchParams.get("token");

    if (!token) {
      setStatus("error");
      setMessage("No verification token found in the URL.");
      return;
    }

    axios
      .get(`${url}/auth/verify-email`, { params: { token } })
      .then((res) => {
        setStatus("success");
        setMessage(res.data.message);
      })
      .catch((err) => {
        setStatus("error");
        setMessage(
          err.response?.data?.message ?? "Verification failed. Please try again."
        );
      });
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 px-4 py-12">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-slate-200 dark:border-gray-700 px-6 py-10 sm:px-10 sm:py-12 w-full max-w-md text-center">
        {status === "loading" && (
          <>
            <div className="text-5xl mb-4">⏳</div>
            <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-2">
              Verifying your email…
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Please wait a moment.</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="text-5xl mb-4">✅</div>
            <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-2">
              Email Verified!
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-8">{message}</p>
            <button
              onClick={() => navigate("/login")}
              className="cursor-pointer w-full bg-blue-500 text-white py-2.5 px-4 text-sm rounded-md hover:bg-blue-600 transition-colors font-medium"
            >
              Go to Login
            </button>
          </>
        )}

        {status === "error" && (
          <>
            <div className="text-5xl mb-4">❌</div>
            <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-2">
              Verification Failed
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-8">{message}</p>
            <button
              onClick={() => navigate("/register")}
              className="cursor-pointer w-full bg-blue-500 text-white py-2.5 px-4 text-sm rounded-md hover:bg-blue-600 transition-colors font-medium"
            >
              Back to Register
            </button>
          </>
        )}
      </div>
    </div>
  );
};
