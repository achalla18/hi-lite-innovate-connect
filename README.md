# Hi-Lite Innovate Connect

A modern social and professional networking application built with React, TypeScript, Vite, Supabase, and Tailwind CSS.

## Features

- Authentication and onboarding flows
- User profiles and social interactions
- Clubs and community spaces
- Messaging and notifications
- Company discovery and detail views
- Secure account settings

## Tech stack

- React 18 + TypeScript
- Vite
- Tailwind CSS + shadcn/ui
- TanStack Query
- Supabase

## Getting started

### Prerequisites

- Node.js 18+
- npm 9+

### Installation

```sh
npm install
```

### Environment variables

Copy `.env.example` to `.env` and provide values:

```sh
cp .env.example .env
```

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

### Google Sign-In (Supabase OAuth)

This app uses `supabase.auth.signInWithOAuth({ provider: "google" })`.

1. In Google Cloud, create a **Web application** OAuth client.
2. In Supabase Dashboard → Authentication → Providers → Google, add the Google client ID and client secret.
3. In Google OAuth credentials, add your Supabase callback URL (`https://<project-ref>.supabase.co/auth/v1/callback`) and your app origin.
4. Do **not** place Google client secrets in frontend code, `.env` files committed to git, or UI.

> Security note: if a Google OAuth client secret has been exposed, rotate it immediately in Google Cloud and update Supabase provider settings.

### Development

```sh
npm run dev
```

The app runs on `http://localhost:8080` by default.

### Linting

```sh
npm run lint
```

### Production build

```sh
npm run build
npm run preview
```

## Project structure

- `src/pages` — route-level page components
- `src/components` — reusable UI and feature components
- `src/context` — app-wide context providers
- `src/integrations/supabase` — Supabase client/types
- `supabase/migrations` — database migrations

## Notes

This repository is now fully self-managed and does not depend on Lovable-specific scripts, tooling, or hosted editor flows.
