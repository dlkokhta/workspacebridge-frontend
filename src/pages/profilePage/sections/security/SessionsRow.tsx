import { useState } from "react";
import { Monitor, ShieldCheck, Smartphone, Tablet } from "lucide-react";
import { SmallBtn } from "../../components/SmallBtn";
import { useSessions } from "./useSessions";
import { formatRelative, parseUserAgent, type DeviceKind } from "./sessionUtils";

const DeviceIcon = ({ kind }: { kind: DeviceKind }) => {
  const cls = "h-4 w-4 text-[#5a625e] dark:text-[#a0a8a3]";
  if (kind === "mobile") return <Smartphone className={cls} />;
  if (kind === "tablet") return <Tablet className={cls} />;
  return <Monitor className={cls} />;
};

interface SessionsRowProps {
  onSuccess: (message: string) => void;
}

export const SessionsRow = ({ onSuccess }: SessionsRowProps) => {
  const [open, setOpen] = useState(false);
  const { query, revokeSession, revokeOthers } = useSessions(open);

  const sessions = query.data ?? [];
  const hasOthers = sessions.some((s) => !s.isCurrent);

  return (
    <div className="border-b border-black/[0.06] dark:border-white/[0.05]">
      <div className="flex items-start justify-between gap-6 py-5">
        <div className="flex-1">
          <div className="text-[14px] font-medium text-[#1a201c] dark:text-[#e8ece9] mb-1">
            Active sessions
          </div>
          <div className="text-[13px] text-[#5a625e] dark:text-[#a0a8a3] leading-[1.5] max-w-[380px]">
            Manage devices currently signed in to your account.
          </div>
        </div>
        <SmallBtn onClick={() => setOpen((v) => !v)}>
          {open ? "Hide" : "Manage"}
        </SmallBtn>
      </div>

      {open && (
        <div className="pb-5 space-y-2 max-w-[520px]">
          {query.isLoading && (
            <p className="text-[13px] text-[#5a625e] dark:text-[#a0a8a3]">
              Loading sessions…
            </p>
          )}
          {query.isError && (
            <p className="text-[13px] text-red-500">
              Could not load your sessions.
            </p>
          )}
          {query.isSuccess && sessions.length === 0 && (
            <p className="text-[13px] text-[#5a625e] dark:text-[#a0a8a3]">
              No active sessions found.
            </p>
          )}

          {sessions.map((session) => {
            const { label, kind } = parseUserAgent(session.userAgent);
            const revokingThis =
              revokeSession.isPending && revokeSession.variables === session.id;
            return (
              <div
                key={session.id}
                className="flex items-center gap-3 px-3.5 py-3 rounded-lg border border-black/[0.08] dark:border-white/[0.07] bg-white dark:bg-[#151a17]"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-black/[0.04] dark:bg-white/[0.06]">
                  <DeviceIcon kind={kind} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-medium text-[#1a201c] dark:text-[#e8ece9]">
                      {label}
                    </span>
                    {session.isCurrent && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#5a8a6b]/10 px-2 py-0.5 text-[11px] font-semibold text-[#3e6a4d] dark:text-[#6db383]">
                        <ShieldCheck className="h-3 w-3" /> This device
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-[12px] text-[#5a625e] dark:text-[#a0a8a3]">
                    {session.ip ?? "Unknown IP"} · active{" "}
                    {formatRelative(session.updatedAt)}
                  </p>
                </div>
                {!session.isCurrent && (
                  <SmallBtn
                    variant="danger"
                    disabled={revokingThis}
                    onClick={() =>
                      revokeSession.mutate(session.id, {
                        onSuccess: () => onSuccess("Session revoked."),
                      })
                    }
                  >
                    {revokingThis ? "…" : "Revoke"}
                  </SmallBtn>
                )}
              </div>
            );
          })}

          {(revokeSession.isError || revokeOthers.isError) && (
            <p className="text-[12px] text-red-500">
              Failed to revoke. Please try again.
            </p>
          )}

          {hasOthers && (
            <SmallBtn
              variant="danger"
              disabled={revokeOthers.isPending}
              onClick={() =>
                revokeOthers.mutate(undefined, {
                  onSuccess: ({ count }) =>
                    onSuccess(
                      `Signed out ${count} other session${count === 1 ? "" : "s"}.`,
                    ),
                })
              }
            >
              {revokeOthers.isPending ? "Signing out…" : "Sign out all other devices"}
            </SmallBtn>
          )}
        </div>
      )}
    </div>
  );
};
