import type { WorkspaceMember } from "../types";

interface RemoveMemberModalProps {
  member: WorkspaceMember;
  removing: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export const RemoveMemberModal = ({ member, removing, onCancel, onConfirm }: RemoveMemberModalProps) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
    <div className="w-full max-w-[360px] bg-white dark:bg-[#151a17] rounded-xl border border-black/[0.08] dark:border-white/[0.07] shadow-xl p-6">
      <h2 className="text-[15px] font-semibold text-[#1a201c] dark:text-[#e8ece9] mb-1">Remove client</h2>
      <p className="text-[13px] text-[#5a625e] dark:text-[#a0a8a3] mb-5">
        Remove{" "}
        <span className="font-medium text-[#1a201c] dark:text-[#e8ece9]">
          {member.user.firstname ?? member.user.email}
        </span>{" "}
        from this workspace? They will lose access immediately.
      </p>
      <div className="flex gap-2">
        <button
          onClick={onCancel}
          className="flex-1 h-10 rounded-lg border border-black/[0.08] dark:border-white/[0.07] text-[13px] font-medium text-[#5a625e] dark:text-[#a0a8a3] hover:bg-black/[0.03] dark:hover:bg-white/[0.03] transition-colors cursor-pointer"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={removing}
          className="flex-1 h-10 rounded-lg bg-[#c25a4a] hover:bg-[#b04f40] text-white text-[13px] font-medium transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {removing ? "Removing…" : "Remove"}
        </button>
      </div>
    </div>
  </div>
);
