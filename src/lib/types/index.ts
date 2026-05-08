import type { UseCase } from '@/lib/constants/pricing';

// ─── Spend Input Types ──────────────────────────────────────────────

export interface SpendItem {
  id: string;
  toolId: string;
  toolName: string;
  currentPlan: string;
  monthlySpend: number;
  seats: number;
  teamSize: number;
  useCase: UseCase;
}

export interface SpendFormData {
  items: SpendItem[];
}

// ─── Audit Engine Types ─────────────────────────────────────────────

export type RecommendationType = 
  | 'downgrade' 
  | 'switch-plan'
  | 'alternative' 
  | 'api-migration'
  | 'consolidate'
  | 'optimize-seats'
  | 'efficient';

export interface Recommendation {
  type: RecommendationType;
  title: string;
  description: string;
  currentCost: number;
  recommendedCost: number;
  monthlySavings: number;
  confidence: 'high' | 'medium' | 'low';
  reasoning: string;
  alternativeTool?: string;
  alternativePlan?: string;
}

export interface AuditItemResult {
  spendItem: SpendItem;
  recommendations: Recommendation[];
  totalMonthlySavings: number;
  isEfficient: boolean;
  efficiencyScore: number; // 0-100
}

export interface AuditResult {
  id: string;
  createdAt: string;
  items: AuditItemResult[];
  totalMonthlySpend: number;
  totalMonthlySavings: number;
  totalAnnualSavings: number;
  overallEfficiencyScore: number;
  aiSummary?: string;
  savingsCategory: 'high' | 'medium' | 'low' | 'optimized';
}

// ─── Lead Capture Types ─────────────────────────────────────────────

export interface LeadData {
  email: string;
  companyName?: string;
  role?: string;
  teamSize?: string;
  auditId: string;
  totalSavings: number;
}

// ─── Public Report Types ────────────────────────────────────────────

export interface PublicReport {
  id: string;
  slug: string;
  auditResult: Omit<AuditResult, 'aiSummary'> & { aiSummary?: string };
  createdAt: string;
  viewCount: number;
}

// ─── API Response Types ─────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// ─── Form State Types ───────────────────────────────────────────────

export interface FormStep {
  id: number;
  title: string;
  description: string;
  isComplete: boolean;
}
