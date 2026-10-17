# Project rules for hunban-web

- This repo is PUBLIC. Never commit secrets, keys, passwords, personal data or member data.
- Secrets go in Vercel environment variables only. Anything prefixed NEXT_PUBLIC_ ends up in browser code.
- Every Supabase table must have Row Level Security enabled, with explicit policies.
- Supabase project region: EU (Frankfurt).
- Owner is Adam (HunBAN), not a developer: explain changes in plain language, keep commits small and descriptive.
- Site copy: Hungarian must read as native, idiomatic Hungarian. No em dashes in copy.
