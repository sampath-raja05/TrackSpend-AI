import { getToolById, type AITool, type PlanTier } from '@/lib/constants/pricing';
import type {
  SpendItem,
  AuditItemResult,
  AuditResult,
  Recommendation,
} from '@/lib/types';
import { generateId, getSavingsCategory } from '@/lib/utils';

// ─── Main Audit Function ────────────────────────────────────────────

export function runAudit(items: SpendItem[]): AuditResult {
  const auditItems = items.map(item => analyzeSpendItem(item, items));
  
  const totalMonthlySpend = items.reduce((sum, item) => sum + item.monthlySpend, 0);
  const totalMonthlySavings = auditItems.reduce((sum, item) => sum + item.totalMonthlySavings, 0);
  const totalAnnualSavings = totalMonthlySavings * 12;
  
  const avgEfficiency = auditItems.length > 0
    ? Math.round(auditItems.reduce((sum, item) => sum + item.efficiencyScore, 0) / auditItems.length)
    : 100;

  return {
    id: generateId(),
    createdAt: new Date().toISOString(),
    items: auditItems,
    totalMonthlySpend,
    totalMonthlySavings,
    totalAnnualSavings,
    overallEfficiencyScore: avgEfficiency,
    savingsCategory: getSavingsCategory(totalMonthlySavings),
  };
}

// ─── Per-Item Analysis ──────────────────────────────────────────────

function analyzeSpendItem(item: SpendItem, allItems: SpendItem[]): AuditItemResult {
  const recommendations: Recommendation[] = [];
  const tool = getToolById(item.toolId);

  if (!tool) {
    return {
      spendItem: item,
      recommendations: [],
      totalMonthlySavings: 0,
      isEfficient: true,
      efficiencyScore: 100,
    };
  }

  // Run all analysis checks
  const planDowngrade = checkPlanDowngrade(item, tool);
  if (planDowngrade) recommendations.push(planDowngrade);

  const seatOptimization = checkSeatOptimization(item, tool);
  if (seatOptimization) recommendations.push(seatOptimization);

  const apiMigration = checkApiMigration(item, tool);
  if (apiMigration) recommendations.push(apiMigration);

  const alternatives = checkAlternatives(item, tool, allItems);
  alternatives.forEach(alt => recommendations.push(alt));

  const retailCredits = checkRetailCreditOpportunity(item, tool);
  if (retailCredits) recommendations.push(retailCredits);

  const consolidation = checkConsolidation(item, allItems);
  if (consolidation) recommendations.push(consolidation);

  // Calculate total savings (use highest non-overlapping recommendations)
  const totalMonthlySavings = calculateBestSavings(recommendations);
  
  // Calculate efficiency score
  const efficiencyScore = calculateEfficiencyScore(item, totalMonthlySavings);
  
  // If no meaningful savings, mark as efficient
  if (totalMonthlySavings < 5) {
    recommendations.push({
      type: 'efficient',
      title: 'Already optimized',
      description: `Your ${item.toolName} ${item.currentPlan} plan is well-matched for your usage.`,
      currentCost: item.monthlySpend,
      recommendedCost: item.monthlySpend,
      monthlySavings: 0,
      confidence: 'high',
      reasoning: `Given your team size of ${item.teamSize} and ${item.useCase} use case, this plan provides good value.`,
    });
  }

  return {
    spendItem: item,
    recommendations: recommendations.sort((a, b) => b.monthlySavings - a.monthlySavings),
    totalMonthlySavings,
    isEfficient: totalMonthlySavings < 5,
    efficiencyScore,
  };
}

// ─── Check: Plan Downgrade ──────────────────────────────────────────

