# 1. The hardest bug I hit this week, and how I debugged it

The hardest bug I faced this week was a deployment issue where the application worked perfectly in local development but failed during production deployment on Vercel. The failure happened after integrating Prisma, Supabase PostgreSQL, and the PDF/email generation flow together. The deployment logs initially showed generic module resolution and runtime errors, which made debugging difficult.

My first hypothesis was that Prisma was failing to connect to Supabase because of incorrect environment variables. I verified the `DATABASE_URL` and `DIRECT_URL` values multiple times and tested the database connection locally. That worked, so I ruled out the database itself.

The second hypothesis was that the issue came from server/client component boundaries in Next.js. I inspected imports carefully and found that some server-side utilities were indirectly imported into client components through shared files. I separated the server-only logic into dedicated backend service files and removed unnecessary imports from client components.

Another issue appeared during PDF generation where the build failed because jsPDF relied on browser APIs unavailable during server rendering. I tested dynamic imports and eventually moved PDF generation completely into server-side route handlers.

What finally worked was:
- isolating backend logic,
- restructuring imports,
- separating client/server responsibilities,
- and testing production builds locally using `npm run build`.

The experience taught me that many “deployment bugs” are actually architecture boundary problems rather than syntax issues.

---

# 2. A decision I reversed mid-week, and what made me reverse it

One major decision I reversed was requiring users to authenticate before starting an audit. Initially, I planned to use Clerk authentication from the beginning because I thought collecting user accounts early would help with retention, analytics, and future dashboard features.

After sketching the onboarding flow and discussing the idea with a few people, I realized authentication created unnecessary friction for a product whose core value proposition is “get instant AI savings insights in 2 minutes.” Requiring signup before seeing any value contradicted the product’s purpose.

I noticed that many users exploring AI tools are casual builders, indie hackers, or small startup founders who quickly abandon products with long onboarding flows. I also realized that users may hesitate to share company information before understanding whether the audit is useful.

Because of that, I reversed the decision and redesigned the flow around anonymous audits. Users can now:
- complete the audit,
- see recommendations,
- estimate savings,
- and only provide an email after receiving value.

This significantly simplified the user experience and aligned better with modern product-led growth patterns. I still kept the architecture flexible enough to support accounts later if team dashboards or historical tracking become important.

The reversal taught me that optimizing for lower friction often matters more than collecting maximum data early.

---

# 3. What I would build in week 2 if I had it

If I had a second week to continue building TrackSpend AI, I would focus on transforming it from a static audit tool into a more intelligent AI spend optimization platform.

The first feature I would build is AI tool overlap detection using categorized workflows. Instead of simply listing subscriptions, the platform would understand which tools overlap in areas like coding, research, writing, or search. For example, it could detect that a user pays for both Claude and ChatGPT primarily for research tasks and suggest consolidation opportunities.

Second, I would implement benchmarking features. Users would see comparisons like:
- “Your AI spend is 35% higher than similar 5-person startups.”
- “Most teams your size use 2 AI tools instead of 5.”

That type of context makes recommendations more persuasive.

Third, I would redesign the backend architecture for scalability by introducing background job processing for:
- PDF generation,
- email delivery,
- AI summary generation.

Currently, these operations happen synchronously and would not scale efficiently to high traffic volumes.

I would also add:
- analytics dashboards,
- audit history,
- usage trend tracking,
- and Slack/email weekly reports.

Finally, I would improve the recommendation engine using real user feedback collected from audits rather than relying entirely on manually written optimization rules.

The goal for week 2 would be evolving the project from an MVP into a smarter operational tool with stronger long-term retention.

---

# 4. How I used AI tools

I used multiple AI tools throughout the project, mainly:
- ChatGPT,
- Claude,
- GitHub Copilot,
- and Windsurf.

I used ChatGPT primarily for architecture brainstorming, debugging assistance, UI copywriting, and refining product positioning. Claude was especially useful for generating professional and concise executive summaries because its writing style felt more natural for business-oriented reports. GitHub Copilot and Windsurf helped accelerate repetitive coding tasks such as component scaffolding, utility functions, and TypeScript boilerplate.

However, I did not fully trust AI tools with:
- financial recommendation logic,
- pricing calculations,
- architecture decisions,
- or deployment debugging.

For example, one specific case where AI was wrong happened during deployment troubleshooting. An AI-generated suggestion recommended importing a server-side Prisma utility directly inside a client component to “simplify data access.” The code looked valid syntactically, but it caused build failures and runtime issues in Next.js because server-only modules cannot be bundled into client components.

I caught the mistake after carefully checking the import chain and noticing that the error only occurred during production builds. I fixed it by separating backend logic into dedicated server-side service files.

That experience reinforced an important lesson: AI tools are excellent accelerators, but they still require engineering judgment and careful validation, especially for architecture and production deployment decisions.

---

# 5. Self-rating

## Discipline — 9/10
I maintained consistent progress across development, debugging, deployment, testing, and documentation even when deployment issues slowed momentum.

## Code Quality — 8/10
I focused on modular architecture, TypeScript safety, and separation of concerns, but some recommendation logic and service structure still need refactoring for long-term scalability.

## Design Sense — 9/10
I paid close attention to modern SaaS UI patterns, responsive layouts, visual hierarchy, and reducing onboarding friction while keeping the interface clean and minimal.

## Problem-Solving — 9/10
I handled several deployment and architecture issues by forming hypotheses, isolating problems systematically, and testing production behavior instead of relying only on AI-generated fixes.

## Entrepreneurial Thinking — 9/10
I approached the project not just as a technical build but as a product with user pain points, lead generation strategy, conversion flow, scalability considerations, and future monetization opportunities.