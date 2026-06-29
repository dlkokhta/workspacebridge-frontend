import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { axiosInstance, useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import { useWorkspaces } from "../../hooks/useWorkspaces";
import { useWorkspaceDetail } from "../../hooks/useWorkspaceDetail";
import { getInitials } from "../../utils/getInitials";
import { MessagesTab } from "../workspacePage/messages/MessagesTab";
import { WhiteboardTab } from "../workspacePage/whiteboard/WhiteboardTab";
import { FilesTab } from "../workspacePage/files/FilesTab";
import { SharedLinksTab } from "../workspacePage/tabs/SharedLinksTab";
import { SharedTasksTab } from "../workspacePage/sharedTasks/SharedTasksTab";
import { PortalHeader } from "./components/PortalHeader";
import { PortalTabBar } from "./components/PortalTabBar";
import { SearchPalette } from "../../components/search/SearchPalette";
import { useSearchPalette } from "../../components/search/useSearchPalette";
import type { SearchResult, SearchResultType } from "../../hooks/useSearch";
import type { Tab } from "./types";

// Search result types map onto the portal's own tab names (note: shared tasks
// live under "shared-tasks" here, not "todos" as in the freelancer view).
const SEARCH_TYPE_TO_PORTAL_TAB: Record<SearchResultType, Tab> = {
  workspace: "messages", // never returned to clients (global-only); kept total
  message: "messages",
  file: "files",
  file_comment: "files",
  shared_task: "shared-tasks",
  private_task: "shared-tasks", // never returned to clients; kept for totality
  shared_link: "shared-links",
  whiteboard_comment: "whiteboard",
};

export const PortalPage = () => {
  const navigate = useNavigate();
  const { setAccessToken } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [tab, setTab] = useState<Tab>("messages");
  const { open: searchOpen, setOpen: setSearchOpen, close: closeSearch } =
    useSearchPalette();

  const handleSearchNavigate = (result: SearchResult) => {
    setTab(SEARCH_TYPE_TO_PORTAL_TAB[result.type]);
  };

  const profileQuery = useCurrentUser();
  const workspacesQuery = useWorkspaces();

  const profile = profileQuery.data ?? null;
  // Clients only ever belong to one workspace via the invite flow, so we
  // pick the first one the API returns.
  const workspace = workspacesQuery.data?.[0] ?? null;
  const loading = profileQuery.isLoading || workspacesQuery.isLoading;

  // Fetch the workspace detail purely for the per-file upload limit, so the
  // client's Files tab can pre-check size before uploading.
  const workspaceDetail = useWorkspaceDetail(workspace?.id ?? "").data ?? null;

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
        onOpenSearch={() => setSearchOpen(true)}
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
            maxFileSize={workspaceDetail?.maxFileSize}
          />
        )}
        {tab === "whiteboard" && workspace && (
          <WhiteboardTab workspaceId={workspace.id} isOwner={false} />
        )}
        {tab === "shared-links" && workspace && (
          <SharedLinksTab workspaceId={workspace.id} />
        )}
        {tab === "shared-tasks" && workspace && (
          <SharedTasksTab workspaceId={workspace.id} />
        )}
      </div>

      {workspace && (
        <SearchPalette
          open={searchOpen}
          onClose={closeSearch}
          workspaceId={workspace.id}
          onNavigate={handleSearchNavigate}
        />
      )}
    </div>
  );
};
