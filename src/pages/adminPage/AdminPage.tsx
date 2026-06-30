import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, axiosInstance } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { AdminSidebar, type AdminTab } from "./components/AdminSidebar";
import { OverviewTab } from "./components/OverviewTab";
import { UsersTab } from "./components/UsersTab";
import { WorkspacesTab } from "./components/WorkspacesTab";
import { InvitesTable } from "./components/InvitesTable";
import { SessionsTable } from "./components/SessionsTable";
import { FilesTable } from "./components/FilesTable";
import { AuditLogTable } from "./components/AuditLogTable";
import { BugReportsTable } from "./components/BugReportsTable";
import { ErrorLogsTable } from "./components/ErrorLogsTable";
import { SettingsTab } from "./components/SettingsTab";

const TAB_TITLES: Record<AdminTab, string> = {
  overview: "Overview",
  users: "Users",
  workspaces: "Workspaces",
  invites: "Invites",
  sessions: "Sessions",
  files: "Files",
  "audit-log": "Audit Log",
  "bug-reports": "Bug Reports",
  "error-logs": "Error Logs",
  settings: "Settings",
};

export const AdminPage = () => {
  const navigate = useNavigate();
  const { setAccessToken } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");

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

  return (
    <div className="h-screen flex bg-[#fafaf7] dark:bg-[#0e1310] overflow-hidden">
      <AdminSidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        theme={theme}
        onToggleTheme={toggleTheme}
        onLogout={handleLogout}
      />

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Topbar */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-black/[0.06] dark:border-white/[0.05] bg-[#fafaf7] dark:bg-[#0e1310] shrink-0">
          <div>
            <div className="text-[11px] uppercase tracking-[0.08em] font-medium text-[#858c87] dark:text-[#6e7672]">
              Admin Panel
            </div>
            <div className="text-[16px] font-semibold mt-0.5 text-[#1a201c] dark:text-[#e8ece9]">
              {TAB_TITLES[activeTab]}
            </div>
          </div>

          {/* Mobile tab selector */}
          <select
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value as AdminTab)}
            className="lg:hidden h-8 px-2 rounded-lg border border-black/[0.08] dark:border-white/[0.07] bg-white dark:bg-[#1c221e] text-[#1a201c] dark:text-[#e8ece9] text-[12px] cursor-pointer focus:outline-none"
          >
            {Object.entries(TAB_TITLES).map(([id, label]) => (
              <option key={id} value={id}>
                {label}
              </option>
            ))}
          </select>
        </header>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-6xl mx-auto">
            {activeTab === "overview" && <OverviewTab />}
            {activeTab === "users" && <UsersTab />}
            {activeTab === "workspaces" && <WorkspacesTab />}
            {activeTab === "invites" && <InvitesTable />}
            {activeTab === "sessions" && <SessionsTable />}
            {activeTab === "files" && <FilesTable />}
            {activeTab === "audit-log" && <AuditLogTable />}
            {activeTab === "bug-reports" && <BugReportsTable />}
            {activeTab === "error-logs" && <ErrorLogsTable />}
            {activeTab === "settings" && <SettingsTab />}
          </div>
        </div>
      </div>
    </div>
  );
};
