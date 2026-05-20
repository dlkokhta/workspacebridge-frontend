import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { axiosInstance, useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { WorkspaceSidebar } from "./components/WorkspaceSidebar";
import { WorkspaceTopbar } from "./components/WorkspaceTopbar";
import { WorkspaceTabBar } from "./components/WorkspaceTabBar";
import { RemoveMemberModal } from "./components/RemoveMemberModal";
import { MessagesTab } from "./tabs/MessagesTab";
import { FilesTab } from "./files/FilesTab";
import { WhiteboardTab } from "./whiteboard/WhiteboardTab";
import { SharedLinksTab } from "./tabs/SharedLinksTab";
import { SettingsTab } from "./tabs/SettingsTab";
import type { Tab, UserProfile, Workspace, WorkspaceDetail, WorkspaceMember } from "./types";

export const WorkspacePage = () => {
  const { id = "northwind" } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { setAccessToken } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [tab, setTab] = useState<Tab>("messages");
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [workspace, setWorkspace] = useState<WorkspaceDetail | null>(null);
  const [confirmMember, setConfirmMember] = useState<WorkspaceMember | null>(null);
  const [removing, setRemoving] = useState(false);

  useEffect(() => {
    axiosInstance
      .get<UserProfile>("/user/me")
      .then((r) => setProfile(r.data))
      .catch(() => navigate("/login"));
    axiosInstance
      .get<Workspace[]>("/workspace")
      .then((r) => setWorkspaces(r.data))
      .catch(() => navigate("/login"));
    axiosInstance
      .get<WorkspaceDetail>(`/workspace/${id}`)
      .then((r) => setWorkspace(r.data))
      .catch(() => navigate("/login"));
  }, [id, navigate]);

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

  const handleRemoveMember = async () => {
    if (!confirmMember || !workspace) return;
    setRemoving(true);
    try {
      await axiosInstance.delete(`/workspace/${workspace.id}/members/${confirmMember.user.id}`);
      setWorkspace((prev) =>
        prev ? { ...prev, members: prev.members.filter((m) => m.id !== confirmMember.id) } : prev
      );
      setConfirmMember(null);
    } catch {
      // ignore — could show a toast here later
    } finally {
      setRemoving(false);
    }
  };

  const clients = workspace?.members.filter((m) => m.role === "CLIENT") ?? [];

  return (
    <div className="h-screen grid lg:grid-cols-[248px_1fr] bg-[#fafaf7] dark:bg-[#0e1310] overflow-hidden">
      <WorkspaceSidebar
        activeId={id}
        workspaces={workspaces}
        profile={profile}
        initials={initials}
        onLogout={handleLogout}
      />

      <div className="flex flex-col overflow-hidden min-w-0">
        <WorkspaceTopbar
          workspaceName={workspace?.name}
          profile={profile}
          initials={initials}
          theme={theme}
          onToggleTheme={toggleTheme}
        />

        <WorkspaceTabBar
          activeTab={tab}
          onTabChange={setTab}
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
          {tab === "settings" && workspace && (
            <SettingsTab workspace={workspace} onUpdate={setWorkspace} />
          )}
        </div>
      </div>

      {confirmMember && (
        <RemoveMemberModal
          member={confirmMember}
          removing={removing}
          onCancel={() => setConfirmMember(null)}
          onConfirm={handleRemoveMember}
        />
      )}
    </div>
  );
};
