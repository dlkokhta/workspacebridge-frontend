import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { RegistrationSuccess } from "../../components/RegistrationSuccess.js";
import { registrationSchema } from "../../schemas/index.js";
import type { registrationTypes } from "../../types/registrationTypes.js";
import { useTheme } from "../../context/ThemeContext";
import { ArrowRight, Eye, EyeOff, Sun, Moon } from "lucide-react";

const GoogleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const GithubIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
  </svg>
);

const passwordScore = (pw: string) => {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score;
};

const AppSidePreview = () => (
  <div className="max-w-[460px] w-full">
    <div className="rounded-xl border border-black/[0.08] dark:border-white/[0.07] bg-white dark:bg-[#151a17] overflow-hidden mb-6">
      <div className="flex items-center gap-2 px-3.5 py-2.5 bg-[#f3f3ee] dark:bg-[#1c221e] border-b border-black/[0.06] dark:border-white/[0.05]">
        <div className="flex gap-1.5">
          <span className="w-[11px] h-[11px] rounded-full bg-black/[0.14] dark:bg-white/[0.14]" />
          <span className="w-[11px] h-[11px] rounded-full bg-black/[0.14] dark:bg-white/[0.14]" />
          <span className="w-[11px] h-[11px] rounded-full bg-black/[0.14] dark:bg-white/[0.14]" />
        </div>
        <div className="flex-1 h-6 bg-[#0e1310]/[0.06] dark:bg-white/[0.06] rounded-md flex items-center justify-center font-mono text-[11px] text-[#858c87] dark:text-[#6e7672]">
          workspacebridge.app/w/kodex-labs
        </div>
        <div className="w-[30px]" />
      </div>
      <div className="p-5 bg-[#fafaf7] dark:bg-[#151a17]">
        <div className="flex items-center gap-2.5 mb-4">
          <span className="w-7 h-7 rounded-lg bg-[#5a8a6b] text-white flex items-center justify-center font-semibold text-[11px] shrink-0">
            K
          </span>
          <div>
            <div className="text-[14px] font-semibold text-[#1a201c] dark:text-[#e8ece9]">Kodex Labs</div>
            <div className="text-[11px] text-[#858c87] dark:text-[#6e7672]">Web app · Q3</div>
          </div>
          <div className="ml-auto flex items-center gap-1.5 h-[22px] px-2.5 rounded-full bg-[#f3f3ee] dark:bg-[#1c221e] border border-black/[0.08] dark:border-white/[0.07] text-[10px] font-medium text-[#5a625e] dark:text-[#a0a8a3]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#4a8a5e] dark:bg-[#6db383]" />
            2 online
          </div>
        </div>
        <div className="flex flex-col gap-2.5">
          <div className="flex gap-2">
            <div className="w-6 h-6 rounded-full bg-[#7a9bbf] text-white flex items-center justify-center text-[10px] font-medium shrink-0">
              JD
            </div>
            <div className="bg-[#f3f3ee] dark:bg-[#1c221e] px-3 py-2 rounded-xl rounded-tl-[4px] text-[12px] leading-[1.45] text-[#1a201c] dark:text-[#e8ece9] max-w-[280px]">
              The dashboard flow looks clean — ship it.
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <div className="bg-[#5a8a6b] text-white px-3 py-2 rounded-xl rounded-tr-[4px] text-[12px] leading-[1.45] max-w-[280px]">
              Deploying to staging now, link drops in Files.
            </div>
          </div>
        </div>
      </div>
    </div>

    <blockquote className="m-0 p-0 text-[17px] leading-[1.5] tracking-[-0.01em] text-[#1a201c] dark:text-[#e8ece9]" style={{ textWrap: "pretty" } as React.CSSProperties}>
      "I onboarded a new client in under a minute. They opened the link, saw the workspace, and we were already chatting."
    </blockquote>
    <div className="mt-4 text-[13px] text-[#5a625e] dark:text-[#a0a8a3]">
      <span className="font-medium text-[#1a201c] dark:text-[#e8ece9]">Devon</span> · Full-stack developer · 8 active clients
    </div>
  </div>
);

