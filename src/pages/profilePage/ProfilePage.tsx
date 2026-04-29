import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Bell,
  CreditCard,
  Eye,
  EyeOff,
  Folder,
  LogOut,
  Lock,
  Moon,
  Plus,
  Search,
  Settings as SettingsIcon,
  ShieldCheck,
  Sun,
  Users,
} from "lucide-react";
import { axiosInstance, useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

interface UserProfile {
  id: string;
  firstname: string | null;
  lastname: string | null;
  email: string;
  role: "FREELANCER" | "CLIENT" | "ADMIN";
  picture: string | null;
  method: string;
  createdAt: string;
  isTwoFactorEnabled: boolean;
}

type Section = "profile" | "workspace" | "notifications" | "billing" | "security";

const WORKSPACES = [
  { id: "northwind", name: "Northwind Studio", sub: "Brand identity · Q3", mark: "N", color: "#5a8a6b" },
  { id: "klar", name: "Klar Health", sub: "Landing page redesign", mark: "K", color: "#7a9bbf" },
  { id: "fold", name: "Fold Coffee", sub: "Packaging system", mark: "F", color: "#b5803a" },
  { id: "atlas", name: "Atlas Logistics", sub: "Mobile app concepts", mark: "A", color: "#9a7ab8" },
  { id: "merit", name: "Merit & Co.", sub: "Annual report", mark: "M", color: "#5a8a6b" },
];

// ─── Building blocks ───────────────────────────────────────────────────────

const Row = ({
  title,
  desc,
  children,
}: {
  title: string;
  desc?: string;
  children: React.ReactNode;
}) => (
  <div className="flex items-start justify-between gap-6 py-5 border-b border-black/[0.06] dark:border-white/[0.05]">
    <div className="flex-1">
      <div className="text-[14px] font-medium text-[#1a201c] dark:text-[#e8ece9] mb-1">{title}</div>
      {desc && (
        <div className="text-[13px] text-[#5a625e] dark:text-[#a0a8a3] leading-[1.5] max-w-[380px]">{desc}</div>
      )}
    </div>
    <div className="flex items-center gap-2 shrink-0">{children}</div>
  </div>
);

const SectionHeader = ({ title, desc }: { title: string; desc?: string }) => (
  <div className="mb-2">
    <h2 className="text-[24px] font-semibold tracking-[-0.02em] mb-1.5 text-[#1a201c] dark:text-[#e8ece9]">{title}</h2>
    {desc && <p className="text-[14px] text-[#5a625e] dark:text-[#a0a8a3]">{desc}</p>}
  </div>
);

const Toggle = ({ on, onChange }: { on: boolean; onChange: () => void }) => (
  <button
    type="button"
    onClick={onChange}
    className={`w-8 h-[18px] rounded-full relative transition-colors shrink-0 ${
      on ? "bg-[#5a8a6b]" : "bg-black/[0.16] dark:bg-white/[0.14]"
    }`}
    aria-pressed={on}
  >
    <span
      className={`absolute top-0.5 left-0.5 w-[14px] h-[14px] rounded-full transition-transform ${
        on ? "translate-x-[14px] bg-white" : "bg-[#1a201c] dark:bg-[#e8ece9]"
      }`}
    />
  </button>
);

const SmallBtn = ({
  children,
  variant = "secondary",
  onClick,
  disabled,
  title,
  type = "button",
}: {
  children: React.ReactNode;
  variant?: "secondary" | "primary" | "outline" | "danger";
  onClick?: () => void;
  disabled?: boolean;
  title?: string;
  type?: "button" | "submit";
}) => {
  const base =
    "shrink-0 h-8 px-3 inline-flex items-center gap-1.5 rounded-lg text-[12px] font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
  const styles = {
    secondary:
      "border border-black/[0.08] dark:border-white/[0.07] bg-white dark:bg-[#1c221e] text-[#1a201c] dark:text-[#e8ece9] hover:bg-[#f6f6f1] dark:hover:bg-[#222b26]",
    primary: "bg-[#5a8a6b] hover:bg-[#4f7a5e] text-white",
    outline:
      "border border-black/[0.16] dark:border-white/[0.14] bg-transparent text-[#1a201c] dark:text-[#e8ece9] hover:bg-black/[0.05] dark:hover:bg-white/[0.05]",
    danger:
      "border border-black/[0.08] dark:border-white/[0.07] bg-transparent text-[#c25a4a] dark:text-[#e07b6b] hover:bg-[#c25a4a]/[0.08]",
  } as const;
  return (
    <button type={type} onClick={onClick} disabled={disabled} title={title} className={`${base} ${styles[variant]}`}>
      {children}
    </button>
  );
};

// ─── Page ──────────────────────────────────────────────────────────────────

export const ProfilePage = () => {
  const navigate = useNavigate();
  const { setAccessToken } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [section, setSection] = useState<Section>("profile");
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // Profile
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Password
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // 2FA
  const [twoFactorSetupMode, setTwoFactorSetupMode] = useState(false);
  const [twoFactorQrCode, setTwoFactorQrCode] = useState<string | null>(null);
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [twoFactorLoading, setTwoFactorLoading] = useState(false);
  const [twoFactorError, setTwoFactorError] = useState<string | null>(null);
  const [twoFactorSuccess, setTwoFactorSuccess] = useState<string | null>(null);

  // Notifications (visual stub)
  const [notifs, setNotifs] = useState({ msg: true, file: true, prop: true, weekly: false });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axiosInstance.get<UserProfile>("/user/me");
        setProfile(res.data);
        setFirstName(res.data.firstname ?? "");
        setLastName(res.data.lastname ?? "");
      } catch {
        navigate("/login");
      } finally {
        setLoadingProfile(false);
      }
    };
    fetchProfile();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await axiosInstance.post("/auth/logout");
    } catch {
      // ignore
    } finally {
      setAccessToken(null);
      navigate("/login");
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileError(null);
    setProfileSuccess(false);
    try {
      const res = await axiosInstance.patch<UserProfile>("/user/me", { firstName, lastName });
      setProfile(res.data);
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setProfileError(msg ?? "Failed to save changes");
    } finally {
      setProfileSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }
    setPasswordSaving(true);
    setPasswordError(null);
    setPasswordSuccess(false);
    try {
      await axiosInstance.patch("/user/me/password", { currentPassword, newPassword });
      setPasswordSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => {
        setPasswordSuccess(false);
        setShowPasswordForm(false);
      }, 1800);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setPasswordError(msg ?? "Failed to change password");
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleGenerateTwoFactor = async () => {
    setTwoFactorError(null);
    setTwoFactorLoading(true);
    try {
      const res = await axiosInstance.post<{ qrCodeDataURL: string }>("/auth/2fa/generate");
      setTwoFactorQrCode(res.data.qrCodeDataURL);
      setTwoFactorSetupMode(true);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setTwoFactorError(msg ?? "Failed to generate QR code");
    } finally {
      setTwoFactorLoading(false);
    }
  };

  const handleEnableTwoFactor = async (e: React.FormEvent) => {
    e.preventDefault();
    setTwoFactorError(null);
    setTwoFactorLoading(true);
    try {
      await axiosInstance.post("/auth/2fa/enable", { code: twoFactorCode });
      setProfile((prev) => (prev ? { ...prev, isTwoFactorEnabled: true } : prev));
      setTwoFactorSetupMode(false);
      setTwoFactorQrCode(null);
      setTwoFactorCode("");
      setTwoFactorSuccess("2FA enabled. Your account is now protected.");
      setTimeout(() => setTwoFactorSuccess(null), 4000);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setTwoFactorError(msg ?? "Invalid code. Please try again.");
    } finally {
      setTwoFactorLoading(false);
    }
  };

  const handleDisableTwoFactor = async (e: React.FormEvent) => {
    e.preventDefault();
    setTwoFactorError(null);
    setTwoFactorLoading(true);
    try {
      await axiosInstance.post("/auth/2fa/disable", { code: twoFactorCode });
      setProfile((prev) => (prev ? { ...prev, isTwoFactorEnabled: false } : prev));
      setTwoFactorCode("");
      setTwoFactorSetupMode(false);
      setTwoFactorSuccess("2FA has been disabled.");
      setTimeout(() => setTwoFactorSuccess(null), 4000);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setTwoFactorError(msg ?? "Invalid code. Please try again.");
    } finally {
      setTwoFactorLoading(false);
    }
  };

  const getInitials = () => {
    if (profile?.firstname && profile?.lastname) return `${profile.firstname[0]}${profile.lastname[0]}`.toUpperCase();
    if (profile?.firstname) return profile.firstname[0].toUpperCase();
    if (profile?.email) return profile.email[0].toUpperCase();
    return "?";
  };

  if (loadingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fafaf7] dark:bg-[#0e1310]">
        <p className="text-[#5a625e] dark:text-[#a0a8a3] text-sm">Loading…</p>
      </div>
    );
  }

  const sidebarSections: { id: Section; label: string; icon: React.ReactNode }[] = [
    { id: "profile", label: "Profile", icon: <Users size={14} /> },
    { id: "workspace", label: "Workspace", icon: <Folder size={14} /> },
    { id: "notifications", label: "Notifications", icon: <Bell size={14} /> },
    { id: "billing", label: "Billing", icon: <CreditCard size={14} /> },
    { id: "security", label: "Security", icon: <Lock size={14} /> },
  ];

  return (
    <div className="h-screen grid grid-cols-1 lg:grid-cols-[248px_1fr] bg-[#fafaf7] dark:bg-[#0e1310] overflow-hidden">
      {/* App-shell sidebar — workspaces */}
      <aside className="hidden lg:flex flex-col bg-[#f3f3ee] dark:bg-[#0a0f0c] border-r border-black/[0.06] dark:border-white/[0.05] overflow-hidden">
        {/* Logo + search trigger */}
        <div className="flex items-center justify-between px-4 pt-[18px] pb-3">
          <Link to="/" className="flex items-center gap-2 text-[14px] font-semibold tracking-[-0.02em] text-[#1a201c] dark:text-[#e8ece9]">
            <span className="w-[22px] h-[22px] rounded-[6px] bg-[#5a8a6b] text-white flex items-center justify-center">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </span>
            WorkspaceBridge
          </Link>
          <button className="w-7 h-7 flex items-center justify-center rounded-md text-[#858c87] dark:text-[#6e7672] hover:bg-black/[0.05] dark:hover:bg-white/[0.05] transition-colors" title="Search">
            <Search size={14} />
          </button>
        </div>

        {/* Search box */}
        <div className="px-3">
          <div className="flex items-center gap-2 px-2.5 py-2 bg-white dark:bg-[#151a17] border border-black/[0.08] dark:border-white/[0.07] rounded-lg text-[#858c87] dark:text-[#6e7672] text-[12px]">
            <Search size={13} />
            <span>Search workspaces</span>
            <span className="ml-auto font-mono text-[10px] text-[#b5bbb7] dark:text-[#4a514d]">⌘K</span>
          </div>
        </div>

        {/* Header row */}
        <div className="px-3 pt-2 pb-1 flex items-center justify-between">
          <div className="text-[11px] uppercase tracking-[0.08em] font-medium text-[#858c87] dark:text-[#6e7672]">Workspaces</div>
          <button className="text-[#5a625e] dark:text-[#a0a8a3] hover:text-[#1a201c] dark:hover:text-[#e8ece9]" title="New workspace">
            <Plus size={14} />
          </button>
        </div>

        {/* List */}
        <div className="px-2 flex-1 overflow-y-auto">
          {WORKSPACES.map((w) => (
            <div
              key={w.id}
              onClick={() => navigate(`/workspace/${w.id}`)}
              className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg cursor-pointer text-[13px] text-[#5a625e] dark:text-[#a0a8a3] hover:bg-black/[0.04] dark:hover:bg-white/[0.04] hover:text-[#1a201c] dark:hover:text-[#e8ece9] transition-colors"
            >
              <span className="w-[22px] h-[22px] rounded-md flex items-center justify-center text-[10px] font-semibold text-white shrink-0" style={{ background: w.color }}>
                {w.mark}
              </span>
              <span className="flex flex-col min-w-0 flex-1">
                <span className="font-medium truncate">{w.name}</span>
                <span className="text-[11px] text-[#858c87] dark:text-[#6e7672] truncate">{w.sub}</span>
              </span>
            </div>
          ))}
        </div>

        {/* Settings + user */}
        <div className="px-3 py-3 border-t border-black/[0.06] dark:border-white/[0.05]">
          <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg bg-[#5a8a6b]/10 text-[13px] text-[#1a201c] dark:text-[#e8ece9] mb-0.5">
            <span className="w-[22px] h-[22px] rounded-md flex items-center justify-center bg-[#f3f3ee] dark:bg-[#1c221e] text-[#5a625e] dark:text-[#a0a8a3] shrink-0">
              <SettingsIcon size={12} />
            </span>
            <span className="font-medium">Settings</span>
          </div>
          <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px]">
            <span className="w-[22px] h-[22px] rounded-full flex items-center justify-center bg-[#5a8a6b] text-white text-[10px] font-semibold shrink-0">
              {getInitials()}
            </span>
            <span className="flex flex-col min-w-0 flex-1">
              <span className="font-medium text-[#1a201c] dark:text-[#e8ece9] truncate">
                {profile?.firstname || profile?.lastname
                  ? `${profile?.firstname ?? ""} ${profile?.lastname ?? ""}`.trim()
                  : profile?.email}
              </span>
              <span className="text-[11px] text-[#858c87] dark:text-[#6e7672]">Free plan</span>
            </span>
            <button
              onClick={handleLogout}
              title="Sign out"
              className="shrink-0 w-[22px] h-[22px] flex items-center justify-center rounded-md text-[#858c87] dark:text-[#6e7672] hover:bg-black/[0.06] dark:hover:bg-white/[0.06] hover:text-[#c25a4a] dark:hover:text-[#e07b6b] transition-colors"
            >
              <LogOut size={13} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex flex-col overflow-hidden min-w-0">
        {/* Topbar */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-black/[0.06] dark:border-white/[0.05] bg-[#fafaf7] dark:bg-[#0e1310]">
          <div>
            <div className="text-[11px] uppercase tracking-[0.08em] font-medium text-[#858c87] dark:text-[#6e7672]">Account</div>
            <div className="text-[16px] font-semibold mt-0.5 text-[#1a201c] dark:text-[#e8ece9]">Settings</div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleTheme}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-black/[0.08] dark:border-white/[0.07] bg-white dark:bg-[#1c221e] text-[#5a625e] dark:text-[#a0a8a3] hover:bg-[#f6f6f1] dark:hover:bg-[#222b26] transition-colors"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
            </button>
            <button
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-black/[0.08] dark:border-white/[0.07] bg-white dark:bg-[#1c221e] text-[#5a625e] dark:text-[#a0a8a3] hover:bg-[#f6f6f1] dark:hover:bg-[#222b26] transition-colors"
              aria-label="Notifications"
            >
              <Bell size={14} />
            </button>
            <div className="w-8 h-8 rounded-full bg-[#5a8a6b] text-white flex items-center justify-center text-[12px] font-medium">
              {getInitials()}
            </div>
          </div>
        </header>

        {/* Settings layout: secondary nav + content */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-[220px_1fr] overflow-hidden min-h-0">
          <nav className="border-b lg:border-b-0 lg:border-r border-black/[0.06] dark:border-white/[0.05] p-3 lg:p-5 flex lg:flex-col gap-1 overflow-x-auto">
            {sidebarSections.map((s) => (
              <button
                key={s.id}
                onClick={() => setSection(s.id)}
                className={`flex items-center gap-2 px-3 h-9 rounded-lg text-[13px] font-medium text-left whitespace-nowrap transition-colors ${
                  section === s.id
                    ? "bg-[#5a8a6b]/10 text-[#1a201c] dark:text-[#e8ece9]"
                    : "text-[#5a625e] dark:text-[#a0a8a3] hover:bg-black/[0.04] dark:hover:bg-white/[0.04]"
                }`}
              >
                {s.icon}
                {s.label}
              </button>
            ))}
          </nav>

          <div className="overflow-y-auto p-8">
            <div className="max-w-[640px]">

              {section === "profile" && (
                <>
                  <SectionHeader title="Profile" desc="How you appear in workspaces." />
                  <div className="mt-6">
                    <Row title="Avatar" desc="A square image, at least 200×200.">
                      {profile?.picture ? (
                        <img src={profile.picture} alt="avatar" className="w-14 h-14 rounded-lg object-cover" />
                      ) : (
                        <div className="w-14 h-14 rounded-lg bg-[#5a8a6b] text-white flex items-center justify-center text-[18px] font-semibold">
                          {getInitials()}
                        </div>
                      )}
                      <SmallBtn disabled title="Coming soon">Change</SmallBtn>
                    </Row>

                    <form onSubmit={handleSaveProfile}>
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
                          value={profile?.email ?? ""}
                          readOnly
                          className="w-[240px] h-[42px] px-3.5 rounded-lg border border-black/[0.08] dark:border-white/[0.07] bg-[#f3f3ee] dark:bg-[#1c221e] text-[13px] text-[#5a625e] dark:text-[#a0a8a3] outline-none cursor-not-allowed"
                        />
                      </Row>
                      <Row title="Role" desc="Set by your account type.">
                        <span className="inline-flex items-center h-[26px] px-2.5 rounded-full bg-[#5a8a6b]/10 text-[#3e6a4d] dark:text-[#5a8a6b] border border-[#5a8a6b]/30 text-[12px] font-medium">
                          {profile?.role}
                        </span>
                      </Row>
                      <Row title="Member since">
                        <span className="text-[13px] text-[#5a625e] dark:text-[#a0a8a3] tabular-nums">
                          {profile?.createdAt
                            ? new Date(profile.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
                            : "—"}
                        </span>
                      </Row>

                      <div className="flex items-center gap-3 mt-6">
                        <button
                          type="submit"
                          disabled={profileSaving}
                          className="h-10 px-5 flex items-center gap-2 rounded-lg bg-[#5a8a6b] hover:bg-[#4f7a5e] active:bg-[#446b52] text-white text-[13px] font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          {profileSaving ? "Saving…" : "Save changes"}
                        </button>
                        {profileSuccess && <span className="text-[13px] text-[#4a8a5e] dark:text-[#6db383]">Saved.</span>}
                        {profileError && <span className="text-[13px] text-red-500">{profileError}</span>}
                      </div>
                    </form>
                  </div>
                </>
              )}

              {section === "workspace" && (
                <>
                  <SectionHeader title="Workspace" desc="Settings for your active workspace." />
                  <div className="mt-6">
                    <Row title="Workspace name">
                      <input
                        defaultValue="Northwind Studio"
                        className="w-[240px] h-[42px] px-3.5 rounded-lg border border-black/[0.08] dark:border-white/[0.07] bg-white dark:bg-[#151a17] text-[13px] text-[#1a201c] dark:text-[#e8ece9] outline-none hover:border-black/[0.14] dark:hover:border-white/[0.14] focus:border-[#5a8a6b] focus:ring-2 focus:ring-[#5a8a6b]/20 transition-all"
                      />
                    </Row>
                    <Row title="Description">
                      <input
                        defaultValue="Brand identity · Q3 2026"
                        className="w-[240px] h-[42px] px-3.5 rounded-lg border border-black/[0.08] dark:border-white/[0.07] bg-white dark:bg-[#151a17] text-[13px] text-[#1a201c] dark:text-[#e8ece9] outline-none hover:border-black/[0.14] dark:hover:border-white/[0.14] focus:border-[#5a8a6b] focus:ring-2 focus:ring-[#5a8a6b]/20 transition-all"
                      />
                    </Row>
                    <Row title="Members" desc="Invite collaborators or remove access.">
                      <SmallBtn disabled title="Coming soon"><Users size={13} /> Manage (2)</SmallBtn>
                    </Row>
                    <Row title="Archive workspace" desc="Read-only mode. You can restore anytime.">
                      <SmallBtn variant="outline" disabled title="Coming soon">Archive</SmallBtn>
                    </Row>
                    <Row title="Delete workspace" desc="Permanently removes all messages, files, and proposals.">
                      <SmallBtn variant="danger" disabled title="Coming soon">Delete</SmallBtn>
                    </Row>
                  </div>
                  <p className="mt-6 text-[12px] text-[#858c87] dark:text-[#6e7672]">
                    Workspaces aren't built into the backend yet — these controls are placeholders.
                  </p>
                </>
              )}

              {section === "notifications" && (
                <>
                  <SectionHeader title="Notifications" desc="What lands in your inbox." />
                  <div className="mt-6">
                    <Row title="New messages" desc="Email when a client posts a message.">
                      <Toggle on={notifs.msg} onChange={() => setNotifs({ ...notifs, msg: !notifs.msg })} />
                    </Row>
                    <Row title="File uploads & comments">
                      <Toggle on={notifs.file} onChange={() => setNotifs({ ...notifs, file: !notifs.file })} />
                    </Row>
                    <Row title="Proposal activity" desc="Signed, viewed, or commented.">
                      <Toggle on={notifs.prop} onChange={() => setNotifs({ ...notifs, prop: !notifs.prop })} />
                    </Row>
                    <Row title="Weekly digest" desc="A Friday summary of all workspaces.">
                      <Toggle on={notifs.weekly} onChange={() => setNotifs({ ...notifs, weekly: !notifs.weekly })} />
                    </Row>
                  </div>
                  <p className="mt-6 text-[12px] text-[#858c87] dark:text-[#6e7672]">
                    Notification preferences aren't persisted yet — coming with the messaging module.
                  </p>
                </>
              )}

              {section === "billing" && (
                <>
                  <SectionHeader title="Billing" desc="Plans, payment, and invoices." />
                  <div className="mt-6 rounded-xl border border-black/[0.08] dark:border-white/[0.07] bg-white dark:bg-[#151a17] p-6 flex items-center justify-between gap-6">
                    <div>
                      <div className="flex items-center gap-2.5 mb-1.5">
                        <span className="text-[14px] font-medium text-[#1a201c] dark:text-[#e8ece9]">Free plan</span>
                        <span className="inline-flex items-center h-[20px] px-2 rounded-full bg-[#f3f3ee] dark:bg-[#1c221e] border border-black/[0.08] dark:border-white/[0.07] text-[10px] font-medium text-[#5a625e] dark:text-[#a0a8a3]">Current</span>
                      </div>
                      <div className="text-[13px] text-[#5a625e] dark:text-[#a0a8a3]">Up to 3 workspaces · 5 GB storage</div>
                      <div className="mt-3.5 flex items-center gap-2.5">
                        <div className="w-[200px] h-1 rounded-full bg-black/[0.08] dark:bg-white/[0.07] overflow-hidden">
                          <div className="h-full bg-[#5a8a6b]" style={{ width: "55%" }} />
                        </div>
                        <span className="text-[12px] text-[#5a625e] dark:text-[#a0a8a3] tabular-nums">2.7 / 5 GB</span>
                      </div>
                    </div>
                    <SmallBtn variant="primary" disabled title="Coming soon">Upgrade to Pro</SmallBtn>
                  </div>
                  <p className="mt-6 text-[12px] text-[#858c87] dark:text-[#6e7672]">
                    Billing isn't connected yet — preview only.
                  </p>
                </>
              )}

              {section === "security" && (
                <>
                  <SectionHeader title="Security" desc="Keep your account safe." />
                  {twoFactorSuccess && (
                    <div className="mt-4 px-4 py-2.5 rounded-lg bg-[#5a8a6b]/10 border border-[#5a8a6b]/30 text-[13px] text-[#3e6a4d] dark:text-[#6db383]">
                      {twoFactorSuccess}
                    </div>
                  )}

                  <div className="mt-6">
                    {/* Password */}
                    {profile?.method === "CREDENTIALS" && (
                      <div className="border-b border-black/[0.06] dark:border-white/[0.05]">
                        <div className="flex items-start justify-between gap-6 py-5">
                          <div className="flex-1">
                            <div className="text-[14px] font-medium text-[#1a201c] dark:text-[#e8ece9] mb-1">Password</div>
                            <div className="text-[13px] text-[#5a625e] dark:text-[#a0a8a3] leading-[1.5] max-w-[380px]">
                              Use a strong password — at least 8 characters with letters, numbers, and a symbol.
                            </div>
                          </div>
                          <SmallBtn
                            onClick={() => {
                              setShowPasswordForm((v) => !v);
                              setPasswordError(null);
                              setPasswordSuccess(false);
                            }}
                          >
                            {showPasswordForm ? "Cancel" : "Change password"}
                          </SmallBtn>
                        </div>
                        {showPasswordForm && (
                          <form onSubmit={handleChangePassword} className="pb-5 space-y-3 max-w-[380px]">
                            <div className="relative">
                              <input
                                type={showCurrent ? "text" : "password"}
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                placeholder="Current password"
                                className="w-full h-[42px] pl-3.5 pr-10 rounded-lg border border-black/[0.08] dark:border-white/[0.07] bg-white dark:bg-[#151a17] text-[13px] text-[#1a201c] dark:text-[#e8ece9] placeholder-[#4a514d] outline-none hover:border-black/[0.14] dark:hover:border-white/[0.14] focus:border-[#5a8a6b] focus:ring-2 focus:ring-[#5a8a6b]/20 transition-all"
                              />
                              <button
                                type="button"
                                onClick={() => setShowCurrent((v) => !v)}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#858c87] dark:text-[#6e7672]"
                              >
                                {showCurrent ? <EyeOff size={15} /> : <Eye size={15} />}
                              </button>
                            </div>
                            <div className="relative">
                              <input
                                type={showNew ? "text" : "password"}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="New password"
                                className="w-full h-[42px] pl-3.5 pr-10 rounded-lg border border-black/[0.08] dark:border-white/[0.07] bg-white dark:bg-[#151a17] text-[13px] text-[#1a201c] dark:text-[#e8ece9] placeholder-[#4a514d] outline-none hover:border-black/[0.14] dark:hover:border-white/[0.14] focus:border-[#5a8a6b] focus:ring-2 focus:ring-[#5a8a6b]/20 transition-all"
                              />
                              <button
                                type="button"
                                onClick={() => setShowNew((v) => !v)}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#858c87] dark:text-[#6e7672]"
                              >
                                {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
                              </button>
                            </div>
                            <input
                              type="password"
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              placeholder="Confirm new password"
                              className="w-full h-[42px] px-3.5 rounded-lg border border-black/[0.08] dark:border-white/[0.07] bg-white dark:bg-[#151a17] text-[13px] text-[#1a201c] dark:text-[#e8ece9] placeholder-[#4a514d] outline-none hover:border-black/[0.14] dark:hover:border-white/[0.14] focus:border-[#5a8a6b] focus:ring-2 focus:ring-[#5a8a6b]/20 transition-all"
                            />
                            {passwordError && <p className="text-[12px] text-red-500">{passwordError}</p>}
                            {passwordSuccess && <p className="text-[12px] text-[#4a8a5e] dark:text-[#6db383]">Password changed.</p>}
                            <button
                              type="submit"
                              disabled={passwordSaving}
                              className="h-10 px-5 flex items-center gap-2 rounded-lg bg-[#5a8a6b] hover:bg-[#4f7a5e] text-white text-[13px] font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                              {passwordSaving ? "Updating…" : "Update password"}
                            </button>
                          </form>
                        )}
                      </div>
                    )}

                    {/* 2FA */}
                    <div className="border-b border-black/[0.06] dark:border-white/[0.05]">
                      <div className="flex items-start justify-between gap-6 py-5">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[14px] font-medium text-[#1a201c] dark:text-[#e8ece9]">Two-factor authentication</span>
                            {profile?.isTwoFactorEnabled ? (
                              <span className="inline-flex items-center gap-1.5 h-[20px] px-2 rounded-full bg-[#5a8a6b]/10 border border-[#5a8a6b]/30 text-[10px] font-medium text-[#3e6a4d] dark:text-[#6db383]">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#4a8a5e] dark:bg-[#6db383]" />
                                Enabled
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 h-[20px] px-2 rounded-full bg-[#f3f3ee] dark:bg-[#1c221e] border border-black/[0.08] dark:border-white/[0.07] text-[10px] font-medium text-[#5a625e] dark:text-[#a0a8a3]">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#858c87] dark:bg-[#6e7672]" />
                                Disabled
                              </span>
                            )}
                          </div>
                          <div className="text-[13px] text-[#5a625e] dark:text-[#a0a8a3] leading-[1.5] max-w-[380px]">
                            Add a second step at sign-in using an authenticator app like Google Authenticator or Authy.
                          </div>
                        </div>
                        {!twoFactorSetupMode && (
                          profile?.isTwoFactorEnabled ? (
                            <SmallBtn
                              variant="danger"
                              onClick={() => {
                                setTwoFactorSetupMode(true);
                                setTwoFactorError(null);
                                setTwoFactorCode("");
                              }}
                            >
                              Disable 2FA
                            </SmallBtn>
                          ) : (
                            <SmallBtn variant="primary" onClick={handleGenerateTwoFactor} disabled={twoFactorLoading}>
                              <ShieldCheck size={13} />
                              {twoFactorLoading ? "Loading…" : "Enable 2FA"}
                            </SmallBtn>
                          )
                        )}
                      </div>

                      {twoFactorSetupMode && !profile?.isTwoFactorEnabled && (
                        <form onSubmit={handleEnableTwoFactor} className="pb-5 space-y-4 max-w-[380px]">
                          <p className="text-[13px] text-[#5a625e] dark:text-[#a0a8a3]">
                            Scan this QR code with your authenticator app, then enter the 6-digit code to confirm.
                          </p>
                          {twoFactorQrCode && (
                            <div className="flex justify-center py-2">
                              <img src={twoFactorQrCode} alt="2FA QR code" className="w-44 h-44 rounded-lg border border-black/[0.08] dark:border-white/[0.07] bg-white p-2" />
                            </div>
                          )}
                          <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            maxLength={6}
                            value={twoFactorCode}
                            onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, ""))}
                            placeholder="000000"
                            className="w-full h-[44px] px-3.5 rounded-lg border border-black/[0.08] dark:border-white/[0.07] bg-white dark:bg-[#151a17] text-center text-[18px] tracking-[0.4em] font-mono text-[#1a201c] dark:text-[#e8ece9] outline-none focus:border-[#5a8a6b] focus:ring-2 focus:ring-[#5a8a6b]/20 transition-all"
                          />
                          {twoFactorError && <p className="text-[12px] text-red-500">{twoFactorError}</p>}
                          <div className="flex gap-2">
                            <button
                              type="submit"
                              disabled={twoFactorLoading || twoFactorCode.length !== 6}
                              className="h-10 px-5 flex items-center gap-2 rounded-lg bg-[#5a8a6b] hover:bg-[#4f7a5e] text-white text-[13px] font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                              <ShieldCheck size={14} />
                              {twoFactorLoading ? "Verifying…" : "Confirm & enable"}
                            </button>
                            <SmallBtn
                              onClick={() => {
                                setTwoFactorSetupMode(false);
                                setTwoFactorQrCode(null);
                                setTwoFactorCode("");
                                setTwoFactorError(null);
                              }}
                            >
                              Cancel
                            </SmallBtn>
                          </div>
                        </form>
                      )}

                      {twoFactorSetupMode && profile?.isTwoFactorEnabled && (
                        <form onSubmit={handleDisableTwoFactor} className="pb-5 space-y-4 max-w-[380px]">
                          <p className="text-[13px] text-[#5a625e] dark:text-[#a0a8a3]">
                            Enter the 6-digit code from your authenticator app to disable 2FA.
                          </p>
                          <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            maxLength={6}
                            value={twoFactorCode}
                            onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, ""))}
                            placeholder="000000"
                            autoFocus
                            className="w-full h-[44px] px-3.5 rounded-lg border border-black/[0.08] dark:border-white/[0.07] bg-white dark:bg-[#151a17] text-center text-[18px] tracking-[0.4em] font-mono text-[#1a201c] dark:text-[#e8ece9] outline-none focus:border-[#c25a4a] focus:ring-2 focus:ring-[#c25a4a]/20 transition-all"
                          />
                          {twoFactorError && <p className="text-[12px] text-red-500">{twoFactorError}</p>}
                          <div className="flex gap-2">
                            <button
                              type="submit"
                              disabled={twoFactorLoading || twoFactorCode.length !== 6}
                              className="h-10 px-5 flex items-center gap-2 rounded-lg bg-[#c25a4a] hover:bg-[#a84d3f] text-white text-[13px] font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                              {twoFactorLoading ? "Disabling…" : "Confirm disable"}
                            </button>
                            <SmallBtn
                              onClick={() => {
                                setTwoFactorSetupMode(false);
                                setTwoFactorCode("");
                                setTwoFactorError(null);
                              }}
                            >
                              Cancel
                            </SmallBtn>
                          </div>
                        </form>
                      )}
                    </div>

                    <Row title="Active sessions" desc="Manage devices currently signed in.">
                      <SmallBtn disabled title="Coming soon">Manage</SmallBtn>
                    </Row>

                    <Row title="Sign out" desc="End your current session on this device.">
                      <SmallBtn onClick={handleLogout}>
                        <LogOut size={13} />
                        Sign out
                      </SmallBtn>
                    </Row>

                    <Row title="Sign out everywhere" desc="Log out of all sessions on all devices.">
                      <SmallBtn variant="danger" disabled title="Coming soon">Sign out all</SmallBtn>
                    </Row>
                  </div>
                </>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
