import { useState } from "react";
import { Bug } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { BugReportModal } from "./BugReportModal";

/**
 * Floating "report a bug" launcher shown on every authenticated page (freelancer
 * and client portal alike). Hidden for logged-out visitors on public pages.
 */
export const BugReportWidget = () => {
  const { accessToken } = useAuth();
  const [open, setOpen] = useState(false);

  if (!accessToken) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Report a bug"
        title="Report a bug"
        className="fixed bottom-4 right-4 z-40 flex h-11 w-11 items-center justify-center rounded-full bg-[#5a8a6b] text-white shadow-lg transition-colors hover:bg-[#4f7a5e] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5a8a6b] focus-visible:ring-offset-2"
      >
        <Bug size={18} />
      </button>
      {open && <BugReportModal onClose={() => setOpen(false)} />}
    </>
  );
};
