import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuth } from "../context/AuthContext";

type UserRole = "ADMIN" | "CLIENT" | "FREELANCER";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: string;
  allowedRoles?: UserRole[];
}

interface JwtPayload {
  role?: string;
}

function parseJwtPayload(token: string): JwtPayload | null {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(base64)) as JwtPayload;
  } catch {
    return null;
  }
}

// Where a signed-in user lands when a route isn't meant for their role.
// Clients only ever get the portal; everyone else gets the dashboard.
function homeForRole(role?: string): string {
  return role === "CLIENT" ? "/portal" : "/dashboard";
}

export const ProtectedRoute = ({
  children,
  requiredRole,
  allowedRoles,
}: ProtectedRouteProps) => {
  const { accessToken, isLoading } = useAuth();

  if (isLoading) return null;

  if (!accessToken) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole || allowedRoles) {
    const role = parseJwtPayload(accessToken)?.role;
    const allowed =
      (!requiredRole || role === requiredRole) &&
      (!allowedRoles || allowedRoles.some((r) => r === role));
    if (!allowed) {
      return <Navigate to={homeForRole(role)} replace />;
    }
  }

  return <>{children}</>;
};
