# WorkspaceBridge Frontend

> Freelancer–client collaboration platform — Frontend SPA

**Backend repo:** [workspacebridge-backend](../workspacebridge-backend)

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white&style=flat-square)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white&style=flat-square)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?logo=tailwindcss&logoColor=white&style=flat-square)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white&style=flat-square)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-12-0055FF?logo=framer&logoColor=white&style=flat-square)

---

## What is this?

The frontend SPA for **WorkspaceBridge**, a freelancer–client collaboration platform. The current scope covers the marketing homepage and the full authentication / account flow — the layer that the rest of the product is being built on top of.

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | React 18 + TypeScript |
| Build tool | Vite |
| Styling | Tailwind CSS v4 (light + dark mode) |
| Animations | Framer Motion |
| Routing | React Router v7 |
| Forms | React Hook Form + Yup |
| HTTP | Axios with auto-refresh interceptor |
| Icons | Lucide React |
| Testing | Vitest + Testing Library |

## Features

### Public
- Animated landing page (hero, features, how-it-works, pricing, CTA, footer)
- Light / dark mode (system preference + per-page toggle)
- Two-column sign-in and registration pages with workspace preview + testimonial
- Google OAuth one-click sign-in (GitHub button reserved as "coming soon")

### Auth flows
- Register with email/password — validation via Yup, password strength meter
- Login with email/password — show/hide password toggle
- TOTP 2FA — separate verification page after credential check
- Email verification flow (after signup)
- Forgot password / reset password flows
- Auto token refresh on 401 via Axios interceptor
- JWT access token kept in React state (never in `localStorage`)

### Authenticated
- Profile page — view + edit name, change password, enable/disable 2FA
- Admin panel — list users, change role, delete user, pagination
- Protected routes with role-based access control (`FREELANCER` / `CLIENT` / `ADMIN`)

## Getting Started

### Prerequisites
- Node.js 18+
- WorkspaceBridge backend running (see [workspacebridge-backend](../workspacebridge-backend))

### 1. Install dependencies
```bash
npm install
```

### 2. Set up environment variables
Create a `.env` file:

```env
VITE_API_URL=http://localhost:4002
```

### 3. Start the development server
```bash
npm run dev
```

App runs on `http://localhost:5173`.

### 4. Run tests
```bash
npm run test:run
```

## Project Structure

```
src/
├── components/       # Shared components (ProtectedRoute, RegistrationSuccess)
├── constants/        # Route constants
├── context/          # AuthContext, ThemeContext
├── pages/
│   ├── homePage/             # Landing page (hero, features, pricing, etc.)
│   ├── loginPage/            # Sign in (two-column with workspace preview)
│   ├── registerPage/         # Register (two-column with workspace preview)
│   ├── profilePage/          # Profile + change password + 2FA
│   ├── adminPage/            # Admin user management
│   ├── verifyEmailPage/      # Email verification confirmation
│   ├── forgotPasswordPage/   # Forgot password
│   ├── resetPasswordPage/    # Reset password via token
│   ├── twoFactorVerifyPage/  # TOTP 2FA login step
│   └── googleAuthSuccess/    # Google OAuth callback handler
├── router/           # AppRouter
├── schemas/          # Yup validation schemas
├── test/             # Vitest unit & component tests
└── types/            # TypeScript type definitions
```

## Routes

| Path | Description | Protected |
|------|-------------|-----------|
| `/` | Landing page | No |
| `/register` | Register | No |
| `/login` | Login | No |
| `/auth/2fa-verify` | TOTP verification step | No (post-credentials) |
| `/auth/verify-email` | Email verification | No |
| `/auth/success` | Google OAuth callback | No |
| `/passwordRecovery` | Forgot password | No |
| `/auth/reset-password` | Reset password | No |
| `/profile` | User profile | Yes |
| `/adminPanel` | Admin panel | Yes (`ADMIN`) |
