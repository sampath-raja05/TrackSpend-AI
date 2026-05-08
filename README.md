# TrackSpend AI Spend Audit

TrackSpend AI Spend Audit is a free Next.js app for founders and engineering leaders who want a fast second opinion on AI tooling spend. Users enter tools, plans, seats, monthly spend, team size, and use case, then receive a per-tool savings audit with shareable results and optional follow-up capture after value is shown.

## Screenshots

Add three screenshots before submission:

- Landing page with the spend input form
- Audit results hero and AI summary
- Tool breakdown showing recommendations

## Quick Start

```bash
npm install
npm run dev
npm run lint
npm test
npm run build
```

Local app: http://localhost:3000

Deployed URL: TODO after Vercel/Netlify deployment.

## Decisions

- Used Next.js App Router and TypeScript because the app needs interactive UI, API routes, and shareable public URLs in one deployable codebase.
- Kept audit math rule-based instead of LLM-based so savings are deterministic, testable, and finance-readable.
- Generated the AI paragraph only after the hardcoded audit engine finishes, with a templated fallback when Anthropic fails or is not configured.
- Moved email capture after the user sees the report so the tool gives value before asking for contact details.
- Used SQLite/Prisma locally for fast iteration; a production deploy should use Postgres/Supabase for concurrent writes and backups.

## Required Environment

```bash
DATABASE_URL="file:./dev.db"
ANTHROPIC_API_KEY="..."
RESEND_API_KEY="..."
NEXT_PUBLIC_APP_URL="https://your-deployed-url.example"
```

No secrets should be committed.
