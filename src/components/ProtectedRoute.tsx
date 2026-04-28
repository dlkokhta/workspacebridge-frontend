import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuth } from "../context/AuthContext";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: string;
}

function parseJwtPayload(token: string) {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

export const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { accessToken, isLoading } = useAuth();

  if (isLoading) return null;

  if (!accessToken) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole) {
    const payload = parseJwtPayload(accessToken);
    if (payload?.role !== requiredRole) {
      return <Navigate to="/items" replace />;
    }
  }

  return <>{children}</>;
};
