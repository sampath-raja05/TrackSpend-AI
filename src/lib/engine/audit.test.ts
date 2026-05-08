import { describe, expect, it } from 'vitest';
import type { SpendItem } from '@/lib/types';
import { runAudit } from './audit';

function buildSpendItem(overrides: Partial<SpendItem> = {}): SpendItem {
  return {
    id: overrides.id ?? 'item-1',
    toolId: overrides.toolId ?? 'github-copilot',
    toolName: overrides.toolName ?? 'GitHub Copilot',
    currentPlan: overrides.currentPlan ?? 'Business',
    monthlySpend: overrides.monthlySpend ?? 38,
    seats: overrides.seats ?? 2,
    teamSize: overrides.teamSize ?? 2,
    useCase: overrides.useCase ?? 'coding',
  };
}

describe('runAudit', () => {
  it('recommends downgrading oversized plans for small teams', () => {
    const result = runAudit([buildSpendItem()]);
    const downgrade = result.items[0].recommendations.find(
      recommendation => recommendation.type === 'downgrade'
    );

    expect(downgrade?.alternativePlan).toBe('Individual');
    expect(result.totalMonthlySavings).toBe(18);
  });

  it('calculates annual savings from the monthly total', () => {
    const result = runAudit([buildSpendItem()]);

    expect(result.totalAnnualSavings).toBe(result.totalMonthlySavings * 12);
  });

  it('uses the largest high-confidence recommendation when several apply', () => {
    const result = runAudit([
      buildSpendItem({
        monthlySpend: 190,
        seats: 10,
        teamSize: 3,
      }),
    ]);

    expect(result.items[0].totalMonthlySavings).toBe(133);
  });

  it('suggests lower-cost alternatives for expensive coding assistants', () => {
    const result = runAudit([
      buildSpendItem({
        id: 'cursor-1',
        toolId: 'cursor',
        toolName: 'Cursor',
        currentPlan: 'Business',
        monthlySpend: 80,
        seats: 2,
        teamSize: 2,
      }),
    ]);

    const alternative = result.items[0].recommendations.find(
      recommendation =>
        recommendation.type === 'alternative' &&
        recommendation.alternativeTool === 'GitHub Copilot'
    );

    expect(alternative).toBeDefined();
    expect(alternative?.monthlySavings).toBeGreaterThan(0);
  });

  it('does not suggest individual-grade alternatives for a team-grade Copilot setup', () => {
    const result = runAudit([
      buildSpendItem({
        monthlySpend: 190,
        seats: 10,
        teamSize: 10,
      }),
    ]);

    expect(result.totalMonthlySavings).toBe(0);
    expect(
      result.items[0].recommendations.some(
        recommendation =>
          recommendation.type === 'alternative' &&
          recommendation.alternativeTool === 'Windsurf'
      )
    ).toBe(false);
    expect(result.items[0].recommendations.some(rec => rec.type === 'efficient')).toBe(true);
  });

  it('surfaces discounted credit opportunities for large retail AI spend', () => {
    const result = runAudit([
      buildSpendItem({
        toolId: 'openai-api',
        toolName: 'OpenAI API',
        currentPlan: 'API Direct',
        monthlySpend: 1200,
        seats: 1,
        teamSize: 6,
        useCase: 'mixed',
      }),
    ]);

    const creditRecommendation = result.items[0].recommendations.find(
      recommendation => recommendation.type === 'switch-plan'
    );

    expect(creditRecommendation?.title).toContain('TrackSpend AI');
    expect(creditRecommendation?.monthlySavings).toBe(240);
  });

  it('produces different primary recommendations for different inputs', () => {
    const oversizedSeats = runAudit([
      buildSpendItem({
        monthlySpend: 190,
        seats: 10,
        teamSize: 3,
      }),
    ]);
    const highApiSpend = runAudit([
      buildSpendItem({
        id: 'api-1',
        toolId: 'anthropic-api',
        toolName: 'Anthropic API',
        currentPlan: 'API Direct',
        monthlySpend: 800,
        seats: 1,
        teamSize: 8,
        useCase: 'research',
      }),
    ]);

    expect(oversizedSeats.items[0].recommendations[0].type).toBe('optimize-seats');
    expect(highApiSpend.items[0].recommendations[0].type).toBe('switch-plan');
  });

  it('marks already-efficient spending honestly when there is nothing to save', () => {
    const result = runAudit([
      buildSpendItem({
        toolId: 'chatgpt',
        toolName: 'ChatGPT',
        currentPlan: 'Plus',
        monthlySpend: 20,
        seats: 1,
        teamSize: 10,
        useCase: 'writing',
      }),
    ]);

    expect(result.totalMonthlySavings).toBe(0);
    expect(result.savingsCategory).toBe('optimized');
    expect(result.items[0].recommendations.some(rec => rec.type === 'efficient')).toBe(true);
  });

  it('uses realistic per-1k token pricing for API migration checks', () => {
    const result = runAudit([
      buildSpendItem({
        toolId: 'claude',
        toolName: 'Claude',
        currentPlan: 'Max',
        monthlySpend: 100,
        seats: 1,
        teamSize: 1,
      }),
    ]);

    const apiMigration = result.items[0].recommendations.find(
      recommendation => recommendation.type === 'api-migration'
    );

    expect(apiMigration).toBeDefined();
    expect(apiMigration?.recommendedCost).toBe(25);
    expect(apiMigration?.monthlySavings).toBe(75);
  });
});
