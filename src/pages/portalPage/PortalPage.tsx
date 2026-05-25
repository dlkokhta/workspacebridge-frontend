import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { axiosInstance, useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import { useWorkspaces } from "../../hooks/useWorkspaces";
import { getInitials } from "../../utils/getInitials";
import { MessagesTab } from "../workspacePage/messages/MessagesTab";
import { WhiteboardTab } from "../workspacePage/whiteboard/WhiteboardTab";
import { FilesTab } from "../workspacePage/files/FilesTab";
import { SharedLinksTab } from "../workspacePage/tabs/SharedLinksTab";
import { SharedTasksTab } from "../workspacePage/sharedTasks/SharedTasksTab";
import { PortalHeader } from "./components/PortalHeader";
import { PortalTabBar } from "./components/PortalTabBar";
import type { Tab } from "./types";

export const PortalPage = () => {
  const navigate = useNavigate();
  const { setAccessToken } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [tab, setTab] = useState<Tab>("messages");

  const profileQuery = useCurrentUser();
  const workspacesQuery = useWorkspaces();

  const profile = profileQuery.data ?? null;
  // Clients only ever belong to one workspace via the invite flow, so we
  // pick the first one the API returns.
  const workspace = workspacesQuery.data?.[0] ?? null;
  const loading = profileQuery.isLoading || workspacesQuery.isLoading;

  useEffect(() => {
    if (profileQuery.error || workspacesQuery.error) {
      navigate("/login");
    }
  }, [profileQuery.error, workspacesQuery.error, navigate]);

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

  if (loading || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fafaf7] dark:bg-[#0e1310]">
        <p className="text-[#5a625e] dark:text-[#a0a8a3] text-sm">Loading…</p>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-[#fafaf7] dark:bg-[#0e1310] overflow-hidden">
      <PortalHeader
        profile={profile}
        workspace={workspace}
        theme={theme}
        onToggleTheme={toggleTheme}
        onLogout={handleLogout}
      />

      <PortalTabBar active={tab} onChange={setTab} />

      <div className="flex-1 flex flex-col overflow-hidden min-h-0">
        {tab === "messages" && workspace && (
          <MessagesTab
            workspaceId={workspace.id}
            userId={profile.id}
            initials={getInitials(profile)}
          />
        )}
        {tab === "files" && workspace && (
          <FilesTab
            workspaceId={workspace.id}
            currentUserId={profile.id}
            workspaceOwnerId=""
          />
        )}
        {tab === "whiteboard" && workspace && (
          <WhiteboardTab workspaceId={workspace.id} />
        )}
        {tab === "shared-links" && workspace && (
          <SharedLinksTab workspaceId={workspace.id} />
        )}
        {tab === "shared-tasks" && workspace && (
          <SharedTasksTab workspaceId={workspace.id} />
        )}
      </div>
    </div>
  );
};
