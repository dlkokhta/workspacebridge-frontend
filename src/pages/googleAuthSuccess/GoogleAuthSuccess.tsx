import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function parseJwtPayload(token: string) {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

export const GoogleAuthSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { setAccessToken } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const accessToken = params.get("token");

    if (accessToken) {
      setAccessToken(accessToken);

      const payload = parseJwtPayload(accessToken);
      if (payload?.role === "ADMIN") {
        navigate("/adminPanel");
      } else {
        navigate("/profile");
      }
    } else {
      navigate("/login");
    }
  }, [location, navigate]);

  return <div>Loading...</div>;
};
