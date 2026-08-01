# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**روضة الأمل (Hope Bloom / Little Seeds Portal)** — an electronic enrollment system for a preschool in Sfax, Tunisia. Fully bilingual Arabic/English with RTL layout. Live at: https://hope-bloom-enroll.lovable.app

## Commands

```sh
npm run dev          # Start dev server (Vite)
npm run build        # Production build
npm run build:dev    # Dev-mode build
npm run preview      # Preview production build locally
npm run lint         # ESLint (flat config, ESLint 9.x)
npm run format       # Prettier (printWidth 100, double quotes, trailing commas)
```

> The project also works with `bun` (`bun dev`, `bun run build`, etc.).

There are no test scripts configured.

## Architecture

### Stack
- **TanStack React Start** (SSR framework) + **TanStack React Router** (file-based routing)
- **Supabase** — PostgreSQL + Auth + Storage (two buckets: `documents`, `gallery`)
- **TanStack React Query** for server state
- **React Hook Form + Zod** for forms
- **Tailwind CSS 4 + shadcn/ui** (style: new-york, icon lib: lucide-react)
- **Nitro** targeting Cloudflare Workers for deployment

### Routing
Routes live in `src/routes/`. TanStack Router auto-generates `src/routeTree.gen.ts` — **never edit this file manually**. When you add or rename a route file, the router regenerates the tree on next `dev`/`build` run.

| Route file | Path | Notes |
|---|---|---|
| `__root.tsx` | layout | Sets `lang="ar" dir="rtl"`, loads fonts, wraps app in QueryClientProvider |
| `index.tsx` | `/` | Home page |
| `register.tsx` | `/register` | Child enrollment form → Supabase `registrations` table |
| `contact.tsx` | `/contact` | Contact form → Supabase `contact_messages` table |
| `auth.tsx` | `/auth` | Sign in / sign up (email+password via Supabase Auth) |
| `admin.tsx` | `/admin` | Protected dashboard: registrations, messages, gallery tabs |

### Supabase Integration
- Client (browser): `src/integrations/supabase/client.ts`
- Client (server): `src/integrations/supabase/client.server.ts`
- Auth middleware (attaches user to server function context): `src/integrations/supabase/auth-attacher.ts`
- Generated types: `src/integrations/supabase/types.ts`

**Database tables:**
- `registrations` — child enrollment records, `status` enum: `pending | accepted | rejected`
- `contact_messages` — contact form submissions, `is_read` flag
- `gallery_images` — admin-managed photo gallery with `sort_order`
- `user_roles` — maps `auth.uid()` → `app_role` enum (`admin | user`)

**RLS pattern:** Anonymous users can INSERT registrations and messages. All reads/updates/deletes require `has_role(auth.uid(), 'admin')`. The `has_role` RPC is revoked from public/anon — use the Supabase client-side RPC call in `admin.tsx`.

**Storage buckets:**
- `documents` — registration file uploads (admin read-only, anonymous upload was removed in migration 3)
- `gallery` — public read, admin write

### Server Entry & Middleware
`src/start.ts` wires up three middleware layers applied to every TanStack Start server function:
1. **Error middleware** — catches unhandled errors, returns 500 HTML
2. **CSRF middleware** — protects server functions from cross-origin requests
3. **Supabase auth middleware** (`attachSupabaseAuth`) — injects authenticated Supabase client into function context

### Static Site Content
All hardcoded site content (school name, phone numbers, address, Facebook/Maps URLs, features, sections, activities, daily schedule, status labels) is centralized in `src/lib/site-data.ts`. Update content there rather than scattering it across components.

### Path Alias
`@/*` maps to `src/*` (configured in `tsconfig.json` and Vite via `@lovable.dev/vite-tanstack-config`).

## Lovable Platform

This project is connected to [Lovable](https://lovable.dev). **Do not rewrite published git history** (no force-push, rebase-amend, or squash of already-pushed commits) — it corrupts Lovable's project history on their side. Keep the `main` branch in a working state at all times, as commits sync back to the Lovable editor.

## Known Issues

`package.json` currently has a merge conflict marker on the `@lovable.dev/vite-tanstack-config` version and `@rolldown/binding-win32-x64-msvc` (moved to `optionalDependencies` for Vercel Linux builds). Resolve before running `npm install`.