function checkPlanDowngrade(item: SpendItem, tool: AITool): Recommendation | null {
  const currentPlan = tool.plans.find(p => p.name === item.currentPlan);
  if (!currentPlan) return null;

  const currentIndex = tool.plans.indexOf(currentPlan);
  
  // Check if a lower plan would suffice
  for (let i = currentIndex - 1; i >= 0; i--) {
    const lowerPlan = tool.plans[i];
    
    // Skip free plans for teams
    if (lowerPlan.monthlyPricePerSeat === 0 && item.teamSize > 1) continue;
    
    // Skip plans with min seat requirements that don't match
    if (lowerPlan.minSeats && item.seats < lowerPlan.minSeats) continue;

    // Business/Enterprise → Pro downgrade logic
    if (isBusinessPlanOverkill(item, currentPlan, lowerPlan)) {
      const currentTotal = currentPlan.monthlyPricePerSeat * item.seats;
      const lowerTotal = lowerPlan.monthlyPricePerSeat * item.seats;
      const savings = currentTotal - lowerTotal;

      if (savings > 0 && item.monthlySpend >= currentTotal * 0.8) {
        return {
          type: 'downgrade',
          title: `Downgrade to ${tool.name} ${lowerPlan.name}`,
          description: `Your team of ${item.teamSize} may not need ${currentPlan.name}-tier features.`,
          currentCost: item.monthlySpend,
          recommendedCost: lowerTotal,
          monthlySavings: item.monthlySpend - lowerTotal,
          confidence: item.teamSize <= 3 ? 'high' : 'medium',
          reasoning: generateDowngradeReasoning(item, currentPlan, lowerPlan),
          alternativePlan: lowerPlan.name,
        };
      }
    }
  }

  return null;
}

function isBusinessPlanOverkill(item: SpendItem, current: PlanTier, lower: PlanTier): boolean {
  // Team/Business/Enterprise plans for small teams
  if (
    (current.name === 'Business' || current.name === 'Enterprise' || current.name === 'Team') &&
    item.teamSize <= 3 &&
    (lower.name === 'Pro' || lower.name === 'Individual' || lower.name === 'Plus')
  ) {
    return true;
  }

  // Enterprise for medium teams
  if (current.name === 'Enterprise' && item.teamSize <= 10 && 
      (lower.name === 'Business' || lower.name === 'Team')) {
    return true;
  }

  // Max plan for non-heavy users
  if (current.name === 'Max' && item.useCase !== 'coding' && lower.name === 'Pro') {
    return true;
  }

  // Ultra for non-enterprise
  if (current.name === 'Ultra' && item.teamSize <= 5) {
    return true;
  }

  return false;
}

function generateDowngradeReasoning(item: SpendItem, current: PlanTier, lower: PlanTier): string {
  if (item.teamSize <= 2) {
    return `With only ${item.teamSize} user${item.teamSize === 1 ? '' : 's'}, you're paying for ${current.name}-tier features like admin dashboards and SSO that provide minimal value at your scale. ${lower.name} covers your ${item.useCase} workflow needs.`;
  }
  if (item.teamSize <= 5) {
    return `For a team of ${item.teamSize}, the ${current.name} plan's enterprise features (SSO, audit logs, dedicated support) are likely underutilized. The ${lower.name} plan still provides strong ${item.useCase} capabilities.`;
  }
  return `Consider whether your team of ${item.teamSize} actively uses the ${current.name}-specific features. If admin controls and compliance features aren't critical yet, ${lower.name} offers excellent value.`;
}

// ─── Check: Seat Optimization ───────────────────────────────────────

function checkSeatOptimization(item: SpendItem, tool: AITool): Recommendation | null {
  if (item.seats <= item.teamSize) return null;
  if (item.seats - item.teamSize < 2) return null; // Don't flag 1 extra seat
  
  const currentPlan = tool.plans.find(p => p.name === item.currentPlan);
  if (!currentPlan || currentPlan.monthlyPricePerSeat === 0) return null;

  const excessSeats = item.seats - item.teamSize;
  const savings = excessSeats * currentPlan.monthlyPricePerSeat;

  return {
    type: 'optimize-seats',
    title: `Remove ${excessSeats} unused ${tool.name} seats`,
    description: `You have ${item.seats} seats but only ${item.teamSize} team members actively using ${tool.name}.`,
    currentCost: item.monthlySpend,
    recommendedCost: item.monthlySpend - savings,
    monthlySavings: savings,
    confidence: 'high',
    reasoning: `You're paying for ${excessSeats} seat${excessSeats > 1 ? 's' : ''} that no one is using. At ${formatSimpleCurrency(currentPlan.monthlyPricePerSeat)}/seat/month, that's ${formatSimpleCurrency(savings)} in wasted spend. Remove inactive seats from your ${item.currentPlan} plan.`,
  };
}

