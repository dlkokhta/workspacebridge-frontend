import { useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import { OnboardingHeader } from "./components/OnboardingHeader";
import { ProgressBar } from "./components/ProgressBar";
import { CreateWorkspaceStep } from "./sections/CreateWorkspaceStep";
import { InviteClientStep } from "./sections/InviteClientStep";
import { SuccessStep } from "./sections/SuccessStep";

const TOTAL_STEPS = 3;

export const OnboardingPage = () => {
  const { theme, toggleTheme } = useTheme();

  const [step, setStep] = useState(1);
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [workspaceName, setWorkspaceName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteSent, setInviteSent] = useState(false);

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
              onComplete={({ id, name }) => {
                setWorkspaceId(id);
                setWorkspaceName(name);
                setStep(2);
              }}
            />
          )}

          {step === 2 && workspaceId && (
            <InviteClientStep
              workspaceId={workspaceId}
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
