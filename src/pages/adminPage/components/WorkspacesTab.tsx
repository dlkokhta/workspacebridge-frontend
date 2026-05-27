import { useState } from "react";
import {
  useAdminWorkspaces,
  type AdminWorkspace,
} from "../../../hooks/useAdminWorkspaces";
import { WorkspacesTable } from "./WorkspacesTable";
import { ConfirmDeleteModal } from "./ConfirmDeleteModal";

export const WorkspacesTab = () => {
  const {
    workspaces,
    updateStatus,
    deleteWorkspace,
    updatingStatusId,
    deletingId: deletingWorkspaceId,
  } = useAdminWorkspaces();

  const [confirmingWorkspace, setConfirmingWorkspace] =
    useState<AdminWorkspace | null>(null);

  const handleStatusChange = (ws: AdminWorkspace, newStatus: string) => {
    if (ws.status === newStatus) return;
    void updateStatus(ws.id, newStatus);
  };

  return (
    <>
      {confirmingWorkspace && (
        <ConfirmDeleteModal
          title="Delete Workspace"
          description={
            <>
              Are you sure you want to delete{" "}
              <span className="font-medium text-[#1a201c] dark:text-[#e8ece9]">
                {confirmingWorkspace.name}
              </span>
              ? All messages, files, and members will be removed. This cannot be
              undone.
            </>
          }
          onConfirm={() => {
            const id = confirmingWorkspace.id;
            setConfirmingWorkspace(null);
            void deleteWorkspace(id);
          }}
          onCancel={() => setConfirmingWorkspace(null)}
        />
      )}

      <WorkspacesTable
        workspaces={workspaces}
        updatingStatusId={updatingStatusId}
        deletingWorkspaceId={deletingWorkspaceId}
        onStatusChange={handleStatusChange}
        onDeleteClick={setConfirmingWorkspace}
      />
    </>
  );
};