// ─── Check: API Migration ───────────────────────────────────────────

function checkApiMigration(item: SpendItem, tool: AITool): Recommendation | null {
  // Only suggest API for coding/data-analysis use cases with small teams
  if (item.useCase !== 'coding' && item.useCase !== 'data-analysis') return null;
  if (!tool.apiPricing) return null;
  if (item.currentPlan === 'API Direct' || item.currentPlan === 'API') return null;
  if (item.teamSize > 3) return null; // API management overhead for larger teams
  
  // Estimate API cost based on moderate usage
  // Assume ~100K tokens/day for coding, ~200K for data analysis
  const dailyTokens = item.useCase === 'data-analysis' ? 200000 : 100000;
  const monthlyTokens = dailyTokens * 22; // ~22 working days
  const estimatedApiCost = (
    ((monthlyTokens / 1000) * 0.3 * tool.apiPricing.inputPer1kTokens) + // 30% input
    ((monthlyTokens / 1000) * 0.7 * tool.apiPricing.outputPer1kTokens)  // 70% output
  ) * item.seats;

  const savings = item.monthlySpend - estimatedApiCost;
  
  if (savings > 10 && savings / item.monthlySpend > 0.15) {
    return {
      type: 'api-migration',
      title: `Consider ${tool.name} API direct access`,
      description: `For ${item.useCase}, API access may be more cost-effective than a ${item.currentPlan} subscription.`,
      currentCost: item.monthlySpend,
      recommendedCost: Math.round(estimatedApiCost),
      monthlySavings: Math.round(savings),
      confidence: 'medium',
      reasoning: `Based on moderate ${item.useCase} usage (~${Math.round(monthlyTokens / 1000)}K tokens/month per user), API access at ${tool.apiPricing.description} could cost approximately ${formatSimpleCurrency(Math.round(estimatedApiCost))}/month vs your current ${formatSimpleCurrency(item.monthlySpend)}. Note: this requires API integration work.`,
    };
  }

  return null;
}

// ─── Check: Alternatives ────────────────────────────────────────────

function checkAlternatives(item: SpendItem, tool: AITool, allItems: SpendItem[]): Recommendation[] {
  const recommendations: Recommendation[] = [];
  const alreadyUsedTools = new Set(allItems.map(i => i.toolId));

  // Coding assistant alternatives
  if (tool.category === 'coding-assistant' && item.monthlySpend > 25 && isCodingUseCase(item)) {
    const alternativeTools = ['github-copilot', 'cursor', 'windsurf']
      .filter(toolId => toolId !== item.toolId && !alreadyUsedTools.has(toolId))
      .map(toolId => getToolById(toolId))
      .filter((alternativeTool): alternativeTool is AITool => Boolean(alternativeTool));

    for (const alternativeTool of alternativeTools) {
      const alternativePlan = getComparableAlternativePlan(item, alternativeTool);
      if (!alternativePlan) continue;

      const alt = {
        name: alternativeTool.name,
        plan: alternativePlan.name,
        cost: alternativePlan.monthlyPricePerSeat * item.seats,
        note: getAlternativeNote(alternativeTool.id),
      };
      const savings = item.monthlySpend - alt.cost;
      if (savings > 10) {
        recommendations.push({
          type: 'alternative',
          title: `Consider ${alt.name} ${alt.plan}`,
          description: alt.note,
          currentCost: item.monthlySpend,
          recommendedCost: alt.cost,
          monthlySavings: savings,
          confidence: 'low',
          reasoning: `${alt.name} (${alt.plan} at ${formatSimpleCurrency(alt.cost)}/month for ${item.seats} seat${item.seats > 1 ? 's' : ''}) could replace ${item.toolName} ${item.currentPlan}. ${alt.note}. However, switching tools involves workflow disruption and learning curves.`,
          alternativeTool: alt.name,
          alternativePlan: alt.plan,
        });
      }
    }
  }

  // AI chat alternatives
  if (tool.category === 'ai-chat' && item.monthlySpend > 30) {
    if (item.toolId === 'chatgpt' && !alreadyUsedTools.has('claude')) {
      const claudePro = 20 * item.seats;
      const savings = item.monthlySpend - claudePro;
      if (savings > 5) {
        recommendations.push({
          type: 'alternative',
          title: 'Consider Claude Pro',
          description: 'Strong for coding and research with extended context windows.',
          currentCost: item.monthlySpend,
          recommendedCost: claudePro,
          monthlySavings: savings,
          confidence: 'low',
          reasoning: `Claude Pro at ${formatSimpleCurrency(claudePro)}/month offers comparable capabilities for ${item.useCase}, with advantages in longer context and structured output. Switching AI assistants requires team adaptation.`,
          alternativeTool: 'Claude',
          alternativePlan: 'Pro',
        });
      }
    }

    if (item.toolId === 'claude' && !alreadyUsedTools.has('chatgpt')) {
      const chatgptPlus = 20 * item.seats;
      const savings = item.monthlySpend - chatgptPlus;
      if (savings > 5) {
        recommendations.push({
          type: 'alternative',
          title: 'Consider ChatGPT Plus',
          description: 'Strong ecosystem with DALL·E, data analysis, and custom GPTs.',
          currentCost: item.monthlySpend,
          recommendedCost: chatgptPlus,
          monthlySavings: savings,
          confidence: 'low',
          reasoning: `ChatGPT Plus at ${formatSimpleCurrency(chatgptPlus)}/month offers a broad ecosystem for ${item.useCase}, including image generation and data analysis tools. Consider if the OpenAI ecosystem better fits your workflow.`,
          alternativeTool: 'ChatGPT',
          alternativePlan: 'Plus',
        });
      }
    }
  }

  return recommendations;
}

