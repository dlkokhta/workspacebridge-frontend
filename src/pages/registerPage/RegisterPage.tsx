import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { RegistrationSuccess } from "../../components/RegistrationSuccess.js";
import { useTheme } from "../../context/ThemeContext";
import { AppSidePreview } from "./components/AppSidePreview";
import { AuthFooter } from "./components/AuthFooter";
import { AuthHeader } from "./components/AuthHeader";
import { SocialSignUp } from "./components/SocialSignUp";
import { RegistrationForm } from "./sections/RegistrationForm";

export const RegistrationPage = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const url = import.meta.env.VITE_API_URL;

  const [responseMessage, setResponseMessage] = useState<string>("");
  const [showModal, setShowModal] = useState<boolean>(false);

  useEffect(() => {
    if (showModal) navigate("/login");
  }, [showModal, navigate]);

  const handleGoogle = () => {
    window.location.href = `${url}/auth/google`;
  };

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

        <AuthHeader theme={theme} onToggleTheme={toggleTheme} />

        <div className="flex-1 flex flex-col justify-center max-w-[380px] w-full mx-auto py-4">
          <h1 className="text-[32px] font-semibold tracking-[-0.025em] leading-tight mb-2 text-[#1a201c] dark:text-[#e8ece9]">
            Create your account
          </h1>
          <p className="text-[#5a625e] dark:text-[#a0a8a3] mb-8">
            Free forever. No credit card needed.
          </p>

          <SocialSignUp onGoogle={handleGoogle} />

          <RegistrationForm onSuccess={setResponseMessage} />

          <p className="text-center mt-6 text-[13px] text-[#5a625e] dark:text-[#a0a8a3]">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-[#5a8a6b] font-medium hover:text-[#4f7a5e] transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>

        <AuthFooter />
      </div>

      {/* Right — preview */}
      <div className="hidden lg:flex items-center justify-center p-8 bg-[#f3f3ee] dark:bg-[#0a0f0c] border-l border-black/[0.06] dark:border-white/[0.05]">
        <AppSidePreview />
      </div>
    </div>
  );
};
