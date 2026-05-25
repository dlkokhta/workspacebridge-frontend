import type { UserProfile } from "../../../hooks/useCurrentUser";

export const getInitials = (profile: UserProfile | null): string => {
  if (!profile) return "?";
  if (profile.firstname && profile.lastname) {
    return `${profile.firstname[0]}${profile.lastname[0]}`.toUpperCase();
  }
  if (profile.firstname) return profile.firstname[0].toUpperCase();
  if (profile.email) return profile.email[0].toUpperCase();
  return "?";
};