// ─── Check: Consolidation ───────────────────────────────────────────

function isCodingUseCase(item: SpendItem): boolean {
  return item.useCase === 'coding' || item.useCase === 'mixed';
}

function getComparableAlternativePlan(item: SpendItem, alternativeTool: AITool): PlanTier | null {
  const paidPlans = alternativeTool.plans.filter(plan => plan.monthlyPricePerSeat > 0);

  if (item.seats >= 25 || item.currentPlan === 'Enterprise') {
    return paidPlans.find(plan => plan.name === 'Enterprise') ?? null;
  }

  if (item.seats >= 4 || item.currentPlan === 'Business' || item.currentPlan === 'Team') {
    return paidPlans.find(plan => plan.name === 'Business' || plan.name === 'Team') ?? null;
  }

  return paidPlans.find(plan =>
    plan.name === 'Individual' ||
    plan.name === 'Pro' ||
    plan.name === 'Plus'
  ) ?? null;
}

function getAlternativeNote(toolId: string): string {
  if (toolId === 'github-copilot') {
    return 'Excellent IDE integration and GitHub-native workflows';
  }

  if (toolId === 'cursor') {
    return 'AI-native editor with strong coding-agent workflows';
  }

  if (toolId === 'windsurf') {
    return 'AI-native editor with Cascade flows and team collaboration';
  }

  return 'Comparable core capabilities at a lower total cost';
}

function checkRetailCreditOpportunity(item: SpendItem, tool: AITool): Recommendation | null {
  const isCreditEligible =
    tool.id === 'cursor' ||
    tool.id === 'claude' ||
    tool.id === 'chatgpt' ||
    tool.id === 'anthropic-api' ||
    tool.id === 'openai-api';

  if (!isCreditEligible) return null;
  if (item.monthlySpend < 500) return null;

  const conservativeDiscountRate = 0.2;
  const monthlySavings = Math.round(item.monthlySpend * conservativeDiscountRate);

  return {
    type: 'switch-plan',
    title: 'Source discounted credits through TrackSpend AI',
    description: `Your ${tool.name} spend is high enough that discounted credits are worth evaluating.`,
    currentCost: item.monthlySpend,
    recommendedCost: item.monthlySpend - monthlySavings,
    monthlySavings,
    confidence: 'medium',
    reasoning: `At ${formatSimpleCurrency(item.monthlySpend)}/month, even a conservative 20% credit discount would save about ${formatSimpleCurrency(monthlySavings)}/month without changing your team's ${item.useCase} workflow. This is strongest for committed API, enterprise, or annualized spend where usage is predictable.`,
  };
}

