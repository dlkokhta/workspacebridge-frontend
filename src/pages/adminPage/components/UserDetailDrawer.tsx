import { X } from "lucide-react";
import { useAdminUserDetail } from "../../../hooks/useAdminUserDetail";
import { UserDetailContent } from "./UserDetailContent";

interface UserDetailDrawerProps {
  userId: string;
  onClose: () => void;
}

export const UserDetailDrawer = ({ userId, onClose }: UserDetailDrawerProps) => {
  const {
    user,
    loading,
    updateStatus,
    resetPassword,
    forceVerify,
    isSuspending,
    isResettingPassword,
    isVerifying,
  } = useAdminUserDetail(userId);

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/30 dark:bg-black/50"
        onClick={onClose}
      />
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-lg bg-[#fafaf7] dark:bg-[#0e1310] border-l border-black/[0.08] dark:border-white/[0.07] shadow-xl overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-black/[0.06] dark:border-white/[0.05] sticky top-0 bg-[#fafaf7] dark:bg-[#0e1310] z-10">
          <h2 className="text-[15px] font-semibold text-[#1a201c] dark:text-[#e8ece9]">
            User Detail
          </h2>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-[#858c87] dark:text-[#6e7672] hover:bg-black/[0.05] dark:hover:bg-white/[0.05] transition-colors cursor-pointer"
          >
            <X size={15} />
          </button>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-20">
            <p className="text-[13px] text-[#858c87] dark:text-[#6e7672]">Loading…</p>
          </div>
        )}

        {user && (
          <UserDetailContent
            user={user}
            onSuspend={(status) => updateStatus(user.id, status)}
            onResetPassword={() => resetPassword(user.id)}
            onForceVerify={() => forceVerify(user.id)}
            isSuspending={isSuspending}
            isResettingPassword={isResettingPassword}
            isVerifying={isVerifying}
          />
        )}
      </div>
    </>
  );
};
