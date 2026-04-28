import { Route, Routes } from "react-router-dom";

import { Homepage } from "../pages/homePage";
import { RegistrationPage } from "../pages/registerPage";
import { LoginPage } from "../pages/loginPage";
import { ROUTES } from "../constants";
import { ProfilePage } from "../pages/profilePage";
import { GoogleAuthSuccess } from "../pages/googleAuthSuccess";
import { WelcomePage } from "../pages/welcomePage";
import { ProtectedRoute } from "../components/ProtectedRoute";
import { VerifyEmailPage } from "../pages/verifyEmailPage";
import { ForgotPasswordPage } from "../pages/forgotPasswordPage";
import { ResetPasswordPage } from "../pages/resetPasswordPage";
import { AdminPage } from "../pages/adminPage";
import { TwoFactorVerifyPage } from "../pages/twoFactorVerifyPage";

export const AppRouter = () => {
  return (
    <Routes>
      <Route path={ROUTES.Home} element={<Homepage />} />
      <Route path={ROUTES.Register} element={<RegistrationPage />} />
      <Route path={ROUTES.Login} element={<LoginPage />} />
      <Route 
        path={ROUTES.Welcome} 
        element={
          <ProtectedRoute>
            <WelcomePage />
          </ProtectedRoute>
        } 
      />
      <Route
        path={ROUTES.Profile}
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      <Route path={ROUTES.GoogleAuthSuccess} element={<GoogleAuthSuccess />} />
      <Route path={ROUTES.VerifyEmail} element={<VerifyEmailPage />} />
      <Route path={ROUTES.PasswordRecovery} element={<ForgotPasswordPage />} />
      <Route path={ROUTES.ResetPassword} element={<ResetPasswordPage />} />
      <Route path={ROUTES.TwoFactorVerify} element={<TwoFactorVerifyPage />} />
      <Route
        path={ROUTES.AdminPanel}
        element={
          <ProtectedRoute requiredRole="ADMIN">
            <AdminPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};
