# LinkNest

**Your private space for saving and organizing links.**

LinkNest is a production-ready, SaaS-style real-time bookmark manager built with Next.js, Supabase, and Tailwind CSS.

---

## Tech Stack

| Layer          | Technology                          |
| -------------- | ----------------------------------- |
| Framework      | Next.js 16 (App Router)             |
| Auth           | Supabase Auth (Google OAuth)        |
| Database       | Supabase Postgres                   |
| Realtime       | Supabase Realtime (postgres_changes)|
| Styling        | Tailwind CSS v4                     |
| Hosting        | Vercel                              |

---

## Architecture

```
/app
  layout.tsx              → Root layout (server component)
  page.tsx                → Landing page (server component)
  /dashboard
    page.tsx              → Dashboard server component (auth gate)
    DashboardClient.tsx   → Dashboard client component
  /auth/callback
    route.ts              → OAuth callback handler

/lib
  supabaseClient.ts       → Browser Supabase client (SSR-safe)
  supabaseServer.ts       → Server Supabase client (cookies-based)
  types.ts                → Shared TypeScript types

/components
  AuthButton.tsx          → Google sign-in button
  BookmarkForm.tsx        → Add bookmark form
  BookmarkList.tsx        → Real-time bookmark list
  BookmarkItem.tsx        → Single bookmark row
  Navbar.tsx              → Top navigation bar
  ProtectedRoute.tsx      → Client-side auth guard

/middleware.ts            → Session refresh + route protection
/supabase/schema.sql      → Database schema + RLS policies
```

**Server vs Client separation:**  
- Pages use server components for data fetching and auth checks.  
- Interactive UI lives in client components (`"use client"`).  
- The middleware handles session refresh and route-level redirects.

---

## Database Schema

### `bookmarks` table

| Column     | Type                     | Constraints                          |
| ---------- | ------------------------ | ------------------------------------ |
| id         | uuid                     | primary key, default gen_random_uuid()|
| user_id    | uuid                     | references auth.users(id), not null  |
| title      | text                     | not null                             |
| url        | text                     | not null                             |
| created_at | timestamp with time zone | default now()                        |

---

## Row Level Security (RLS)

All access to the `bookmarks` table is controlled by three RLS policies:

1. **SELECT** — `auth.uid() = user_id`  
   Users can only read their own bookmarks.

2. **INSERT** — `auth.uid() = user_id`  
   Users can only create bookmarks under their own user ID.

3. **DELETE** — `auth.uid() = user_id`  
   Users can only delete their own bookmarks.

This means even if a malicious client tries to read or modify another user's data, Postgres itself blocks the operation.

---

## Realtime Implementation

The bookmark list subscribes to Supabase Realtime via the `postgres_changes` channel:

```ts
supabase
  .channel("bookmarks-realtime")
  .on("postgres_changes", {
    event: "*",
    schema: "public",
    table: "bookmarks",
    filter: `user_id=eq.${userId}`,
  }, (payload) => {
    // Handle INSERT → prepend to state
    // Handle DELETE → remove from state
  })
  .subscribe();
```

- Filtered to the current user's bookmarks only.
- On `INSERT`, the new bookmark is added to the top of the list (with duplicate guard).
- On `DELETE`, the bookmark is removed from state.
- Channel is cleaned up on component unmount.

This ensures bookmarks stay in sync across multiple tabs/windows.

---

## Challenges & Design Decisions

1. **Middleware session refresh** — Supabase JWTs expire; the middleware refreshes the session on every request so the user stays authenticated seamlessly.

2. **Server + Client split** — The dashboard page is a server component that fetches the user, then passes props to a client component. This avoids exposing auth checks to the client while keeping the UI interactive.

3. **Optimistic deletes** — When a user deletes a bookmark, it's removed from the UI instantly. If the server call fails, the list is re-fetched for correctness.

4. **Realtime duplicate guard** — Because an insert triggers both a local state update and a realtime event, the realtime handler checks for duplicates before appending.

---

## Getting Started

### Prerequisites

- Node.js 20+ 
- A Supabase project ([supabase.com](https://supabase.com))
- A Google OAuth client ([console.cloud.google.com](https://console.cloud.google.com))

### 1. Clone the repo

```bash
git clone https://github.com/your-username/linknest.git
cd linknest
npm install
```

### 2. Set up Supabase

1. Create a new Supabase project.
2. Go to **SQL Editor** and run the contents of `supabase/schema.sql`.
3. Go to **Authentication → Providers → Google** and enable it.
4. Set the Google OAuth Client ID and Secret from your GCP console.
5. Add `http://localhost:3000/auth/callback` as a redirect URL under **Authentication → URL Configuration**.

### 3. Configure environment variables

Copy `.env.example` to `.env.local` and fill in your values:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Deployment (Vercel)

1. Push the repo to GitHub.
2. Import the repo in [vercel.com](https://vercel.com).
3. Add the environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`).
4. In Supabase → Authentication → URL Configuration, add your Vercel production URL:
   - Site URL: `https://your-app.vercel.app`
   - Redirect URL: `https://your-app.vercel.app/auth/callback`
5. Deploy.

---

## License

MIT

