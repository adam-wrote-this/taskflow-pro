# taskflow-pro

This is a [Next.js](https://nextjs.org) project bootstrapped with [v0](https://v0.app).

## Built with v0

This repository is linked to a [v0](https://v0.app) project. You can continue developing by visiting the link below -- start new chats to make changes, and v0 will push commits directly to this repo. Every merge to `main` will automatically deploy.

[Continue working on v0 →](https://v0.app/chat/projects/prj_9jEp6RSguO4XJsWZvpmwEyk0BiaS)

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Supabase Database Setup

If you see errors like `Could not find the table 'public.teams' in the schema cache`, your Supabase schema is not fully initialized (or the schema cache is stale).

Run these SQL files in Supabase SQL Editor **in order**:

1. `scripts/001_create_profiles.sql`
2. `scripts/002_profile_trigger.sql`
3. `scripts/003_create_teams.sql`
4. `scripts/004_create_team_members.sql`
5. `scripts/005_create_projects.sql`
6. `scripts/006_create_tasks.sql`
7. `scripts/007_create_comments.sql`
8. `scripts/008_create_notifications.sql`

Then run:

```sql
NOTIFY pgrst, 'reload schema';
```

Also verify your `.env.local` points to the same Supabase project where you executed the SQL.

## Learn More

To learn more, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
- [v0 Documentation](https://v0.app/docs) - learn about v0 and how to use it.

<a href="https://v0.app/chat/api/kiro/clone/adam-wrote-this/taskflow-pro" alt="Open in Kiro"><img src="https://pdgvvgmkdvyeydso.public.blob.vercel-storage.com/open%20in%20kiro.svg?sanitize=true" /></a>
