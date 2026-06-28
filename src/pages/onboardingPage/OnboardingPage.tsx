import { useCallback, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useTheme } from "../../context/ThemeContext";
import { axiosInstance } from "../../context/AuthContext";
import { workspacesKey } from "../../hooks/useWorkspaces";
import { OnboardingHeader } from "./components/OnboardingHeader";
import { ProgressBar } from "./components/ProgressBar";
import { CreateWorkspaceStep } from "./sections/CreateWorkspaceStep";
import { InviteClientStep } from "./sections/InviteClientStep";
import { SuccessStep } from "./sections/SuccessStep";

const TOTAL_STEPS = 3;

export const OnboardingPage = () => {
  const { theme, toggleTheme } = useTheme();
  const queryClient = useQueryClient();

  const [step, setStep] = useState(1);
  // Workspace details are kept in memory while the wizard runs. Nothing is
  // persisted until the user takes a committing action on step 2, so leaving
  // onboarding (Back, logo, closing the tab) never creates an orphan.
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [workspaceName, setWorkspaceName] = useState("");
  const [workspaceDescription, setWorkspaceDescription] = useState("");
  const [workspaceColor, setWorkspaceColor] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteSent, setInviteSent] = useState(false);

  // Read the latest details inside ensureWorkspace without stale closures.
  const detailsRef = useRef({ name: "", description: "", color: "" });
  detailsRef.current = {
    name: workspaceName,
    description: workspaceDescription,
    color: workspaceColor,
  };
  // Caches the in-flight creation so concurrent committing actions can't
  // create two workspaces.
  const creationRef = useRef<Promise<string> | null>(null);

  // Persist the workspace exactly once, returning its id. Called lazily the
  // first time step 2 needs a real workspace (send invite / generate link /
  // finish).
  const ensureWorkspace = useCallback(async (): Promise<string> => {
    if (workspaceId) return workspaceId;
    if (!creationRef.current) {
      creationRef.current = (async () => {
        try {
          const { data } = await axiosInstance.post<{ id: string }>(
            "/workspace",
            {
              name: detailsRef.current.name,
              description: detailsRef.current.description || undefined,
              color: detailsRef.current.color,
            },
          );
          setWorkspaceId(data.id);
          queryClient.invalidateQueries({ queryKey: workspacesKey });
          return data.id;
        } catch (err) {
          creationRef.current = null; // allow a retry
          throw err;
        }
      })();
    }
    return creationRef.current;
  }, [workspaceId, queryClient]);

  return (
    <div className="min-h-screen flex flex-col bg-[#fafaf7] dark:bg-[#0e1310]">
      <OnboardingHeader
        step={step}
        totalSteps={TOTAL_STEPS}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-[520px]">
          <ProgressBar current={step} total={TOTAL_STEPS} />

          {step === 1 && (
            <CreateWorkspaceStep
              workspaceId={workspaceId}
              initialName={workspaceName}
              initialDescription={workspaceDescription}
              initialColor={workspaceColor}
              onComplete={({ name, description, color }) => {
                setWorkspaceName(name);
                setWorkspaceDescription(description);
                setWorkspaceColor(color);
                setStep(2);
              }}
            />
          )}

          {step === 2 && (
            <InviteClientStep
              ensureWorkspace={ensureWorkspace}
              onBack={() => setStep(1)}
              onComplete={({ email, sent }) => {
                setInviteEmail(email);
                setInviteSent(sent);
                setStep(3);
              }}
            />
          )}

          {step === 3 && workspaceId && (
            <SuccessStep
              workspaceId={workspaceId}
              workspaceName={workspaceName}
              inviteEmail={inviteEmail}
              inviteSent={inviteSent}
            />
          )}
        </div>
      </div>
    </div>
  );
};
