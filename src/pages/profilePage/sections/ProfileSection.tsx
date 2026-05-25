import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../../../context/AuthContext";
import {
  currentUserKey,
  type UserProfile,
} from "../../../hooks/useCurrentUser";
import { Row } from "../components/Row";
import { SectionHeader } from "../components/SectionHeader";
import { SmallBtn } from "../components/SmallBtn";
import { getInitials } from "../../../utils/getInitials";

interface ProfileSectionProps {
  profile: UserProfile;
}

const extractApiMessage = (err: unknown): string | null =>
  (err as { response?: { data?: { message?: string } } })?.response?.data
    ?.message ?? null;

export const ProfileSection = ({ profile }: ProfileSectionProps) => {
  const queryClient = useQueryClient();
  const [firstName, setFirstName] = useState(profile.firstname ?? "");
  const [lastName, setLastName] = useState(profile.lastname ?? "");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Re-sync form fields if the profile is refreshed from the server.
  useEffect(() => {
    setFirstName(profile.firstname ?? "");
    setLastName(profile.lastname ?? "");
  }, [profile.firstname, profile.lastname]);

  const saveMutation = useMutation({
    mutationFn: async (vars: { firstName: string; lastName: string }) => {
      const { data } = await axiosInstance.patch<UserProfile>("/user/me", vars);
      return data;
    },
    onSuccess: (updated) => {
      queryClient.setQueryData<UserProfile>(currentUserKey, updated);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    try {
      await saveMutation.mutateAsync({ firstName, lastName });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: unknown) {
      setError(extractApiMessage(err) ?? "Failed to save changes");
    }
  };

  const saving = saveMutation.isPending;

  return (
    <>
      <SectionHeader title="Profile" desc="How you appear in workspaces." />
      <div className="mt-6">
        <Row title="Avatar" desc="A square image, at least 200×200.">
          {profile.picture ? (
            <img
              src={profile.picture}
              alt="avatar"
              className="w-14 h-14 rounded-lg object-cover"
            />
          ) : (
            <div className="w-14 h-14 rounded-lg bg-[#5a8a6b] text-white flex items-center justify-center text-[18px] font-semibold">
              {getInitials(profile)}
            </div>
          )}
          <SmallBtn disabled title="Coming soon">
            Change
          </SmallBtn>
        </Row>

        <form onSubmit={handleSubmit}>
          <Row title="First name" desc="Shown to clients in messages.">
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-[240px] h-[42px] px-3.5 rounded-lg border border-black/[0.08] dark:border-white/[0.07] bg-white dark:bg-[#151a17] text-[13px] text-[#1a201c] dark:text-[#e8ece9] outline-none hover:border-black/[0.14] dark:hover:border-white/[0.14] focus:border-[#5a8a6b] focus:ring-2 focus:ring-[#5a8a6b]/20 transition-all"
            />
          </Row>
          <Row title="Last name">
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-[240px] h-[42px] px-3.5 rounded-lg border border-black/[0.08] dark:border-white/[0.07] bg-white dark:bg-[#151a17] text-[13px] text-[#1a201c] dark:text-[#e8ece9] outline-none hover:border-black/[0.14] dark:hover:border-white/[0.14] focus:border-[#5a8a6b] focus:ring-2 focus:ring-[#5a8a6b]/20 transition-all"
            />
          </Row>
          <Row title="Email" desc="Used for sign-in and notifications.">
            <input
              type="email"
              value={profile.email}
              readOnly
              className="w-[240px] h-[42px] px-3.5 rounded-lg border border-black/[0.08] dark:border-white/[0.07] bg-[#f3f3ee] dark:bg-[#1c221e] text-[13px] text-[#5a625e] dark:text-[#a0a8a3] outline-none cursor-not-allowed"
            />
          </Row>
          <Row title="Role" desc="Set by your account type.">
            <span className="inline-flex items-center h-[26px] px-2.5 rounded-full bg-[#5a8a6b]/10 text-[#3e6a4d] dark:text-[#5a8a6b] border border-[#5a8a6b]/30 text-[12px] font-medium">
              {profile.role}
            </span>
          </Row>
          <Row title="Member since">
            <span className="text-[13px] text-[#5a625e] dark:text-[#a0a8a3] tabular-nums">
              {new Date(profile.createdAt).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </Row>

          <div className="flex items-center gap-3 mt-6">
            <button
              type="submit"
              disabled={saving}
              className="h-10 px-5 flex items-center gap-2 rounded-lg bg-[#5a8a6b] hover:bg-[#4f7a5e] active:bg-[#446b52] text-white text-[13px] font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {saving ? "Saving…" : "Save changes"}
            </button>
            {success && (
              <span className="text-[13px] text-[#4a8a5e] dark:text-[#6db383]">
                Saved.
              </span>
            )}
            {error && <span className="text-[13px] text-red-500">{error}</span>}
          </div>
        </form>
      </div>
    </>
  );
};
