import { useState } from "react";
import { LogOut } from "lucide-react";
import type { UserProfile } from "../../../hooks/useCurrentUser";
import { Row } from "../components/Row";
import { SectionHeader } from "../components/SectionHeader";
import { SmallBtn } from "../components/SmallBtn";
import { BackupCodesRow } from "./security/BackupCodesRow";
import { PasskeysRow } from "./security/PasskeysRow";
import { PasswordChangeRow } from "./security/PasswordChangeRow";
import { SessionsRow } from "./security/SessionsRow";
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

        {profile.isTwoFactorEnabled && (
          <BackupCodesRow onSuccess={showSuccess} />
        )}

        <PasskeysRow onSuccess={showSuccess} />

        <SessionsRow onSuccess={showSuccess} />

        <Row title="Sign out" desc="End your current session on this device.">
          <SmallBtn onClick={onLogout}>
            <LogOut size={13} />
            Sign out
          </SmallBtn>
        </Row>
      </div>
    </>
  );
};
