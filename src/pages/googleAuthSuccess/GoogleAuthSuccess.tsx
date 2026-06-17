import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

interface ExchangeResponse {
  accessToken: string;
  user: { id: string; email: string; role: "ADMIN" | "CLIENT" | "FREELANCER" };
}

const BASE_URL = import.meta.env.VITE_API_URL;

const dashboardForRole = (role: ExchangeResponse["user"]["role"]): string => {
  if (role === "ADMIN") return "/adminPanel";
  if (role === "CLIENT") return "/portal";
  return "/dashboard";
};

export const GoogleAuthSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { setAccessToken } = useAuth();
  // The exchange code is single-use (the backend burns it on first call), so
  // this must fire exactly once. A ref guards against React StrictMode's
  // double-invocation of effects in dev, which would otherwise POST the same
  // code twice — the second request fails and bounces the user to /login.
  const exchanged = useRef(false);

  useEffect(() => {
    if (exchanged.current) return;

    const params = new URLSearchParams(location.search);
    const code = params.get("code");

    if (!code) {
      navigate("/login");
      return;
    }

    exchanged.current = true;
    axios
      .post<ExchangeResponse>(
        `${BASE_URL}/auth/exchange`,
        { code },
        { withCredentials: true },
      )
      .then((res) => {
        setAccessToken(res.data.accessToken);
        navigate(dashboardForRole(res.data.user.role));
      })
      .catch(() => {
        navigate("/login");
      });
  }, [location, navigate, setAccessToken]);

  return <div>Loading...</div>;
};
