import { Link } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { AuthFooter } from "../../components/auth/AuthFooter";
import { AuthHeader } from "../../components/auth/AuthHeader";
import { SocialAuthButtons } from "../../components/auth/SocialAuthButtons";
import { AppSidePreview } from "./components/AppSidePreview";
import { LoginForm } from "./sections/LoginForm";
import { PasskeyLoginButton } from "./sections/PasskeyLoginButton";

export const LoginPage = () => {
  const { theme, toggleTheme } = useTheme();
  const url = import.meta.env.VITE_API_URL;

  const handleGoogleLogin = () => {
    window.location.href = `${url}/auth/google`;
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-[#fafaf7] dark:bg-[#0e1310]">
      {/* Left — form */}
      <div className="flex flex-col px-8 py-8 md:px-12 overflow-auto">
        <AuthHeader theme={theme} onToggleTheme={toggleTheme} />

        <div className="flex-1 flex flex-col justify-center max-w-[380px] w-full mx-auto">
          <h1 className="text-[32px] font-semibold tracking-[-0.025em] leading-tight mb-2 text-[#1a201c] dark:text-[#e8ece9]">
            Welcome back
          </h1>
          <p className="text-[#5a625e] dark:text-[#a0a8a3] mb-8">
            Sign in to your workspaces.
          </p>

          <SocialAuthButtons
            onGoogle={handleGoogleLogin}
            googleLabel="Continue with Google"
            githubLabel="Continue with GitHub"
            dividerLabel="Or continue with email"
          />

          <LoginForm />

          <PasskeyLoginButton />

          <p className="text-center mt-6 text-[13px] text-[#5a625e] dark:text-[#a0a8a3]">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-[#5a8a6b] font-medium hover:text-[#4f7a5e] transition-colors"
            >
              Create one
            </Link>
          </p>
        </div>

        <AuthFooter />
      </div>

      {/* Right — preview panel (hidden on mobile) */}
      <div className="hidden lg:flex items-center justify-center p-8 bg-[#f3f3ee] dark:bg-[#0a0f0c] border-l border-black/[0.06] dark:border-white/[0.05]">
        <AppSidePreview />
      </div>
    </div>
  );
};
