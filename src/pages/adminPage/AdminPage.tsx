import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, axiosInstance } from "../../context/AuthContext";
import { useAdminUsers, type AdminUser } from "../../hooks/useAdminUsers";

export const AdminPage = () => {
  const navigate = useNavigate();
  const { setAccessToken } = useAuth();
  const {
    users,
    error,
    updateRole,
    deleteUser,
    updatingRoleId,
    deletingId,
  } = useAdminUsers();

  const [confirmingUser, setConfirmingUser] = useState<AdminUser | null>(null);

  // Match the original behavior: if the list fetch fails (e.g. 401 after the
  // axios interceptor's refresh attempt), bounce to login.
  useEffect(() => {
    if (error) navigate("/login");
  }, [error, navigate]);

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

  const handleRoleChange = (user: AdminUser, newRole: string) => {
    if (user.role === newRole) return;
    void updateRole(user.id, newRole);
  };

  const handleDeleteClick = (user: AdminUser) => setConfirmingUser(user);

  const handleCancelDelete = () => setConfirmingUser(null);

  const handleConfirmDelete = () => {
    if (!confirmingUser) return;
    const id = confirmingUser.id;
    setConfirmingUser(null);
    void deleteUser(id);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-8">
      {confirmingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-500 bg-opacity-75">
          <div className="w-full max-w-md mx-4 rounded bg-white dark:bg-gray-800 p-6 shadow-lg">
            <h2 className="mb-4 text-lg font-bold dark:text-white">Delete User</h2>
            <p className="mb-6 text-gray-600 dark:text-gray-300">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-gray-900">{confirmingUser.email}</span>?
              This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleConfirmDelete}
                className="cursor-pointer rounded-xl bg-red-500 px-5 py-2 text-sm text-white hover:bg-red-600"
              >
                Yes, delete
              </button>
              <button
                onClick={handleCancelDelete}
                className="cursor-pointer rounded-xl bg-gray-200 px-5 py-2 text-sm hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Admin Panel</h1>
          <button
            onClick={handleLogout}
            className="cursor-pointer px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Email</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Role</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Method</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Verified</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Created</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-200">{user.email}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {user.firstname || user.lastname
                      ? `${user.firstname ?? ""} ${user.lastname ?? ""}`.trim()
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <select
                      value={user.role}
                      disabled={updatingRoleId === user.id}
                      onChange={(e) => handleRoleChange(user, e.target.value)}
                      className={`px-2 py-1 rounded text-xs font-semibold border-0 cursor-pointer focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed ${
                        user.role === "ADMIN"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      <option value="REGULAR">REGULAR</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{user.method}</td>
                  <td className="px-4 py-3 text-sm">
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        user.isVerified
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {user.isVerified ? "Yes" : "No"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <button
                      onClick={() => handleDeleteClick(user)}
                      disabled={deletingId === user.id}
                      className="cursor-pointer px-3 py-1 text-xs font-medium text-red-600 bg-red-50 rounded hover:bg-red-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {deletingId === user.id ? "..." : "Delete"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {users.length === 0 && (
              <p className="text-center py-8 text-gray-400 dark:text-gray-500">No users found.</p>
          )}
        </div>
      </div>
    </div>
  );
};
