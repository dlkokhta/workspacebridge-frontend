import { useState } from "react";
import { LogOut } from "lucide-react";
import type { UserProfile } from "../../../hooks/useCurrentUser";
import { Row } from "../components/Row";
import { SectionHeader } from "../components/SectionHeader";
import { SmallBtn } from "../components/SmallBtn";
import { PasswordChangeRow } from "./security/PasswordChangeRow";
import { TwoFactorRow } from "./security/TwoFactorRow";

interface SecuritySectionProps {
  profile: UserProfile;
  onLogout: () => void;
}

export const SecuritySection = ({ profile, onLogout }: SecuritySectionProps) => {
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  const showSuccess = (message: string) => {
    setSuccessBanner(message);
    setTimeout(() => setSuccessBanner(null), 4000);
  };

  return (
    <>
      <SectionHeader title="Security" desc="Keep your account safe." />
      {successBanner && (
        <div className="mt-4 px-4 py-2.5 rounded-lg bg-[#5a8a6b]/10 border border-[#5a8a6b]/30 text-[13px] text-[#3e6a4d] dark:text-[#6db383]">
          {successBanner}
        </div>
      )}

      <div className="mt-6">
        {profile.method === "CREDENTIALS" && <PasswordChangeRow />}

        <TwoFactorRow profile={profile} onSuccess={showSuccess} />

        <Row title="Active sessions" desc="Manage devices currently signed in.">
          <SmallBtn disabled title="Coming soon">
            Manage
          </SmallBtn>
        </Row>

        <Row title="Sign out" desc="End your current session on this device.">
          <SmallBtn onClick={onLogout}>
            <LogOut size={13} />
            Sign out
          </SmallBtn>
        </Row>

        <Row title="Sign out everywhere" desc="Log out of all sessions on all devices.">
          <SmallBtn variant="danger" disabled title="Coming soon">
            Sign out all
          </SmallBtn>
        </Row>
      </div>
    </>
  );
};
