import { useEffect } from "react";
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

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const code = params.get("code");

    if (!code) {
      navigate("/login");
      return;
    }

    let cancelled = false;
    axios
      .post<ExchangeResponse>(
        `${BASE_URL}/auth/exchange`,
        { code },
        { withCredentials: true },
      )
      .then((res) => {
        if (cancelled) return;
        setAccessToken(res.data.accessToken);
        navigate(dashboardForRole(res.data.user.role));
      })
      .catch(() => {
        if (cancelled) return;
        navigate("/login");
      });

    return () => {
      cancelled = true;
    };
  }, [location, navigate, setAccessToken]);

  return <div>Loading...</div>;
};