function checkConsolidation(item: SpendItem, allItems: SpendItem[]): Recommendation | null {
  // Find overlapping tools in the same category
  const sameCategory = allItems.filter(
    i => i.id !== item.id && getToolById(i.toolId)?.category === getToolById(item.toolId)?.category
  );

  if (sameCategory.length === 0) return null;

  // Flag if user has multiple coding assistants or AI chats
  const tool = getToolById(item.toolId);
  if (!tool) return null;

  if (tool.category === 'coding-assistant' && sameCategory.length >= 1) {
    const otherNames = sameCategory.map(i => i.toolName).join(' and ');
    const potentialSavings = Math.min(item.monthlySpend, ...sameCategory.map(i => i.monthlySpend));
    
    if (potentialSavings > 15) {
      return {
        type: 'consolidate',
        title: `Consolidate coding assistants`,
        description: `You're using both ${item.toolName} and ${otherNames}. Consider standardizing on one.`,
        currentCost: item.monthlySpend,
        recommendedCost: 0,
        monthlySavings: potentialSavings,
        confidence: 'medium',
        reasoning: `Running multiple coding assistants (${item.toolName} + ${otherNames}) creates overlapping costs. Most teams can standardize on one tool. Evaluate which provides the best experience for your ${item.useCase} workflows and consolidate.`,
      };
    }
  }

  if (tool.category === 'ai-chat' && sameCategory.length >= 1) {
    const otherNames = sameCategory.map(i => i.toolName).join(' and ');
    const potentialSavings = Math.min(item.monthlySpend, ...sameCategory.map(i => i.monthlySpend));
    
    if (potentialSavings > 15) {
      return {
        type: 'consolidate',
        title: `Consolidate AI chat tools`,
        description: `You're paying for both ${item.toolName} and ${otherNames}.`,
        currentCost: item.monthlySpend,
        recommendedCost: 0,
        monthlySavings: potentialSavings,
        confidence: 'medium',
        reasoning: `Multiple AI chat subscriptions (${item.toolName} + ${otherNames}) often indicate overlapping use. Unless your team needs specific capabilities from each, consolidating to one can save ${formatSimpleCurrency(potentialSavings)}/month.`,
      };
    }
  }

  return null;
}

// ─── Savings Calculation ────────────────────────────────────────────

function calculateBestSavings(recommendations: Recommendation[]): number {
  // Take the highest-confidence, highest-savings recommendation
  // Don't double-count overlapping recommendations
  const actionable = recommendations.filter(r => r.type !== 'efficient');
  if (actionable.length === 0) return 0;

  // Group by type priority
  const byConfidence = (confidence: Recommendation['confidence']) =>
    actionable
      .filter(recommendation => recommendation.confidence === confidence)
      .sort((a, b) => b.monthlySavings - a.monthlySavings);

  // Use highest confidence recommendation first
  const highConfidence = byConfidence('high');
  if (highConfidence.length > 0) {
    // Only low-confidence recommendations — use conservative estimate
    return Math.round(highConfidence[0].monthlySavings);
  }

  const mediumConfidence = byConfidence('medium');
  if (mediumConfidence.length > 0) {
    return Math.round(mediumConfidence[0].monthlySavings);
  }

  const lowConfidence = byConfidence('low');
  return Math.round(lowConfidence[0].monthlySavings * 0.5);
}

function calculateEfficiencyScore(item: SpendItem, savings: number): number {
  if (item.monthlySpend === 0) return 100;
  const savingsRatio = savings / item.monthlySpend;
  // More savings = lower efficiency score
  const score = Math.round((1 - savingsRatio) * 100);
  return Math.max(0, Math.min(100, score));
}

// ─── Helpers ────────────────────────────────────────────────────────

function formatSimpleCurrency(amount: number): string {
  return `$${amount.toLocaleString()}`;
}
