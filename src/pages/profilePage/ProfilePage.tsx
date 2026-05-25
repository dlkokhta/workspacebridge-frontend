import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { axiosInstance, useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import { ProfileTopbar } from "./components/ProfileTopbar";
import { ProfileSidebar } from "./components/ProfileSidebar";
import { ProfileSection } from "./sections/ProfileSection";
import { WorkspaceSection } from "./sections/WorkspaceSection";
import { NotificationsSection } from "./sections/NotificationsSection";
import { BillingSection } from "./sections/BillingSection";
import { SecuritySection } from "./sections/SecuritySection";
import { getInitials } from "./utils/getInitials";
import type { Section } from "./types";

export const ProfilePage = () => {
  const navigate = useNavigate();
  const { setAccessToken } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const profileQuery = useCurrentUser();
  const profile = profileQuery.data ?? null;

  const [section, setSection] = useState<Section>("profile");

  useEffect(() => {
    if (profileQuery.error) navigate("/login");
  }, [profileQuery.error, navigate]);

  const handleLogout = async () => {
    try {
      await axiosInstance.post("/auth/logout");
    } catch {
      // ignore
    } finally {
      setAccessToken(null);
      navigate("/login");
    }
  };

  if (profileQuery.isLoading || !profile) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-[#5a625e] dark:text-[#a0a8a3] text-sm">Loading…</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col overflow-hidden min-w-0">
      <ProfileTopbar
        initials={getInitials(profile)}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[220px_1fr] overflow-hidden min-h-0">
        <ProfileSidebar active={section} onChange={setSection} />

        <div className="overflow-y-auto p-8">
          <div className="max-w-[640px]">
            {section === "profile" && <ProfileSection profile={profile} />}
            {section === "workspace" && <WorkspaceSection />}
            {section === "notifications" && <NotificationsSection />}
            {section === "billing" && <BillingSection />}
            {section === "security" && (
              <SecuritySection profile={profile} onLogout={handleLogout} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
