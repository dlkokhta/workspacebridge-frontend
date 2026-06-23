import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance, useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import { useUnreadMessages } from "../../hooks/useUnreadMessages";
import { useWorkspaces } from "../../hooks/useWorkspaces";
import {
  useWorkspaceDetail,
  workspaceDetailKey,
} from "../../hooks/useWorkspaceDetail";
import { WorkspaceSidebar } from "./components/WorkspaceSidebar";
import { SearchPalette } from "../../components/search/SearchPalette";
import { useSearchPalette } from "../../components/search/useSearchPalette";
import { WorkspaceTopbar } from "./components/WorkspaceTopbar";
import { WorkspaceTabBar } from "./components/WorkspaceTabBar";
import { RemoveMemberModal } from "./components/RemoveMemberModal";
import { MessagesTab } from "./messages/MessagesTab";
import { FilesTab } from "./files/FilesTab";
import { useNewFiles } from "./files/useNewFiles";
import { WhiteboardTab } from "./whiteboard/WhiteboardTab";
import { SharedLinksTab } from "./tabs/SharedLinksTab";
import { SharedTasksTab } from "./sharedTasks/SharedTasksTab";
import { MyTasksTab } from "./myTasks/MyTasksTab";
import { SettingsTab } from "./tabs/SettingsTab";
import type { Tab, WorkspaceDetail, WorkspaceMember } from "./types";

const WORKSPACE_TABS: Tab[] = [
  "messages",
  "files",
  "whiteboard",
  "shared-links",
  "todos",
  "my-tasks",
  "settings",
];

export const WorkspacePage = () => {
  const { id = "northwind" } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { setAccessToken } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const queryClient = useQueryClient();

  const [searchParams] = useSearchParams();
  const [tab, setTab] = useState<Tab>("messages");
  const { open: searchOpen, setOpen: setSearchOpen, close: closeSearch } =
    useSearchPalette();
  const [confirmMember, setConfirmMember] = useState<WorkspaceMember | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close the mobile sidebar drawer whenever the active workspace changes.
  useEffect(() => setSidebarOpen(false), [id]);

  // Open the tab named in the URL (?tab=…) — used by global search click-through.
  useEffect(() => {
    const requested = searchParams.get("tab");
    if (requested && WORKSPACE_TABS.includes(requested as Tab)) {
      setTab(requested as Tab);
    }
  }, [searchParams]);

  const profileQuery = useCurrentUser();
  const workspacesQuery = useWorkspaces();
  const workspaceQuery = useWorkspaceDetail(id);

  const profile = profileQuery.data ?? null;
  const workspaces = workspacesQuery.data ?? [];
  const workspace = workspaceQuery.data ?? null;

  useEffect(() => {
    if (
      profileQuery.error ||
      workspacesQuery.error ||
      workspaceQuery.error
    ) {
      navigate("/login");
    }
  }, [
    profileQuery.error,
    workspacesQuery.error,
    workspaceQuery.error,
    navigate,
  ]);

  const removeMemberMutation = useMutation({
    mutationFn: async (member: WorkspaceMember) => {
      await axiosInstance.delete(
        `/workspace/${id}/members/${member.user.id}`,
      );
      return member;
    },
    onSuccess: (removed) => {
      queryClient.setQueryData<WorkspaceDetail>(workspaceDetailKey(id), (prev) =>
        prev
          ? { ...prev, members: prev.members.filter((m) => m.id !== removed.id) }
          : prev,
      );
      setConfirmMember(null);
    },
  });

  const initials = (() => {
    if (profile?.firstname && profile?.lastname) return `${profile.firstname[0]}${profile.lastname[0]}`.toUpperCase();
    if (profile?.firstname) return profile.firstname[0].toUpperCase();
    if (profile?.email) return profile.email[0].toUpperCase();
    return "?";
  })();

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

  const handleRemoveMember = () => {
    if (!confirmMember || !workspace) return;
    removeMemberMutation.mutate(confirmMember);
  };

  const clients = workspace?.members.filter((m) => m.role === "CLIENT") ?? [];

  const messagesUnread = useUnreadMessages(
    id,
    profile?.id ?? "",
    tab === "messages",
  );
  const filesHasNew = useNewFiles(id, tab === "files");

  return (
    <div className="h-screen grid lg:grid-cols-[248px_1fr] bg-[#fafaf7] dark:bg-[#0e1310] overflow-hidden">
      <WorkspaceSidebar
        activeId={id}
        workspaces={workspaces}
        profile={profile}
        initials={initials}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onLogout={handleLogout}
        onOpenSearch={() => setSearchOpen(true)}
      />

      <div className="flex flex-col overflow-hidden min-w-0">
        <WorkspaceTopbar
          workspaceName={workspace?.name}
          theme={theme}
          onToggleTheme={toggleTheme}
          onOpenSidebar={() => setSidebarOpen(true)}
        />

        <WorkspaceTabBar
          activeTab={tab}
          onTabChange={setTab}
          messagesUnread={messagesUnread}
          filesHasNew={filesHasNew}
          clients={clients}
          onRemoveClient={setConfirmMember}
        />

        <div className="flex flex-col flex-1 overflow-hidden min-h-0">
          {tab === "messages" && (
            <MessagesTab
              workspaceId={id}
              userId={profile?.id ?? ""}
              initials={initials}
            />
          )}
          {tab === "files" && workspace && (
            <FilesTab
              workspaceId={id}
              currentUserId={profile?.id ?? ""}
              workspaceOwnerId={workspace.ownerId}
            />
          )}
          {tab === "whiteboard" && <WhiteboardTab workspaceId={id} />}
          {tab === "shared-links" && <SharedLinksTab workspaceId={id} />}
          {tab === "todos" && <SharedTasksTab workspaceId={id} />}
          {tab === "my-tasks" && <MyTasksTab workspaceId={id} />}
          {tab === "settings" && workspace && (
            <SettingsTab workspace={workspace} />
          )}
        </div>
      </div>

      {confirmMember && (
        <RemoveMemberModal
          member={confirmMember}
          removing={removeMemberMutation.isPending}
          onCancel={() => setConfirmMember(null)}
          onConfirm={handleRemoveMember}
        />
      )}

      <SearchPalette open={searchOpen} onClose={closeSearch} />
    </div>
  );
};
