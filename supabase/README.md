# Database blueprint

These SQL files recreate the hunban.eu Supabase database structure (tables, safeguards, security rules, the `images` bucket and the fixed label and sector lists). They contain no personal data.

Files run in filename order. New changes get a new, later-dated file; existing files are never edited.

Project: Supabase, region eu-central-1 (Frankfurt). The public role can only read published rows; it can never write.
