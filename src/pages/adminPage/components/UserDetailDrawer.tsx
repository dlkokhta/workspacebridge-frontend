import {
  X,
  ShieldCheck,
  ShieldOff,
  KeyRound,
  BadgeCheck,
  LayoutGrid,
  Users,
  Monitor,
  Mail,
} from "lucide-react";
import {
  useAdminUserDetail,
  type AdminUserDetail,
} from "../../../hooks/useAdminUserDetail";

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
        {/* Header */}
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
            <p className="text-[13px] text-[#858c87] dark:text-[#6e7672]">
              Loading…
            </p>
          </div>
        )}

        {user && <UserDetailContent
          user={user}
          onSuspend={(status) => updateStatus(user.id, status)}
          onResetPassword={() => resetPassword(user.id)}
          onForceVerify={() => forceVerify(user.id)}
          isSuspending={isSuspending}
          isResettingPassword={isResettingPassword}
          isVerifying={isVerifying}
        />}
      </div>
    </>
  );
};

function UserDetailContent({
  user,
  onSuspend,
  onResetPassword,
  onForceVerify,
  isSuspending,
  isResettingPassword,
  isVerifying,
}: {
  user: AdminUserDetail;
  onSuspend: (status: string) => void;
  onResetPassword: () => void;
  onForceVerify: () => void;
  isSuspending: boolean;
  isResettingPassword: boolean;
  isVerifying: boolean;
}) {
  const fullName =
    user.firstname || user.lastname
      ? `${user.firstname ?? ""} ${user.lastname ?? ""}`.trim()
      : null;

  const isSuspended = user.status === "SUSPENDED";

  const fmt = (d: string) =>
    new Date(d).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  const fmtFull = (d: string) =>
    new Date(d).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });

  return (
    <div className="px-5 py-5 space-y-5">
      {/* Profile header */}
      <div>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-[#5a8a6b] text-white flex items-center justify-center text-[14px] font-semibold shrink-0">
            {(fullName?.[0] ?? user.email[0]).toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="text-[15px] font-semibold text-[#1a201c] dark:text-[#e8ece9] truncate">
              {fullName ?? user.email}
            </div>
            {fullName && (
              <div className="text-[12px] text-[#858c87] dark:text-[#6e7672]">
                {user.email}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-3">
          <Badge label={user.role} variant="role" />
          <Badge
            label={isSuspended ? "Suspended" : "Active"}
            variant={isSuspended ? "danger" : "success"}
          />
          <Badge
            label={user.isVerified ? "Verified" : "Unverified"}
            variant={user.isVerified ? "success" : "danger"}
          />
          {user.isTwoFactorEnabled && <Badge label="2FA" variant="info" />}
          <Badge label={user.method} variant="neutral" />
          <Badge label={user.plan} variant="neutral" />
        </div>

        <div className="text-[12px] text-[#858c87] dark:text-[#6e7672]">
          Joined {fmt(user.createdAt)}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        <ActionButton
          icon={isSuspended ? <ShieldCheck size={13} /> : <ShieldOff size={13} />}
          label={isSuspended ? "Activate" : "Suspend"}
          variant={isSuspended ? "success" : "danger"}
          loading={isSuspending}
          onClick={() => onSuspend(isSuspended ? "ACTIVE" : "SUSPENDED")}
        />
        <ActionButton
          icon={<KeyRound size={13} />}
          label="Reset password"
          variant="default"
          loading={isResettingPassword}
          onClick={onResetPassword}
        />
        {!user.isVerified && (
          <ActionButton
            icon={<BadgeCheck size={13} />}
            label="Force verify"
            variant="default"
            loading={isVerifying}
            onClick={onForceVerify}
          />
        )}
      </div>

      {/* Owned workspaces */}
      <Section
        icon={<LayoutGrid size={13} />}
        title="Owned workspaces"
        count={user.ownedWorkspaces.length}
      >
        {user.ownedWorkspaces.length === 0 ? (
          <EmptyRow text="No owned workspaces" />
        ) : (
          user.ownedWorkspaces.map((ws) => (
            <div
              key={ws.id}
              className="flex items-center gap-2.5 py-2 first:pt-0 last:pb-0"
            >
              <span
                className="w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-semibold text-white shrink-0"
                style={{ background: ws.color }}
              >
                {ws.name[0].toUpperCase()}
              </span>
              <span className="text-[13px] text-[#1a201c] dark:text-[#e8ece9] truncate flex-1">
                {ws.name}
              </span>
              <StatusPill status={ws.status} />
            </div>
          ))
        )}
      </Section>

      {/* Memberships */}
      <Section
        icon={<Users size={13} />}
        title="Memberships"
        count={user.workspaceMemberships.length}
      >
        {user.workspaceMemberships.length === 0 ? (
          <EmptyRow text="No memberships" />
        ) : (
          user.workspaceMemberships.map((m) => (
            <div
              key={m.id}
              className="flex items-center gap-2.5 py-2 first:pt-0 last:pb-0"
            >
              <span
                className="w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-semibold text-white shrink-0"
                style={{ background: m.workspace.color }}
              >
                {m.workspace.name[0].toUpperCase()}
              </span>
              <span className="text-[13px] text-[#1a201c] dark:text-[#e8ece9] truncate flex-1">
                {m.workspace.name}
              </span>
              <span className="text-[11px] text-[#858c87] dark:text-[#6e7672]">
                {m.role}
              </span>
            </div>
          ))
        )}
      </Section>

      {/* Sessions */}
      <Section
        icon={<Monitor size={13} />}
        title="Sessions"
        count={user.Session.length}
      >
        {user.Session.length === 0 ? (
          <EmptyRow text="No active sessions" />
        ) : (
          user.Session.map((s) => (
            <div
              key={s.id}
              className="py-2 first:pt-0 last:pb-0 border-b border-black/[0.04] dark:border-white/[0.04] last:border-0"
            >
              <div className="text-[12px] text-[#1a201c] dark:text-[#e8ece9] truncate">
                {s.userAgent
                  ? s.userAgent.length > 60
                    ? s.userAgent.slice(0, 60) + "…"
                    : s.userAgent
                  : "Unknown device"}
              </div>
              <div className="flex gap-3 mt-0.5 text-[11px] text-[#858c87] dark:text-[#6e7672]">
                <span>IP: {s.ip ?? "—"}</span>
                <span>Created: {fmtFull(s.createdAt)}</span>
                <span>
                  Expires: {fmtFull(s.expiresAt)}
                </span>
              </div>
            </div>
          ))
        )}
      </Section>

      {/* Invites sent */}
      <Section
        icon={<Mail size={13} />}
        title="Invites sent"
        count={user.invitesSent.length}
      >
        {user.invitesSent.length === 0 ? (
          <EmptyRow text="No invites sent" />
        ) : (
          user.invitesSent.map((inv) => (
            <div
              key={inv.id}
              className="py-2 first:pt-0 last:pb-0 border-b border-black/[0.04] dark:border-white/[0.04] last:border-0"
            >
              <div className="flex items-center gap-2">
                <span className="text-[13px] text-[#1a201c] dark:text-[#e8ece9]">
                  {inv.email ?? "Link invite"}
                </span>
                <span
                  className={`inline-flex items-center h-[18px] px-1.5 rounded-full border text-[9px] font-medium ${
                    inv.usedAt
                      ? "bg-[#5a8a6b]/10 text-[#3e6a4d] dark:text-[#6db383] border-[#5a8a6b]/30"
                      : new Date(inv.expiresAt) < new Date()
                        ? "bg-[#c25a4a]/10 text-[#c25a4a] dark:text-[#e07b6b] border-[#c25a4a]/30"
                        : "bg-[#d4a843]/10 text-[#a68a2a] dark:text-[#d4a843] border-[#d4a843]/30"
                  }`}
                >
                  {inv.usedAt
                    ? "Used"
                    : new Date(inv.expiresAt) < new Date()
                      ? "Expired"
                      : "Pending"}
                </span>
              </div>
              <div className="text-[11px] text-[#858c87] dark:text-[#6e7672] mt-0.5">
                {inv.workspace.name} — sent {fmt(inv.createdAt)}
              </div>
            </div>
          ))
        )}
      </Section>
    </div>
  );
}

function Badge({
  label,
  variant,
}: {
  label: string;
  variant: "role" | "success" | "danger" | "info" | "neutral";
}) {
  const cls = {
    role: "bg-[#9b7abf]/10 text-[#7a5a9b] dark:text-[#b89adb] border-[#9b7abf]/30",
    success:
      "bg-[#5a8a6b]/10 text-[#3e6a4d] dark:text-[#6db383] border-[#5a8a6b]/30",
    danger:
      "bg-[#c25a4a]/10 text-[#c25a4a] dark:text-[#e07b6b] border-[#c25a4a]/30",
    info: "bg-[#7a9bbf]/10 text-[#4a6a8a] dark:text-[#7a9bbf] border-[#7a9bbf]/30",
    neutral:
      "bg-black/[0.04] dark:bg-white/[0.04] text-[#858c87] dark:text-[#6e7672] border-black/[0.08] dark:border-white/[0.07]",
  }[variant];

  return (
    <span
      className={`inline-flex items-center h-[20px] px-2 rounded-full border text-[10px] font-medium ${cls}`}
    >
      {label}
    </span>
  );
}

function ActionButton({
  icon,
  label,
  variant,
  loading,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  variant: "default" | "danger" | "success";
  loading: boolean;
  onClick: () => void;
}) {
  const cls = {
    default:
      "border-black/[0.08] dark:border-white/[0.07] text-[#5a625e] dark:text-[#a0a8a3] hover:bg-[#f6f6f1] dark:hover:bg-[#222b26]",
    danger:
      "border-[#c25a4a]/30 text-[#c25a4a] dark:text-[#e07b6b] hover:bg-[#c25a4a]/5",
    success:
      "border-[#5a8a6b]/30 text-[#5a8a6b] dark:text-[#6db383] hover:bg-[#5a8a6b]/5",
  }[variant];

  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`h-8 px-3 inline-flex items-center gap-1.5 rounded-lg border text-[12px] font-medium transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${cls}`}
    >
      {icon}
      {loading ? "…" : label}
    </button>
  );
}

function Section({
  icon,
  title,
  count,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-black/[0.08] dark:border-white/[0.07] bg-white dark:bg-[#151a17] overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-black/[0.06] dark:border-white/[0.05]">
        <span className="text-[#858c87] dark:text-[#6e7672]">{icon}</span>
        <span className="text-[13px] font-medium text-[#1a201c] dark:text-[#e8ece9]">
          {title}
        </span>
        <span className="ml-auto text-[11px] text-[#858c87] dark:text-[#6e7672]">
          {count}
        </span>
      </div>
      <div className="px-4 py-3">{children}</div>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const cls = {
    ACTIVE:
      "bg-[#5a8a6b]/10 text-[#3e6a4d] dark:text-[#6db383] border-[#5a8a6b]/30",
    COMPLETED:
      "bg-[#7a9bbf]/10 text-[#4a6a8a] dark:text-[#7a9bbf] border-[#7a9bbf]/30",
    ARCHIVED:
      "bg-black/[0.04] dark:bg-white/[0.04] text-[#858c87] dark:text-[#6e7672] border-black/[0.08] dark:border-white/[0.07]",
  }[status] ??
  "bg-black/[0.04] dark:bg-white/[0.04] text-[#858c87] dark:text-[#6e7672] border-black/[0.08] dark:border-white/[0.07]";

  return (
    <span
      className={`inline-flex items-center h-[18px] px-1.5 rounded-full border text-[9px] font-medium shrink-0 ${cls}`}
    >
      {status}
    </span>
  );
}

function EmptyRow({ text }: { text: string }) {
  return (
    <p className="text-[12px] text-[#b5bbb7] dark:text-[#4a514d] py-1">
      {text}
    </p>
  );
}
