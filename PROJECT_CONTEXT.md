# Project Context - Habit System Frontend

## Overview

Habit System Frontend is a Next.js application for habit tracking with authentication, dashboards, analytics, and habit management.

The repository currently reflects the live implementation, not the older planning documents. The most relevant runtime versions are:

- Next.js 16.2.2
- React 19.2.4
- TypeScript 5.x
- Tailwind CSS 4
- Axios, React Query, React Hook Form, Zod, Recharts

## Goals Of The App

- Authenticate users with JWT access and refresh tokens.
- Protect authenticated routes and keep session state across reloads.
- Show habit, check-in, score, and analytics screens.
- Provide responsive UI for mobile and desktop.

## Main Routes

- `/` - entry point, redirects depending on authentication state.
- `/login` - public login page.
- `/register` - public registration page.
- `/dashboard` - authenticated home page.
- `/habits` - habit list and management.
- `/habits/new` - create habit.
- `/habits/[id]/edit` - edit habit.
- `/analytics` - progress and summary views.
- `/settings` - user profile and account actions.

## Important App Structure

- `app/` contains the App Router pages and global app files.
- `components/` contains reusable UI, layout, analytics, dashboard, habits, and shared components.
- `hooks/` contains React Query hooks for habits, check-ins, and scores.
- `lib/` contains API clients, auth logic, types, utilities, and validations.
- `contexts/` contains the auth context provider.
- `public/` contains static assets, including `sw.js` for service worker support.

## Current File Map

### App Router

- `app/layout.tsx` - root layout.
- `app/page.tsx` - landing redirect logic.
- `app/login/page.tsx` - login form.
- `app/register/page.tsx` - registration form.
- `app/dashboard/page.tsx` - dashboard.
- `app/habits/page.tsx` - habits list.
- `app/habits/new/page.tsx` - create habit page.
- `app/habits/[id]/edit/page.tsx` - edit habit page.
- `app/analytics/page.tsx` - analytics page.
- `app/settings/page.tsx` - settings page.

### Auth And API

- `lib/api/client.ts` - Axios client and interceptors.
- `lib/api/auth.ts` - auth requests and token helpers.
- `lib/contexts/auth-context.tsx` - global auth state.
- `components/shared/protected-route.tsx` - guards authenticated routes.
- `components/shared/public-only-route.tsx` - guards login/register routes.

### Domain Features

- `lib/api/habits.ts`, `lib/api/checkins.ts`, `lib/api/scores.ts` - feature API layers.
- `hooks/useHabits.ts`, `hooks/useCheckIns.ts`, `hooks/useScores.ts` - data hooks.
- `components/habits/*` - habit UI.
- `components/dashboard/*` - dashboard widgets.
- `components/analytics/*` - analytics widgets.

### UI And Layout

- `components/layout/app-layout.tsx` - application shell.
- `components/layout/sidebar.tsx` - desktop navigation and user actions.
- `components/layout/bottom-nav.tsx` - mobile navigation.
- `components/ui/*` - shared UI primitives.

## Authentication Model

The current auth implementation uses JWT with localStorage storage and automatic refresh handling.

### Backend Endpoints Expected

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/refresh`

### Token Flow

1. User logs in or registers.
2. Backend returns `accessToken` and `refreshToken`.
3. Frontend stores tokens in `localStorage`.
4. Axios request interceptor attaches `Authorization: Bearer <token>`.
5. If a request returns `401`, the client attempts refresh.
6. If refresh succeeds, original requests are retried.
7. If refresh fails, the app clears auth state and redirects to `/login`.

### Route Protection

- Authenticated pages use `ProtectedRoute`.
- Public auth pages use `PublicOnlyRoute`.
- The root page decides whether to send the user to `/dashboard` or `/login`.

## API Base URL

The frontend expects the backend URL in environment variables.

```env
NEXT_PUBLIC_API_URL=http://localhost:5232
```

Development and documentation currently point to `http://localhost:5232` as the local API server.

## Data And State Pattern

- React Query is used for server state and caching.
- React Hook Form + Zod are used for forms and validation.
- Axios handles HTTP calls and token refresh.
- Component state is kept minimal; server data should come from hooks or the auth context.

## UI And Product Notes

- The app includes dashboard, habits, analytics, settings, login, and register flows.
- Layout is responsive with mobile bottom navigation and desktop sidebar.
- The UI uses the existing component library under `components/ui/`.
- PWA-related files exist, including `components/pwa/*` and `public/sw.js`.

## Scripts

Use the scripts defined in `package.json`:

```json
{
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "eslint"
}
```

## Practical Notes For Future Changes

- Keep the auth context and Axios client aligned when changing token behavior.
- Update both public route guards and protected route guards when adding new pages.
- If the backend contract changes, update `lib/api/auth.ts`, `lib/api/client.ts`, and the auth types together.
- Prefer modifying the existing component structure instead of introducing a second UI system.
- The older planning docs mention Next.js 14 and a single-user phase, but the repository is now beyond that state.

## Source Docs In This Repo

- `AUTH_IMPLEMENTATION.md` - implemented auth flow and current feature summary.
- `FRONTEND_AUTH_GUIDE.md` - auth API contract and implementation notes.
- `FRONTEND_PLAN.md` - older plan for the frontend architecture.
- `README.md` - default Next.js starter documentation.
