import { z } from 'zod';

const useCaseSchema = z.enum([
  'coding',
  'writing',
  'research',
  'data-analysis',
  'mixed',
]);

const spendItemSchema = z.object({
  id: z.string().min(1),
  toolId: z.string().min(1),
  toolName: z.string().min(1),
  currentPlan: z.string().min(1),
  monthlySpend: z.number().min(0),
  seats: z.number().int().min(1),
  teamSize: z.number().int().min(1),
  useCase: useCaseSchema,
});

const leadSchema = z.object({
  email: z.string().email(),
  companyName: z.string().trim().min(1).optional(),
  role: z.string().trim().min(1).optional(),
  teamSize: z.string().trim().min(1).optional(),
});

export const createAuditRequestSchema = z.object({
  items: z.array(spendItemSchema).min(1),
  lead: leadSchema,
});
