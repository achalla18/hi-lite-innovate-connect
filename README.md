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
