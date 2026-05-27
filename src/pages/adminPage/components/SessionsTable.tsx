import { X } from "lucide-react";
import { useAdminSessions } from "../../../hooks/useAdminSessions";

export const SessionsTable = () => {
  const { sessions, revokingId, revokeSession } = useAdminSessions();

  const fmtFull = (d: string) =>
    new Date(d).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });

  const isExpired = (d: string) => new Date(d) < new Date();

  return (
    <div className="rounded-xl border border-black/[0.08] dark:border-white/[0.07] bg-white dark:bg-[#151a17] overflow-hidden">
      <div className="px-5 py-4 border-b border-black/[0.06] dark:border-white/[0.05]">
        <h3 className="text-[14px] font-semibold text-[#1a201c] dark:text-[#e8ece9]">Sessions</h3>
        <p className="text-[12px] text-[#858c87] dark:text-[#6e7672] mt-0.5">
          {sessions.length} session{sessions.length !== 1 && "s"}
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-black/[0.06] dark:border-white/[0.05]">
              {["User", "IP", "Device", "Created", "Expires"].map((h) => (
                <th
                  key={h}
                  className="px-5 py-2.5 text-left text-[11px] uppercase tracking-[0.06em] font-medium text-[#858c87] dark:text-[#6e7672]"
                >
                  {h}
                </th>
              ))}
              <th className="px-5 py-2.5" />
            </tr>
          </thead>
          <tbody>
            {sessions.map((s) => (
              <tr
                key={s.id}
                className="border-b border-black/[0.04] dark:border-white/[0.04] last:border-0 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors"
              >
                <td className="px-5 py-3">
                  <div className="text-[13px] text-[#1a201c] dark:text-[#e8ece9]">
                    {s.user.firstname || s.user.lastname
                      ? `${s.user.firstname ?? ""} ${s.user.lastname ?? ""}`.trim()
                      : s.user.email}
                  </div>
                  {(s.user.firstname || s.user.lastname) && (
                    <div className="text-[11px] text-[#858c87] dark:text-[#6e7672]">
                      {s.user.email}
                    </div>
                  )}
                </td>
                <td className="px-5 py-3 text-[12px] text-[#858c87] dark:text-[#6e7672]">
                  {s.ip ?? "—"}
                </td>
                <td className="px-5 py-3 text-[12px] text-[#858c87] dark:text-[#6e7672] max-w-[200px] truncate">
                  {s.userAgent
                    ? s.userAgent.length > 50
                      ? s.userAgent.slice(0, 50) + "…"
                      : s.userAgent
                    : "Unknown"}
                </td>
                <td className="px-5 py-3 text-[12px] text-[#858c87] dark:text-[#6e7672]">
                  {fmtFull(s.createdAt)}
                </td>
                <td className="px-5 py-3">
                  <span
                    className={`text-[12px] ${
                      isExpired(s.expiresAt)
                        ? "text-[#c25a4a] dark:text-[#e07b6b]"
                        : "text-[#858c87] dark:text-[#6e7672]"
                    }`}
                  >
                    {fmtFull(s.expiresAt)}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <button
                    onClick={() => revokeSession(s.id)}
                    disabled={revokingId === s.id}
                    className="w-7 h-7 flex items-center justify-center rounded-lg text-[#858c87] dark:text-[#6e7672] hover:bg-[#c25a4a]/10 hover:text-[#c25a4a] dark:hover:text-[#e07b6b] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Revoke session"
                  >
                    <X size={13} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {sessions.length === 0 && (
        <p className="text-center py-10 text-[13px] text-[#858c87] dark:text-[#6e7672]">
          No sessions found.
        </p>
      )}
    </div>
  );
};
