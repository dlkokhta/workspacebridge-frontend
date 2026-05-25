import { useNavigate } from "react-router-dom";

interface InvalidInviteStateProps {
  message: string;
}

export const InvalidInviteState = ({ message }: InvalidInviteStateProps) => {
  const navigate = useNavigate();

  return (
    <div className="text-center">
      <div className="w-14 h-14 mx-auto mb-5 rounded-2xl bg-red-50 dark:bg-red-900/20 text-red-400 flex items-center justify-center">
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="15" y1="9" x2="9" y2="15" />
          <line x1="9" y1="9" x2="15" y2="15" />
        </svg>
      </div>
      <h1 className="text-[24px] font-semibold tracking-[-0.02em] text-[#1a201c] dark:text-[#e8ece9] mb-2">
        Invite unavailable
      </h1>
      <p className="text-[14px] text-[#858c87] dark:text-[#6e7672] mb-6">
        {message}
      </p>
      <button
        onClick={() => navigate("/login")}
        className="h-10 px-5 inline-flex items-center gap-2 rounded-lg bg-[#5a8a6b] hover:bg-[#4f7a5e] text-white text-[13px] font-medium transition-colors cursor-pointer"
      >
        Go to login
      </button>
    </div>
  );
};
