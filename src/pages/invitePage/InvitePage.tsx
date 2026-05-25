import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { useInvite } from "./hooks/useInvite";
import { InviteHeader } from "./components/InviteHeader";
import { InvalidInviteState } from "./components/InvalidInviteState";
import { DoneState } from "./components/DoneState";
import { AcceptInviteForm } from "./sections/AcceptInviteForm";

const extractApiMessage = (err: unknown): string | null =>
  (err as { response?: { data?: { message?: string } } })?.response?.data
    ?.message ?? null;

export const InvitePage = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const inviteQuery = useInvite(token);
  const [done, setDone] = useState(false);

  // After a successful join we briefly show the "You're in!" screen, then
  // redirect to the client portal.
  useEffect(() => {
    if (!done) return;
    const timer = setTimeout(() => navigate("/portal"), 800);
    return () => clearTimeout(timer);
  }, [done, navigate]);

  const tokenMissing = !token;
  const invalidMessage = tokenMissing
    ? "Invalid invite link."
    : extractApiMessage(inviteQuery.error) ??
      "This invite link is invalid or has expired.";

  return (
    <div className="min-h-screen flex flex-col bg-[#fafaf7] dark:bg-[#0e1310]">
      <InviteHeader theme={theme} onToggleTheme={toggleTheme} />

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-[440px]">
          {!tokenMissing && inviteQuery.isLoading && (
            <p className="text-center text-[#858c87] dark:text-[#6e7672] text-[14px]">
              Checking invite…
            </p>
          )}

          {(tokenMissing || inviteQuery.error) && (
            <InvalidInviteState message={invalidMessage} />
          )}

          {!done && inviteQuery.data && token && (
            <AcceptInviteForm
              token={token}
              invite={inviteQuery.data}
              onAccepted={() => setDone(true)}
            />
          )}

          {done && <DoneState />}
        </div>
      </div>
    </div>
  );
};
