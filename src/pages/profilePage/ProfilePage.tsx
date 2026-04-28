import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, LogOut, Save, Shield, ShieldCheck, ShieldOff, User } from "lucide-react";
import { axiosInstance, useAuth } from "../../context/AuthContext";

interface UserProfile {
  id: string;
  firstname: string | null;
  lastname: string | null;
  email: string;
  role: "REGULAR" | "ADMIN";
  picture: string | null;
  method: string;
  createdAt: string;
  isTwoFactorEnabled: boolean;
}

export const ProfilePage = () => {
  const navigate = useNavigate();
  const { setAccessToken } = useAuth();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // Edit profile form
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Change password form
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Two-Factor Authentication
  const [twoFactorSetupMode, setTwoFactorSetupMode] = useState(false);
  const [twoFactorQrCode, setTwoFactorQrCode] = useState<string | null>(null);
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [twoFactorLoading, setTwoFactorLoading] = useState(false);
  const [twoFactorError, setTwoFactorError] = useState<string | null>(null);
  const [twoFactorSuccess, setTwoFactorSuccess] = useState<string | null>(null);

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
  }, []);

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
      const res = await axiosInstance.patch<UserProfile>("/user/me", {
        firstName,
        lastName,
      });
      setProfile(res.data);
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (err: any) {
      setProfileError(
        err?.response?.data?.message ?? "Failed to save changes"
      );
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
      await axiosInstance.patch("/user/me/password", {
        currentPassword,
        newPassword,
      });
      setPasswordSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (err: any) {
      setPasswordError(
        err?.response?.data?.message ?? "Failed to change password"
      );
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
    } catch (err: any) {
      setTwoFactorError(err?.response?.data?.message ?? "Failed to generate QR code");
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
      setProfile((prev) => prev ? { ...prev, isTwoFactorEnabled: true } : prev);
      setTwoFactorSetupMode(false);
      setTwoFactorQrCode(null);
      setTwoFactorCode("");
      setTwoFactorSuccess("2FA enabled! Your account is now protected.");
      setTimeout(() => setTwoFactorSuccess(null), 4000);
    } catch (err: any) {
      setTwoFactorError(err?.response?.data?.message ?? "Invalid code. Please try again.");
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
      setProfile((prev) => prev ? { ...prev, isTwoFactorEnabled: false } : prev);
      setTwoFactorCode("");
      setTwoFactorSetupMode(false);
      setTwoFactorSuccess("2FA has been disabled.");
      setTimeout(() => setTwoFactorSuccess(null), 4000);
    } catch (err: any) {
      setTwoFactorError(err?.response?.data?.message ?? "Invalid code. Please try again.");
    } finally {
      setTwoFactorLoading(false);
    }
  };

  const getInitials = () => {
    if (profile?.firstname && profile?.lastname) {
      return `${profile.firstname[0]}${profile.lastname[0]}`.toUpperCase();
    }
    if (profile?.firstname) return profile.firstname[0].toUpperCase();
    if (profile?.email) return profile.email[0].toUpperCase();
    return "?";
  };

  if (loadingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <p className="text-gray-500 dark:text-gray-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 px-4 py-8 sm:py-12">
      <div className="mx-auto w-full max-w-lg lg:max-w-4xl space-y-5">
        {/* Top bar */}
        <div className="flex items-center justify-between">
          <h1
            onClick={() => navigate("/")}
            className="cursor-pointer font-roboto font-medium text-xl sm:text-2xl dark:text-white"
          >
            workspacebridge
          </h1>
          <button
            onClick={handleLogout}
            className="cursor-pointer flex items-center gap-2 rounded-md bg-red-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-600"
          >
            <LogOut size={15} />
            Logout
          </button>
        </div>

        {/* Profile card — full width */}
        <div className="border border-slate-400 dark:border-gray-600 rounded-lg shadow-sm bg-white/60 dark:bg-gray-800/60 overflow-hidden">
          {/* Gradient banner */}
          <div className="h-24 bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400" />

          {/* Avatar + info */}
          <div className="px-5 sm:px-6 pb-5">
            <div className="flex items-end gap-4 -mt-8 mb-3">
              {profile?.picture ? (
                <img
                  src={profile.picture}
                  alt="avatar"
                  className="h-16 w-16 rounded-full object-cover ring-4 ring-white dark:ring-gray-800 shrink-0"
                />
              ) : (
                <div className="h-16 w-16 shrink-0 rounded-full bg-blue-500 flex items-center justify-center text-white text-2xl font-bold ring-4 ring-white dark:ring-gray-800">
                  {getInitials()}
                </div>
              )}
            </div>
            <p className="text-lg font-semibold text-gray-800 dark:text-gray-100">
              {profile?.firstname || profile?.lastname
                ? `${profile?.firstname ?? ""} ${profile?.lastname ?? ""}`.trim()
                : "No name set"}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{profile?.email}</p>
            <div className="flex items-center gap-2 mt-1.5">
              <span
                className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-medium tracking-wide ${
                  profile?.role === "ADMIN"
                    ? "border-red-400 text-red-600 dark:text-red-400"
                    : "border-gray-400 text-gray-600 dark:text-gray-400"
                }`}
              >
                {profile?.role}
              </span>
              <span className="text-xs text-gray-400 dark:text-gray-500">
                · Member since{" "}
                {profile?.createdAt
                  ? new Date(profile.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                  : "—"}
              </span>
            </div>
          </div>
        </div>

        {/* Edit Profile + Change Password — side by side on lg+ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start lg:items-stretch">

        {/* Edit Profile */}
        <form
          onSubmit={handleSaveProfile}
          className="border border-slate-400 dark:border-gray-600 rounded-lg px-5 sm:px-6 py-6 shadow-sm bg-white/60 dark:bg-gray-800/60"
        >
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 dark:text-white">
            <User size={18} className="text-blue-500" />
            Edit Profile
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                First Name
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Enter your first name"
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Last Name
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Enter your last name"
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400"
              />
            </div>
          </div>

          {profileError && (
            <p className="mt-3 text-sm text-red-500">{profileError}</p>
          )}
          {profileSuccess && (
            <p className="mt-3 text-sm text-green-600">Profile updated!</p>
          )}

          <button
            type="submit"
            disabled={profileSaving}
            className="cursor-pointer mt-5 flex items-center gap-2 bg-blue-500 text-white px-5 py-2 text-sm rounded-md hover:bg-blue-600 transition-colors font-medium disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <Save size={15} />
            {profileSaving ? "Saving..." : "Save Changes"}
          </button>
        </form>

        {/* Change Password (only for credentials users) */}
        {profile?.method === "CREDENTIALS" && (
          <form
            onSubmit={handleChangePassword}
            className="border border-slate-400 dark:border-gray-600 rounded-lg px-5 sm:px-6 py-6 shadow-sm bg-white/60 dark:bg-gray-800/60"
          >
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 dark:text-white">
              <Lock size={18} className="text-blue-500" />
              Change Password
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400"
                />
              </div>
            </div>

            {passwordError && (
              <p className="mt-3 text-sm text-red-500">{passwordError}</p>
            )}
            {passwordSuccess && (
              <p className="mt-3 text-sm text-green-600">Password changed!</p>
            )}

            <button
              type="submit"
              disabled={passwordSaving}
              className="cursor-pointer mt-5 flex items-center gap-2 bg-blue-500 text-white px-5 py-2 text-sm rounded-md hover:bg-blue-600 transition-colors font-medium disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Shield size={15} />
              {passwordSaving ? "Updating..." : "Update Password"}
            </button>
          </form>
        )}

        </div>{/* end Edit Profile + Change Password grid */}

        {/* Two-Factor Authentication — full width */}
        <div className="border border-slate-400 dark:border-gray-600 rounded-lg shadow-sm bg-white/60 dark:bg-gray-800/60">
          {/* Header */}
          <div className="flex items-center gap-3 px-5 sm:px-6 py-4">
            <div className="h-9 w-9 shrink-0 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
              <ShieldCheck size={18} className="text-emerald-600 dark:text-emerald-400" />
            </div>
            <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100">
              Two-factor authentication
            </h2>
          </div>
          <hr className="border-slate-200 dark:border-gray-700" />

          {/* Body */}
          <div className="px-5 sm:px-6 py-5">
            {twoFactorSuccess && (
              <p className="mb-4 text-sm text-green-600 dark:text-green-400">{twoFactorSuccess}</p>
            )}

            {/* 2FA is OFF — show enable flow */}
            {!profile?.isTwoFactorEnabled && (
              <>
                {!twoFactorSetupMode ? (
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Add an extra layer of security using an authenticator app.
                      </p>
                      <p className="mt-1.5 flex items-center gap-1.5 text-sm text-gray-400 dark:text-gray-500">
                        <span className="h-2 w-2 rounded-full bg-gray-400 dark:bg-gray-500 shrink-0" />
                        Disabled
                      </p>
                    </div>
                    <button
                      onClick={handleGenerateTwoFactor}
                      disabled={twoFactorLoading}
                      className="cursor-pointer shrink-0 border border-gray-400 dark:border-gray-500 text-gray-700 dark:text-gray-200 px-4 py-2 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors font-medium disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {twoFactorLoading ? "Loading..." : "Enable 2FA"}
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleEnableTwoFactor} className="space-y-4">
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Scan this QR code with your authenticator app, then enter the 6-digit code to confirm.
                    </p>
                    {twoFactorQrCode && (
                      <div className="flex justify-center">
                        <img
                          src={twoFactorQrCode}
                          alt="2FA QR Code"
                          className="w-44 h-44 rounded-lg border border-gray-200 dark:border-gray-600"
                        />
                      </div>
                    )}
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      value={twoFactorCode}
                      onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, ""))}
                      placeholder="Enter 6-digit code"
                      className="w-full text-center text-xl tracking-widest px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400"
                    />
                    {twoFactorError && (
                      <p className="text-sm text-red-500">{twoFactorError}</p>
                    )}
                    <div className="flex gap-3">
                      <button
                        type="submit"
                        disabled={twoFactorLoading || twoFactorCode.length !== 6}
                        className="cursor-pointer flex items-center gap-2 bg-blue-500 text-white px-5 py-2 text-sm rounded-md hover:bg-blue-600 transition-colors font-medium disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        <ShieldCheck size={15} />
                        {twoFactorLoading ? "Verifying..." : "Confirm & Enable"}
                      </button>
                      <button
                        type="button"
                        onClick={() => { setTwoFactorSetupMode(false); setTwoFactorQrCode(null); setTwoFactorCode(""); setTwoFactorError(null); }}
                        className="cursor-pointer px-4 py-2 text-sm text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </>
            )}

            {/* 2FA is ON — show disable flow */}
            {profile?.isTwoFactorEnabled && (
              <>
                {!twoFactorSetupMode ? (
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Add an extra layer of security using an authenticator app.
                      </p>
                      <p className="mt-1.5 flex items-center gap-1.5 text-sm text-green-600 dark:text-green-400">
                        <span className="h-2 w-2 rounded-full bg-green-500 dark:bg-green-400 shrink-0" />
                        Enabled
                      </p>
                    </div>
                    <button
                      onClick={() => { setTwoFactorSetupMode(true); setTwoFactorError(null); setTwoFactorCode(""); }}
                      className="cursor-pointer shrink-0 border border-gray-400 dark:border-gray-500 text-gray-700 dark:text-gray-200 px-4 py-2 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors font-medium"
                    >
                      Disable 2FA
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleDisableTwoFactor} className="space-y-4">
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Enter the 6-digit code from your authenticator app to disable 2FA.
                    </p>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      value={twoFactorCode}
                      onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, ""))}
                      placeholder="Enter 6-digit code"
                      className="w-full text-center text-xl tracking-widest px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400"
                      autoFocus
                    />
                    {twoFactorError && (
                      <p className="text-sm text-red-500">{twoFactorError}</p>
                    )}
                    <div className="flex gap-3">
                      <button
                        type="submit"
                        disabled={twoFactorLoading || twoFactorCode.length !== 6}
                        className="cursor-pointer flex items-center gap-2 bg-red-500 text-white px-5 py-2 text-sm rounded-md hover:bg-red-600 transition-colors font-medium disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        <ShieldOff size={15} />
                        {twoFactorLoading ? "Disabling..." : "Confirm Disable"}
                      </button>
                      <button
                        type="button"
                        onClick={() => { setTwoFactorSetupMode(false); setTwoFactorCode(""); setTwoFactorError(null); }}
                        className="cursor-pointer px-4 py-2 text-sm text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
