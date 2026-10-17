# hunban-web

Website of the Hungarian Business Angel Network (Magyar Üzleti Angyal Egyesület), served at hunban.eu.

## Stack

- Next.js (App Router, TypeScript, Tailwind CSS)
- Vercel for hosting, auto-deploying from `main`
- Supabase (PostgreSQL, EU region) for data and logins

## Planned sections

1. About HunBAN, what we do, membership
2. Startup application form (embedded ClickUp form)
3. Ecosystem events (HunBAN and partner events)
4. Interactive map of the Hungarian startup ecosystem

## Security rules

- Row Level Security is enabled on every Supabase table.
- Secret keys live only in Vercel environment variables, never in this repo.
- See `.env.example` for the variable names.
