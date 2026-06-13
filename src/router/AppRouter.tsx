import { Route, Routes } from "react-router-dom";

import { Homepage } from "../pages/homePage";
import { WorkspacePage } from "../pages/workspacePage";
import { OnboardingPage } from "../pages/onboardingPage";
import { RegistrationPage } from "../pages/registerPage";
import { LoginPage } from "../pages/loginPage";
import { ROUTES } from "../constants";
import { ProfilePage } from "../pages/profilePage";
import { DashboardPage } from "../pages/dashboardPage";
import { InvitePage } from "../pages/invitePage";
import { PortalPage } from "../pages/portalPage";
import { GoogleAuthSuccess } from "../pages/googleAuthSuccess";
import { WelcomePage } from "../pages/welcomePage";
import { ProtectedRoute } from "../components/ProtectedRoute";
import { VerifyEmailPage } from "../pages/verifyEmailPage";
import { ConfirmEmailChangePage } from "../pages/confirmEmailChangePage";
import { ForgotPasswordPage } from "../pages/forgotPasswordPage";
import { ResetPasswordPage } from "../pages/resetPasswordPage";
import { AdminPage } from "../pages/adminPage";
import { TwoFactorVerifyPage } from "../pages/twoFactorVerifyPage";
import { AppShell } from "../layouts/AppShell";

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
      <Route path={ROUTES.GoogleAuthSuccess} element={<GoogleAuthSuccess />} />
      <Route path={ROUTES.VerifyEmail} element={<VerifyEmailPage />} />
      <Route
        path={ROUTES.ConfirmEmailChange}
        element={<ConfirmEmailChangePage />}
      />
      <Route path={ROUTES.PasswordRecovery} element={<ForgotPasswordPage />} />
      <Route path={ROUTES.ResetPassword} element={<ResetPasswordPage />} />
      <Route path={ROUTES.TwoFactorVerify} element={<TwoFactorVerifyPage />} />
      <Route
        path={ROUTES.Onboarding}
        element={
          <ProtectedRoute>
            <OnboardingPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.Workspace}
        element={
          <ProtectedRoute>
            <WorkspacePage />
          </ProtectedRoute>
        }
      />

      {/* AppShell layout — sidebar always visible, right side changes */}
      <Route
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route path={ROUTES.Dashboard} element={<DashboardPage />} />
        <Route path={ROUTES.Profile} element={<ProfilePage />} />
        <Route path={ROUTES.Settings} element={<ProfilePage />} />
      </Route>
      <Route path={ROUTES.Invite} element={<InvitePage />} />
      <Route
        path={ROUTES.Portal}
        element={
          <ProtectedRoute>
            <PortalPage />
          </ProtectedRoute>
        }
      />
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
