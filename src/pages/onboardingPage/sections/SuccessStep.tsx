import { useNavigate } from "react-router-dom";
import { ArrowRight, Check } from "lucide-react";

interface SuccessStepProps {
  workspaceId: string;
  workspaceName: string;
  inviteEmail: string;
  inviteSent: boolean;
}

export const SuccessStep = ({
  workspaceId,
  workspaceName,
  inviteEmail,
  inviteSent,
}: SuccessStepProps) => {
  const navigate = useNavigate();

  return (
    <div className="text-center">
      <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-[#5a8a6b]/10 text-[#5a8a6b] flex items-center justify-center">
        <Check size={28} />
      </div>
      <h1 className="text-[32px] font-semibold tracking-[-0.025em] text-[#1a201c] dark:text-[#e8ece9] mb-2">
        You're all set
      </h1>
      <p className="text-[15px] text-[#5a625e] dark:text-[#a0a8a3] mb-8 max-w-[360px] mx-auto leading-relaxed">
        <strong className="text-[#1a201c] dark:text-[#e8ece9] font-medium">
          {workspaceName || "Your workspace"}
        </strong>{" "}
        is ready.
        {inviteSent && inviteEmail && (
          <>
            {" "}
            An invite was sent to{" "}
            <strong className="text-[#1a201c] dark:text-[#e8ece9] font-medium">
              {inviteEmail}
            </strong>
            .
          </>
        )}
      </p>
      <button
        onClick={() => navigate(`/workspace/${workspaceId}`)}
        className="inline-flex items-center gap-2 h-11 px-6 rounded-lg bg-[#5a8a6b] hover:bg-[#4f7a5e] text-white text-[14px] font-medium transition-colors cursor-pointer"
      >
        Open workspace <ArrowRight size={15} />
      </button>
      <p className="mt-8 text-[13px] text-[#858c87] dark:text-[#6e7672]">
        Need to invite more people?{" "}
        <button className="text-[#5a8a6b] hover:underline cursor-pointer">
          Add team members
        </button>
      </p>
    </div>
  );
};
