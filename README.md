# Sprout (кішкас)

A personal platform for content creators: a widget dashboard, stats with charts, goals, daily reflections, notes and an AI mentor that knows the context of your blog. Every creator gets their own profile (and branding), plus `demo` and `default` profiles.

**Live:** https://kishkas.vercel.app

<!-- Add 2-3 screenshots here: dashboard, stats, AI mentor -->
<!-- ![Dashboard](docs/dashboard.png) -->

## Features

- **Dashboard with widgets**, drag and drop reordering (SortableJS)
- **Statistics** with charts (Chart.js)
- **Goals, notes and daily reflections** saved per user
- **AI mentor** powered by Claude, with the creator's profile and stats as context
- **Onboarding tour** for new users (Driver.js)
- **Per-user profiles** with their own name, colours and content ideas
- **Authentication** with email and password or Google sign-in (Supabase Auth), a demo mode without registration (runs in the browser only, no AI calls), and account deletion

## Tech stack

| Layer | Tools |
|---|---|
| Frontend | Plain HTML, CSS and JavaScript (no framework, no build step), about 5000 lines |
| Libraries (CDN) | Supabase JS, Chart.js, SortableJS, Driver.js, Lucide |
| Backend | Supabase: Auth and a Postgres database (10 tables, e.g. `stats`, `goals`, `notes`, `reflections`, `chats`) |
| AI | Vercel serverless function `api/chat.js` that proxies requests to the Claude API |
| Hosting | Vercel |

## How the AI mentor stays safe

The Anthropic key never reaches the browser. The browser calls `/api/chat` with the user's Supabase session token, and the function:

1. checks that the token belongs to a signed-in user (`/auth/v1/user`),
2. ignores any model sent by the client and uses a fixed one,
3. caps `max_tokens` and the request size,
4. applies a per-user rate limit of 30 requests per hour (`supabase/migrations/20261021120000_chat_rate_limit.sql`) and refuses to call Claude if the limit cannot be checked,
5. only then calls the Claude API with the key stored in a Vercel environment variable.

User data is protected by Row Level Security in Supabase: every table has a policy so a user only reads and writes their own rows (`supabase/schema.sql`). The `anon` key in `app.js` is public by design.

## Database setup

Run `supabase/schema.sql` in the Supabase SQL Editor (tables and RLS policies), then `supabase/migrations/*.sql` and `supabase/delete_my_account.sql`.

## Run locally

```bash
npm i -g vercel
vercel dev
```

Environment variables (Vercel project settings or a local `.env`, which is git-ignored):

| Name | Purpose |
|---|---|
| `ANTHROPIC_API_KEY` | Claude API key, used only on the server |
| `SUPABASE_URL` / `SUPABASE_ANON_KEY` | Optional overrides, the public project values are used by default |

## Project structure

```
index.html     markup and layout
styles.css     styles
app.js         app logic: auth, widgets, charts, AI calls
api/chat.js    serverless proxy to the Claude API
supabase/      schema.sql (tables and RLS), migrations, delete_my_account.sql
privacy.html   privacy policy
vercel.json    routing
```
