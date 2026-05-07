/**
 * AI Tool Pricing Database
 * 
 * Comprehensive, up-to-date pricing for all supported AI tools.
 * All prices are in USD per month unless noted otherwise.
 * Last verified: May 2026
 */

export interface PlanTier {
  name: string;
  monthlyPricePerSeat: number;
  features: string[];
  bestFor: string;
  minSeats?: number;
  annualDiscount?: number; // percentage off if billed annually
}

export interface AITool {
  id: string;
  name: string;
  category: 'coding-assistant' | 'ai-chat' | 'api-platform' | 'design-dev';
  logo: string;
  plans: PlanTier[];
  apiPricing?: {
    inputPer1kTokens: number;
    outputPer1kTokens: number;
    description: string;
  };
}

export const AI_TOOLS: AITool[] = [
  {
    id: 'cursor',
    name: 'Cursor',
    category: 'coding-assistant',
    logo: '/logos/cursor.svg',
    plans: [
      {
        name: 'Hobby',
        monthlyPricePerSeat: 0,
        features: ['2000 completions', '50 slow premium requests'],
        bestFor: 'Personal exploration',
      },
      {
        name: 'Pro',
        monthlyPricePerSeat: 20,
        features: ['Unlimited completions', '500 fast premium requests', 'Unlimited slow requests'],
        bestFor: 'Individual developers',
        annualDiscount: 17,
      },
      {
        name: 'Business',
        monthlyPricePerSeat: 40,
        features: ['Everything in Pro', 'Admin dashboard', 'SAML SSO', 'Usage analytics'],
        bestFor: 'Teams of 3-50',
        minSeats: 2,
        annualDiscount: 17,
      },
      {
        name: 'Enterprise',
        monthlyPricePerSeat: 40,
        features: ['Everything in Business', 'Custom contracts', 'Dedicated support', 'SLA'],
        bestFor: 'Large organizations',
        minSeats: 20,
      },
    ],
  },
  {
    id: 'github-copilot',
    name: 'GitHub Copilot',
    category: 'coding-assistant',
    logo: '/logos/copilot.svg',
    plans: [
      {
        name: 'Individual',
        monthlyPricePerSeat: 10,
        features: ['Code completions', 'Chat in IDE', 'CLI assistance'],
        bestFor: 'Individual developers',
        annualDiscount: 17,
      },
      {
        name: 'Business',
        monthlyPricePerSeat: 19,
        features: ['Everything in Individual', 'Organization management', 'Policy controls', 'IP indemnity'],
        bestFor: 'Teams and businesses',
        minSeats: 1,
      },
      {
        name: 'Enterprise',
        monthlyPricePerSeat: 39,
        features: ['Everything in Business', 'Fine-tuned models', 'Knowledge bases', 'SAML SSO'],
        bestFor: 'Large enterprises',
        minSeats: 25,
      },
    ],
  },
  {
    id: 'claude',
    name: 'Claude',
    category: 'ai-chat',
    logo: '/logos/claude.svg',
    plans: [
      {
        name: 'Free',
        monthlyPricePerSeat: 0,
        features: ['Basic access', 'Limited messages', 'Claude 3.5 Sonnet'],
        bestFor: 'Casual usage',
      },
      {
        name: 'Pro',
        monthlyPricePerSeat: 20,
        features: ['5x more usage', 'Claude 3.5 Opus', 'Priority access', 'Projects'],
        bestFor: 'Power users',
      },
      {
        name: 'Max',
        monthlyPricePerSeat: 100,
        features: ['20x more usage', 'Extended thinking', 'Maximum context', 'All models'],
        bestFor: 'Heavy professional use',
      },
      {
        name: 'Team',
        monthlyPricePerSeat: 30,
        features: ['Everything in Pro', 'Team workspace', 'Admin controls', 'Higher limits'],
        bestFor: 'Small teams',
        minSeats: 2,
        annualDiscount: 17,
      },
      {
        name: 'Enterprise',
        monthlyPricePerSeat: 60,
        features: ['Everything in Team', 'SSO/SCIM', 'Audit logs', 'Custom retention'],
        bestFor: 'Organizations',
        minSeats: 10,
      },
      {
        name: 'API Direct',
        monthlyPricePerSeat: 0,
        features: ['Pay per token', 'Full model access', 'No subscription needed'],
        bestFor: 'Developers building apps',
      },
    ],
    apiPricing: {
      inputPer1kTokens: 0.003,
      outputPer1kTokens: 0.015,
      description: 'Claude 3.5 Sonnet: $3/M input, $15/M output',
    },
  },
  {
    id: 'chatgpt',
    name: 'ChatGPT',
    category: 'ai-chat',
    logo: '/logos/chatgpt.svg',
    plans: [
      {
        name: 'Plus',
        monthlyPricePerSeat: 20,
        features: ['GPT-4o', 'DALL·E', 'Advanced data analysis', 'Custom GPTs'],
        bestFor: 'Individual power users',
      },
      {
        name: 'Team',
        monthlyPricePerSeat: 25,
        features: ['Everything in Plus', 'Workspace', 'Admin console', 'Higher limits'],
        bestFor: 'Small teams',
        minSeats: 2,
        annualDiscount: 17,
      },
      {
        name: 'Enterprise',
        monthlyPricePerSeat: 60,
        features: ['Everything in Team', 'SSO', 'Audit logs', 'Unlimited GPT-4o'],
        bestFor: 'Organizations',
        minSeats: 25,
      },
      {
        name: 'API Direct',
        monthlyPricePerSeat: 0,
        features: ['Pay per token', 'All models', 'Fine-tuning', 'Assistants API'],
        bestFor: 'Developers building apps',
      },
    ],
    apiPricing: {
      inputPer1kTokens: 0.005,
      outputPer1kTokens: 0.015,
      description: 'GPT-4o: $5/M input, $15/M output',
    },
  },
  {
    id: 'anthropic-api',
    name: 'Anthropic API',
    category: 'api-platform',
    logo: '/logos/anthropic.svg',
    plans: [
      {
        name: 'API Direct',
        monthlyPricePerSeat: 0,
        features: ['Pay per token', 'All Claude models', 'Batch API', 'Tool use'],
        bestFor: 'Production AI applications',
      },
    ],
    apiPricing: {
      inputPer1kTokens: 0.003,
      outputPer1kTokens: 0.015,
      description: 'Claude 3.5 Sonnet: $3/M input, $15/M output',
    },
  },
  {
    id: 'openai-api',
    name: 'OpenAI API',
    category: 'api-platform',
    logo: '/logos/openai.svg',
    plans: [
      {
        name: 'API Direct',
        monthlyPricePerSeat: 0,
        features: ['Pay per token', 'All GPT models', 'DALL·E', 'Whisper', 'Fine-tuning'],
        bestFor: 'Production AI applications',
      },
    ],
    apiPricing: {
      inputPer1kTokens: 0.005,
      outputPer1kTokens: 0.015,
      description: 'GPT-4o: $5/M input, $15/M output',
    },
  },
  {
    id: 'gemini',
    name: 'Gemini',
    category: 'ai-chat',
    logo: '/logos/gemini.svg',
    plans: [
      {
        name: 'Pro',
        monthlyPricePerSeat: 20,
        features: ['Gemini Advanced', '1M token context', 'Google integration', 'Gems'],
        bestFor: 'Google workspace users',
      },
      {
        name: 'Ultra',
        monthlyPricePerSeat: 250,
        features: ['Everything in Pro', 'Highest rate limits', 'Priority', '2M context'],
        bestFor: 'Enterprise-grade usage',
      },
      {
        name: 'API',
        monthlyPricePerSeat: 0,
        features: ['Pay per token', 'All Gemini models', 'Vertex AI integration'],
        bestFor: 'Developers and ML teams',
      },
    ],
    apiPricing: {
      inputPer1kTokens: 0.00125,
      outputPer1kTokens: 0.005,
      description: 'Gemini 1.5 Pro: $1.25/M input, $5/M output',
    },
  },
  {
    id: 'windsurf',
    name: 'Windsurf',
    category: 'coding-assistant',
    logo: '/logos/windsurf.svg',
    plans: [
      {
        name: 'Free',
        monthlyPricePerSeat: 0,
        features: ['Cascade AI flows', 'Basic completions', 'Limited credits'],
        bestFor: 'Trying AI coding',
      },
      {
        name: 'Pro',
        monthlyPricePerSeat: 15,
        features: ['Unlimited flows', 'GPT-4 & Claude', 'Priority access'],
        bestFor: 'Individual developers',
      },
      {
        name: 'Team',
        monthlyPricePerSeat: 30,
        features: ['Everything in Pro', 'Team management', 'Shared context'],
        bestFor: 'Development teams',
        minSeats: 2,
      },
    ],
  },
  {
    id: 'v0',
    name: 'v0',
    category: 'design-dev',
    logo: '/logos/v0.svg',
    plans: [
      {
        name: 'Free',
        monthlyPricePerSeat: 0,
        features: ['Limited generations', 'Basic components'],
        bestFor: 'Exploration',
      },
      {
        name: 'Premium',
        monthlyPricePerSeat: 20,
        features: ['Unlimited generations', 'Private projects', 'Priority'],
        bestFor: 'Professional use',
      },
    ],
  },
];

export const USE_CASES = [
  { value: 'coding', label: 'Coding & Development' },
  { value: 'writing', label: 'Writing & Content' },
  { value: 'research', label: 'Research & Analysis' },
  { value: 'data-analysis', label: 'Data Analysis' },
  { value: 'mixed', label: 'Mixed Workflows' },
] as const;

export type UseCase = typeof USE_CASES[number]['value'];

export function getToolById(id: string): AITool | undefined {
  return AI_TOOLS.find(tool => tool.id === id);
}

export function getPlanByName(toolId: string, planName: string): PlanTier | undefined {
  const tool = getToolById(toolId);
  return tool?.plans.find(plan => plan.name === planName);
}

export function getToolsByCategory(category: AITool['category']): AITool[] {
  return AI_TOOLS.filter(tool => tool.category === category);
}