export const RegistrationPage = () => {
  const [responseError, setResponseError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [responseMessage, setResponseMessage] = useState<string>("");
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeat, setShowRepeat] = useState(false);
  const [agree, setAgree] = useState(true);
  const [pw, setPw] = useState("");
  const { theme, toggleTheme } = useTheme();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({ resolver: yupResolver(registrationSchema) });

  const navigate = useNavigate();
  const url = import.meta.env.VITE_API_URL;

  const onSubmit = async (data: registrationTypes) => {
    try {
      setResponseError(null);
      await axios.post(`${url}/auth/signup`, {
        firstname: data.firstName,
        lastname: data.lastName,
        email: data.email,
        password: data.password,
        passwordRepeat: data.repeatPassword,
      });
      setResponseMessage("Registration successful!");
      reset();
    } catch (error: unknown) {
      const message = (error as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message;
      if (Array.isArray(message)) setResponseError(message[0]);
      else if (typeof message === "string") setResponseError(message);
      else setResponseError("Registration failed. Please try again.");
    }
  };

  useEffect(() => {
    if (showModal) navigate("/login");
  }, [showModal, navigate]);

  const handleGoogle = () => {
    window.location.href = `${url}/auth/google`;
  };

  const score = passwordScore(pw);
  const labels = ["Too weak", "Weak", "Fair", "Good", "Strong"];

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-[#fafaf7] dark:bg-[#0e1310]">
      {/* Left — form */}
      <div className="flex flex-col px-8 py-8 md:px-12 overflow-auto">
        {responseMessage && !showModal && (
          <RegistrationSuccess
            message="Registration successful! Please check your email to verify your account."
            onClose={() => setShowModal(true)}
          />
        )}

        <div className="flex items-center justify-between mb-12">
          <Link
            to="/"
            className="flex items-center gap-2 text-[15px] font-semibold tracking-[-0.02em] text-[#1a201c] dark:text-[#e8ece9]"
          >
            <span className="w-[26px] h-[26px] rounded-[7px] bg-[#5a8a6b] text-white flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </span>
            WorkspaceBridge
          </Link>
          <button
            type="button"
            onClick={toggleTheme}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-[#858c87] dark:text-[#6e7672] hover:bg-black/[0.05] dark:hover:bg-white/[0.05] transition-colors cursor-pointer"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
          </button>
        </div>

        <div className="flex-1 flex flex-col justify-center max-w-[380px] w-full mx-auto py-4">
          <h1 className="text-[32px] font-semibold tracking-[-0.025em] leading-tight mb-2 text-[#1a201c] dark:text-[#e8ece9]">
            Create your account
          </h1>
          <p className="text-[#5a625e] dark:text-[#a0a8a3] mb-8">
            Free forever. No credit card needed.
          </p>

          <div className="flex flex-col gap-2 mb-6">
            <button
              type="button"
              onClick={handleGoogle}
              className="flex items-center justify-center gap-2 h-[42px] px-4 rounded-lg border border-black/[0.08] dark:border-white/[0.07] bg-white dark:bg-[#1c221e] text-[13px] font-medium text-[#1a201c] dark:text-[#e8ece9] hover:bg-[#f6f6f1] dark:hover:bg-[#222b26] hover:border-black/[0.14] dark:hover:border-white/[0.14] transition-colors cursor-pointer"
            >
              <GoogleIcon />
              Sign up with Google
            </button>
            <button
              type="button"
              disabled
              className="flex items-center justify-center gap-2 h-[42px] px-4 rounded-lg border border-black/[0.08] dark:border-white/[0.07] bg-white dark:bg-[#1c221e] text-[13px] font-medium text-[#1a201c] dark:text-[#e8ece9] opacity-40 cursor-not-allowed"
              title="Coming soon"
            >
              <GithubIcon />
              Sign up with GitHub
            </button>
          </div>

          <div className="flex items-center gap-3 mb-6 text-[#858c87] dark:text-[#6e7672] text-[12px] uppercase tracking-[0.08em]">
            <div className="flex-1 h-px bg-black/[0.06] dark:bg-white/[0.05]" />
            Or use your email
            <div className="flex-1 h-px bg-black/[0.06] dark:bg-white/[0.05]" />
          </div>

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            {/* First + Last */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="block text-[12px] font-medium text-[#5a625e] dark:text-[#a0a8a3] mb-1.5 tracking-[0.01em]">
                  First name
                </label>
                <input
                  {...register("firstName")}
                  placeholder="Devon"
                  className={`w-full h-[42px] px-3.5 rounded-lg border bg-white dark:bg-[#151a17] text-[13px] text-[#1a201c] dark:text-[#e8ece9] placeholder-[#4a514d] dark:placeholder-[#4a514d] outline-none transition-all
                    ${errors.firstName
                      ? "border-red-400 dark:border-red-500 focus:ring-2 focus:ring-red-400/20"
                      : "border-black/[0.08] dark:border-white/[0.07] hover:border-black/[0.14] dark:hover:border-white/[0.14] focus:border-[#5a8a6b] focus:ring-2 focus:ring-[#5a8a6b]/20"
                    }`}
                />
                {errors.firstName && (
                  <p className="mt-1.5 text-[12px] text-red-500">{errors.firstName.message}</p>
                )}
              </div>
              <div>
                <label className="block text-[12px] font-medium text-[#5a625e] dark:text-[#a0a8a3] mb-1.5 tracking-[0.01em]">
                  Last name
                </label>
                <input
                  {...register("lastName")}
                  placeholder="Park"
                  className={`w-full h-[42px] px-3.5 rounded-lg border bg-white dark:bg-[#151a17] text-[13px] text-[#1a201c] dark:text-[#e8ece9] placeholder-[#4a514d] dark:placeholder-[#4a514d] outline-none transition-all
                    ${errors.lastName
                      ? "border-red-400 dark:border-red-500 focus:ring-2 focus:ring-red-400/20"
                      : "border-black/[0.08] dark:border-white/[0.07] hover:border-black/[0.14] dark:hover:border-white/[0.14] focus:border-[#5a8a6b] focus:ring-2 focus:ring-[#5a8a6b]/20"
                    }`}
                />
                {errors.lastName && (
                  <p className="mt-1.5 text-[12px] text-red-500">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            {/* Email */}
            <div className="mb-4">
              <label className="block text-[12px] font-medium text-[#5a625e] dark:text-[#a0a8a3] mb-1.5 tracking-[0.01em]">
                Work email
              </label>
              <input
                {...register("email")}
                type="email"
                placeholder="you@studio.com"
                className={`w-full h-[42px] px-3.5 rounded-lg border bg-white dark:bg-[#151a17] text-[13px] text-[#1a201c] dark:text-[#e8ece9] placeholder-[#4a514d] dark:placeholder-[#4a514d] outline-none transition-all
                  ${errors.email
                    ? "border-red-400 dark:border-red-500 focus:ring-2 focus:ring-red-400/20"
                    : "border-black/[0.08] dark:border-white/[0.07] hover:border-black/[0.14] dark:hover:border-white/[0.14] focus:border-[#5a8a6b] focus:ring-2 focus:ring-[#5a8a6b]/20"
                  }`}
              />
              {errors.email && (
                <p className="mt-1.5 text-[12px] text-red-500">{errors.email.message}</p>
              )}
              {!errors.email && responseError && (
                <p className="mt-1.5 text-[12px] text-red-500">{responseError}</p>
              )}
            </div>

            {/* Password */}
            <div className="mb-4">
              <label className="block text-[12px] font-medium text-[#5a625e] dark:text-[#a0a8a3] mb-1.5 tracking-[0.01em]">
                Password
              </label>
              <div className="relative">
                <input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  placeholder="At least 8 characters"
                  value={pw}
                  onChange={(e) => setPw(e.target.value)}
                  className={`w-full h-[42px] pl-3.5 pr-10 rounded-lg border bg-white dark:bg-[#151a17] text-[13px] text-[#1a201c] dark:text-[#e8ece9] placeholder-[#4a514d] dark:placeholder-[#4a514d] outline-none transition-all
                    ${errors.password
                      ? "border-red-400 dark:border-red-500 focus:ring-2 focus:ring-red-400/20"
                      : "border-black/[0.08] dark:border-white/[0.07] hover:border-black/[0.14] dark:hover:border-white/[0.14] focus:border-[#5a8a6b] focus:ring-2 focus:ring-[#5a8a6b]/20"
                    }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#858c87] dark:text-[#6e7672] hover:text-[#5a625e] dark:hover:text-[#a0a8a3] transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {pw && (
                <div className="mt-2.5">
                  <div className="flex gap-1 mb-1.5">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="flex-1 h-[3px] rounded-full"
                        style={{
                          background:
                            i <= score
                              ? score < 2
                                ? "#c25a4a"
                                : score < 3
                                  ? "#b5803a"
                                  : "#5a8a6b"
                              : "rgba(15, 25, 18, 0.08)",
                        }}
                      />
                    ))}
                  </div>
                  <div className="text-[11px] text-[#858c87] dark:text-[#6e7672]">{labels[score]}</div>
                </div>
              )}
              {errors.password && (
                <p className="mt-1.5 text-[12px] text-red-500">{errors.password.message}</p>
              )}
            </div>

            {/* Repeat password */}
            <div className="mb-4">
              <label className="block text-[12px] font-medium text-[#5a625e] dark:text-[#a0a8a3] mb-1.5 tracking-[0.01em]">
                Confirm password
              </label>
              <div className="relative">
                <input
                  {...register("repeatPassword")}
                  type={showRepeat ? "text" : "password"}
                  placeholder="Repeat your password"
                  className={`w-full h-[42px] pl-3.5 pr-10 rounded-lg border bg-white dark:bg-[#151a17] text-[13px] text-[#1a201c] dark:text-[#e8ece9] placeholder-[#4a514d] dark:placeholder-[#4a514d] outline-none transition-all
                    ${errors.repeatPassword
                      ? "border-red-400 dark:border-red-500 focus:ring-2 focus:ring-red-400/20"
                      : "border-black/[0.08] dark:border-white/[0.07] hover:border-black/[0.14] dark:hover:border-white/[0.14] focus:border-[#5a8a6b] focus:ring-2 focus:ring-[#5a8a6b]/20"
                    }`}
                />
                <button
                  type="button"
                  onClick={() => setShowRepeat((v) => !v)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#858c87] dark:text-[#6e7672] hover:text-[#5a625e] dark:hover:text-[#a0a8a3] transition-colors cursor-pointer"
                >
                  {showRepeat ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.repeatPassword && (
                <p className="mt-1.5 text-[12px] text-red-500">{errors.repeatPassword.message}</p>
              )}
            </div>

            {/* Terms */}
            <label className="flex items-start gap-2.5 mt-5 text-[12px] text-[#5a625e] dark:text-[#a0a8a3] cursor-pointer leading-[1.5]">
              <input
                type="checkbox"
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
                className="mt-0.5 accent-[#5a8a6b]"
              />
              <span>
                I agree to the{" "}
                <a href="#" className="text-[#1a201c] dark:text-[#e8ece9] underline decoration-black/[0.16] dark:decoration-white/[0.14]">Terms</a>{" "}
                and{" "}
                <a href="#" className="text-[#1a201c] dark:text-[#e8ece9] underline decoration-black/[0.16] dark:decoration-white/[0.14]">Privacy Policy</a>.
              </span>
            </label>

            <button
              type="submit"
              disabled={!agree}
              className="w-full h-11 mt-6 flex items-center justify-center gap-2 rounded-lg bg-[#5a8a6b] hover:bg-[#4f7a5e] active:bg-[#446b52] text-white text-[13px] font-medium transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Create account <ArrowRight size={15} />
            </button>
          </form>

          <p className="text-center mt-6 text-[13px] text-[#5a625e] dark:text-[#a0a8a3]">
            Already have an account?{" "}
            <Link to="/login" className="text-[#5a8a6b] font-medium hover:text-[#4f7a5e] transition-colors">
              Sign in
            </Link>
          </p>
        </div>

        <div className="mt-8 text-[12px] text-[#858c87] dark:text-[#6e7672]">
          © 2026 WorkspaceBridge ·{" "}
          <a href="#" className="underline decoration-black/[0.16] dark:decoration-white/[0.14] hover:text-[#5a625e] dark:hover:text-[#a0a8a3] transition-colors">Privacy</a>
          {" · "}
          <a href="#" className="underline decoration-black/[0.16] dark:decoration-white/[0.14] hover:text-[#5a625e] dark:hover:text-[#a0a8a3] transition-colors">Terms</a>
        </div>
      </div>

      {/* Right — preview */}
      <div className="hidden lg:flex items-center justify-center p-8 bg-[#f3f3ee] dark:bg-[#0a0f0c] border-l border-black/[0.06] dark:border-white/[0.05]">
        <AppSidePreview />
      </div>
    </div>
  );
};
