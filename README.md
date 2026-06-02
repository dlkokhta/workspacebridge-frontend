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

The frontend SPA for **WorkspaceBridge**, a freelancer–client collaboration platform. Freelancers create workspaces per client, invite them via magic link or email, and collaborate through messages, files, whiteboard, and shared links — all in one place.

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
| Server state | TanStack Query (React Query) — caching, mutations, optimistic updates |
| Realtime | Socket.IO client (chat, whiteboard sync, presence, notifications) |
| Whiteboard | Excalidraw |
| Icons | Lucide React |
| Testing | Vitest + Testing Library |

## Features

### Public
- Animated landing page (hero, features, how-it-works, pricing, CTA, footer)
- Light / dark mode (system preference + per-page toggle)
- Two-column sign-in and registration pages with workspace preview + testimonial
- Google OAuth one-click sign-in

### Auth flows
- Register with email/password — validation via Yup, password strength meter
- Login with email/password — role-aware redirect (freelancer → dashboard, client → portal)
- TOTP 2FA — separate verification page after credential check
- Email verification flow (after signup)
- Forgot password / reset password flows
- Auto token refresh on 401 via Axios interceptor
- JWT access token kept in React state (never in `localStorage`)

### Freelancer (authenticated)
- **Dashboard** — workspace cards grid with status badges, stats bar (total/active/completed), empty state, new workspace card
- **Onboarding** — 3-step flow: create workspace (name, description, color) → invite client (email or shareable link) → success
- **Workspace page** — full app shell with workspace sidebar, 4 tabs:
  - Messages — realtime chat thread (Socket.IO) with file attachment support
  - Files — drag-and-drop upload zone, grid / list view toggle, file type icons, per-file actions (download, soft-delete to trash, restore from trash, permanent purge), 30-day trash retention with quota awareness, and threaded comments per file with a live comment count on each card
  - Whiteboard — Excalidraw-based collaborative canvas with multi-board support, live remote cursors, save status badge, 15 starter templates, comments pinned to shapes, and version history with one-click restore
  - Shared Links — persisted URL bookmarks (Figma files, staging sites, etc.), any workspace member can add, creator or workspace owner can delete, hostname + relative time + adder attribution shown per link
- **Notifications** — bell + unread badge in the workspace header, updating in realtime via Socket.IO; dropdown lists recent notifications (new message, file comment, whiteboard comment), click-to-open, with mark-one / mark-all read. Offline users are emailed instead (handled by the backend)
- **Profile / Settings** — edit name, change password, enable/disable 2FA, notification preferences (UI), billing preview
- **Admin panel** — sidebar navigation with 8 tabs:
  - Overview — platform stats cards (users, workspaces, active/completed/archived, signups this week/month), 30-day activity chart (signups + workspace creation)
  - Users — searchable/filterable table (role, verified status), click row for detail drawer (workspaces, sessions, invites), suspend/activate, reset password, force-verify, delete
  - Workspaces — searchable table with owner, member count, status change, delete
  - Invites — all platform invites with status (used/expired/pending), revoke action
  - Sessions — all active sessions with user/IP/device, force-logout (revoke)
  - Files — storage stats, file table with workspace/uploader/size/type, permanent delete
  - Audit Log — tracks all admin actions with actor, target, metadata, searchable by target type
  - Settings — configurable platform defaults (invite expiry, max file size, maintenance mode, registration toggle)
  - Search, filter, and pagination on all tables

### Client (invited)
- **Invite page** (`/invite/:token`) — validates invite token, shows workspace info, client sets email (shareable link) + password → account created → enters workspace
- **Portal** — clean minimal interface with no sidebar, same 4 tabs with client-appropriate actions, workspace name in header

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
VITE_SOCKET_URL=http://localhost:4002
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
├── components/       # Shared components (ProtectedRoute, notification bell + dropdown)
├── constants/        # Route constants
├── context/          # AuthContext (JWT + Axios), ThemeContext (light/dark)
├── hooks/            # useSocket, useWhiteboardSocket, useWhiteboardComments, useWhiteboardVersions, useAdminStats, useAdminUsers, useAdminUserDetail, useAdminWorkspaces, useAdminInvites, useAdminSessions, useAdminFiles, useAdminAuditLog, useAdminSettings
├── pages/
│   ├── homePage/             # Landing page
│   ├── loginPage/            # Sign in
│   ├── registerPage/         # Register
│   ├── dashboardPage/        # Freelancer home — workspace cards grid
│   ├── onboardingPage/       # 3-step workspace creation + client invite
│   ├── workspacePage/        # Workspace: Messages, Files, Whiteboard, Shared Links
│   ├── portalPage/           # Client portal — minimal workspace view
│   ├── invitePage/           # Client invite acceptance + account setup
│   ├── profilePage/          # Profile + settings (password, 2FA, notifications, billing)
│   ├── adminPage/            # Admin panel (overview, users, workspaces, invites, sessions, files, audit log, settings)
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

| Path | Description | Protected | Role |
|------|-------------|-----------|------|
| `/` | Landing page | No | — |
| `/register` | Register | No | — |
| `/login` | Login | No | — |
| `/auth/2fa-verify` | TOTP verification step | No | — |
| `/auth/verify-email` | Email verification | No | — |
| `/auth/success` | Google OAuth callback | No | — |
| `/passwordRecovery` | Forgot password | No | — |
| `/auth/reset-password` | Reset password | No | — |
| `/invite/:token` | Client invite acceptance | No | — |
| `/dashboard` | Freelancer home | Yes | FREELANCER |
| `/onboarding` | Create workspace + invite | Yes | FREELANCER |
| `/workspace/:id` | Workspace detail | Yes | FREELANCER |
| `/portal` | Client workspace view | Yes | CLIENT |
| `/profile` | Account settings | Yes | Any |
| `/adminPanel` | Admin panel | Yes | ADMIN |
