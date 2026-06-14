import {
  AlertTriangle,
  Download,
  KeyRound,
  Link2,
  Lock,
  LogIn,
  Mail,
  ShieldCheck,
  Smartphone,
  Trash2,
  Unlink,
  UserPlus,
  type LucideIcon,
} from "lucide-react";

const TONE = {
  positive: "text-[#3e6a4d] dark:text-[#6db383]",
  danger: "text-[#c25a4a] dark:text-[#e07b6b]",
  muted: "text-[#5a625e] dark:text-[#a0a8a3]",
} as const;

interface ActivityMeta {
  label: string;
  Icon: LucideIcon;
  tone: string;
}

// Human-readable label, icon and tone for each audited auth.* action.
const MAP: Record<string, ActivityMeta> = {
  "auth.login": { label: "Signed in", Icon: LogIn, tone: TONE.positive },
  "auth.login_failed": {
    label: "Failed sign-in attempt",
    Icon: AlertTriangle,
    tone: TONE.danger,
  },
  "auth.account_locked": {
    label: "Account locked after failed attempts",
    Icon: Lock,
    tone: TONE.danger,
  },
  "auth.new_device_login": {
    label: "Sign-in from a new device",
    Icon: Smartphone,
    tone: TONE.danger,
  },
  "auth.register": {
    label: "Account created",
    Icon: UserPlus,
    tone: TONE.positive,
  },
  "auth.google_register": {
    label: "Account created with Google",
    Icon: UserPlus,
    tone: TONE.positive,
  },
  "auth.register_duplicate": {
    label: "Sign-up attempt with an existing email",
    Icon: AlertTriangle,
    tone: TONE.danger,
  },
  "auth.verification_resent": {
    label: "Verification email resent",
    Icon: Mail,
    tone: TONE.muted,
  },
  "auth.email_change_requested": {
    label: "Email change requested",
    Icon: Mail,
    tone: TONE.muted,
  },
  "auth.email_changed": {
    label: "Email address changed",
    Icon: Mail,
    tone: TONE.positive,
  },
  "auth.password_set": {
    label: "Password set",
    Icon: KeyRound,
    tone: TONE.positive,
  },
  "auth.account_linked": {
    label: "Sign-in method linked",
    Icon: Link2,
    tone: TONE.positive,
  },
  "auth.provider_disconnected": {
    label: "Sign-in method disconnected",
    Icon: Unlink,
    tone: TONE.danger,
  },
  "auth.passkey_registered": {
    label: "Passkey added",
    Icon: KeyRound,
    tone: TONE.positive,
  },
  "auth.passkey_removed": {
    label: "Passkey removed",
    Icon: KeyRound,
    tone: TONE.danger,
  },
  "auth.backup_codes_regenerated": {
    label: "Backup codes regenerated",
    Icon: ShieldCheck,
    tone: TONE.positive,
  },
  "auth.backup_code_used": {
    label: "Backup code used to sign in",
    Icon: ShieldCheck,
    tone: TONE.danger,
  },
  "auth.data_exported": {
    label: "Data export downloaded",
    Icon: Download,
    tone: TONE.muted,
  },
  "auth.account_deleted": {
    label: "Account deleted",
    Icon: Trash2,
    tone: TONE.danger,
  },
};

export const activityMeta = (action: string): ActivityMeta =>
  MAP[action] ?? {
    label: action.replace(/^auth\./, "").replace(/_/g, " "),
    Icon: ShieldCheck,
    tone: TONE.muted,
  };
