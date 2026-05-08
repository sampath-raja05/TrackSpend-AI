# Prompts

## Anthropic System Prompt

```text
You are a friendly AI spend advisor helping startup founders and developers optimize their AI subscription spending.

Write short, professional, and actionable summaries in a human tone.

Rules:
- Never invent pricing information
- Never exaggerate savings
- Be honest if the spending is already reasonable
- Focus on the biggest optimization opportunity
- Keep the summary concise and easy to understand
- Avoid technical jargon
- Sound practical, not sales-focused
```

---

## Anthropic User Prompt Template

```text
Write a personalized AI spend audit summary.

AUDIT DATA:

Team Size: 4

Total Monthly Spend: $380

Estimated Monthly Savings: $120

Annual Savings Opportunity: $1440

Efficiency Score: 72/100

TOOLS:
- ChatGPT 
- Claude 
- GitHub 
- Windsurf 

AUDIT FINDINGS:
- Overlapping coding assistant subscriptions detected
- ChatGPT and Claude used for similar research workflows
- Multiple premium subscriptions active for a small team
- Some features are underutilized compared to subscription cost
- Potential consolidation opportunity between Copilot and Windsurf

RULES:
- Mention the biggest optimization opportunity
- Suggest one practical action they can take this week
- Keep the response under 100 words
- Do not use bullet points
- Sound human and professional
```

---

# Why I Wrote the Prompt This Way

The audit engine already handles:
- pricing calculations,
- savings estimates,
- and optimization logic.

The LLM is only responsible for turning the audit data into a short, readable summary.

I added rules like:
- “Never exaggerate savings”
- “Be honest if the spending is already reasonable”

because trust is important for financial recommendations.

I also kept the output short and structured so it works well inside the dashboard and audit results page.

The prompt focuses on:
- clarity,
- actionable advice,
- and professional tone

instead of sounding overly robotic or sales-heavy.

---

# What I Tried That Didn’t Work

## Fully AI-Generated Recommendations

Initially, I let the AI generate savings recommendations directly from raw user input.

This caused:
- inconsistent recommendations,
- incorrect savings estimates,
- and unrealistic suggestions.

For example, the AI sometimes recommended removing important tools entirely even when they were part of the user’s daily workflow.

Because of this, I moved all:
- calculations,
- pricing analysis,
- and recommendation logic

into deterministic TypeScript code.

---

## Very Large Prompts

I also experimented with very long prompts containing:
- pricing tables,
- tool comparisons,
- and workflow descriptions.

This created:
- slower responses,
- repetitive summaries,
- and less readable outputs.

Simplifying the prompt improved consistency and response quality.

---

## Creative Startup Tone

I tested prompts asking the AI to sound:
- highly energetic,
- persuasive,
- or startup-marketing focused.

The output felt too exaggerated and less trustworthy.

A calmer and more professional tone worked much better for audit summaries.