import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminUsers, type AdminUser } from "../../../hooks/useAdminUsers";
import { UsersTable } from "./UsersTable";
import { ConfirmDeleteModal } from "./ConfirmDeleteModal";
import { UserDetailDrawer } from "./UserDetailDrawer";

export const UsersTab = () => {
  const navigate = useNavigate();
  const {
    users,
    error,
    updateRole,
    deleteUser,
    updatingRoleId,
    deletingId: deletingUserId,
  } = useAdminUsers();

  const [confirmingUser, setConfirmingUser] = useState<AdminUser | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  useEffect(() => {
    if (error) navigate("/login");
  }, [error, navigate]);

  const handleRoleChange = (user: AdminUser, newRole: string) => {
    if (user.role === newRole) return;
    void updateRole(user.id, newRole);
  };

  return (
    <>
      {confirmingUser && (
        <ConfirmDeleteModal
          title="Delete User"
          description={
            <>
              Are you sure you want to delete{" "}
              <span className="font-medium text-[#1a201c] dark:text-[#e8ece9]">
                {confirmingUser.email}
              </span>
              ? This cannot be undone.
            </>
          }
          onConfirm={() => {
            const id = confirmingUser.id;
            setConfirmingUser(null);
            void deleteUser(id);
          }}
          onCancel={() => setConfirmingUser(null)}
        />
      )}

      <UsersTable
        users={users}
        updatingRoleId={updatingRoleId}
        deletingUserId={deletingUserId}
        onRoleChange={handleRoleChange}
        onDeleteClick={setConfirmingUser}
        onRowClick={setSelectedUserId}
      />

      {selectedUserId && (
        <UserDetailDrawer
          userId={selectedUserId}
          onClose={() => setSelectedUserId(null)}
        />
      )}
    </>
  );
};
