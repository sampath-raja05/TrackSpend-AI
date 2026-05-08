/**
 * AI Summary Generation Service
 * Uses Anthropic Claude API to generate personalized audit summaries.
 */

import type { AuditResult } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

interface SummaryInput {
  auditResult: AuditResult;
}

export async function generateAuditSummary({ auditResult }: SummaryInput): Promise<string> {
  if (!ANTHROPIC_API_KEY) {
    console.warn('ANTHROPIC_API_KEY not set — using fallback summary');
    return generateFallbackSummary(auditResult);
  }

  try {
    const prompt = buildPrompt(auditResult);

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 300,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        system: `You are a friendly, financially literate AI spend advisor for startup founders and engineering leaders. You write concise, actionable summaries in a warm but professional tone. Never use jargon. Never inflate savings. Be honest when spending is already efficient. Keep summaries under 100 words.`,
      }),
    });

    if (!response.ok) {
      console.error('Anthropic API error:', response.status);
      return generateFallbackSummary(auditResult);
    }

    const data = await response.json();
    const summary = data.content?.[0]?.text;

    if (!summary) {
      return generateFallbackSummary(auditResult);
    }

    return summary.trim();
  } catch (error) {
    console.error('AI summary generation failed:', error);
    return generateFallbackSummary(auditResult);
  }
}

function buildPrompt(audit: AuditResult): string {
  const toolBreakdown = audit.items.map(item => {
    const recs = item.recommendations
      .filter(r => r.type !== 'efficient')
      .map(r => `- ${r.title}: save ${formatCurrency(r.monthlySavings)}/mo (${r.confidence} confidence)`)
      .join('\n');
    
    return `Tool: ${item.spendItem.toolName} (${item.spendItem.currentPlan})
Spend: ${formatCurrency(item.spendItem.monthlySpend)}/mo | Seats: ${item.spendItem.seats} | Team: ${item.spendItem.teamSize}
Efficiency: ${item.efficiencyScore}/100
${recs || '- Already optimized'}`;
  }).join('\n\n');

  return `Write a ~100-word personalized audit summary for a founder/engineering leader.

AUDIT DATA:
Total Monthly Spend: ${formatCurrency(audit.totalMonthlySpend)}
Total Monthly Savings Identified: ${formatCurrency(audit.totalMonthlySavings)}
Annual Savings: ${formatCurrency(audit.totalAnnualSavings)}
Overall Efficiency: ${audit.overallEfficiencyScore}/100
Savings Category: ${audit.savingsCategory}

BREAKDOWN:
${toolBreakdown}

RULES:
- If savings are small (<$100/mo), acknowledge efficient spending
- If savings are large (>$500/mo), emphasize the opportunity
- Be specific about the biggest opportunity
- Mention one concrete action they can take this week
- Sound human, not robotic
- Don't use bullet points in the summary`;
}

function generateFallbackSummary(audit: AuditResult): string {
  if (audit.savingsCategory === 'optimized') {
    return `Your AI tooling spend of ${formatCurrency(audit.totalMonthlySpend)}/month is well-optimized. Your current plans are well-matched to your team size and usage patterns. Keep monitoring as your team grows — plan requirements often change with scale.`;
  }

  if (audit.savingsCategory === 'low') {
    return `We found modest optimization opportunities in your ${formatCurrency(audit.totalMonthlySpend)}/month AI spend, with potential savings of ${formatCurrency(audit.totalMonthlySavings)}/month. Your spending is largely efficient, but a few small adjustments could save you ${formatCurrency(audit.totalAnnualSavings)} annually.`;
  }

  if (audit.savingsCategory === 'medium') {
    const topItem = audit.items.sort((a, b) => b.totalMonthlySavings - a.totalMonthlySavings)[0];
    return `We identified ${formatCurrency(audit.totalMonthlySavings)}/month in potential savings across your AI tooling — that's ${formatCurrency(audit.totalAnnualSavings)} annually. The biggest opportunity is optimizing your ${topItem?.spendItem.toolName} usage. Review the recommendations below for specific steps to reduce costs without sacrificing productivity.`;
  }

  // High savings
  const topItem = audit.items.sort((a, b) => b.totalMonthlySavings - a.totalMonthlySavings)[0];
  return `There's a significant opportunity to optimize your AI spend. We found ${formatCurrency(audit.totalMonthlySavings)}/month in potential savings (${formatCurrency(audit.totalAnnualSavings)}/year). Your ${topItem?.spendItem.toolName} spending stands out as the primary optimization target. Consider scheduling a TrackSpend AI consultation to build a migration plan that minimizes workflow disruption.`;
}
