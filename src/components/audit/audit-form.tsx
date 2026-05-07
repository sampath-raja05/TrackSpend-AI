"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { AI_TOOLS, USE_CASES, type UseCase } from '@/lib/constants/pricing';
import type { ApiResponse, AuditResult, SpendItem } from '@/lib/types';
import { readJsonResponse } from '@/lib/fetch-json';
import { generateId } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Plus, Trash2, ArrowRight, Loader2, Sparkles } from 'lucide-react';

type DraftSpendItem = Partial<SpendItem> & { id: string };

export function AuditForm() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Form State
  const [teamSize, setTeamSize] = useState<number>(10);
  const [useCase, setUseCase] = useState<UseCase>('coding');
  const [email, setEmail] = useState('');
  
  const [items, setItems] = useState<DraftSpendItem[]>([
    { id: generateId(), toolId: 'github-copilot', currentPlan: 'Business', seats: 10, monthlySpend: 190 }
  ]);

  const updateItem = (id: string, updates: Partial<SpendItem>) => {
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        const updated = { ...item, ...updates };
        
        // Auto-calculate spend if plan and seats are selected
        if (updates.toolId || updates.currentPlan || updates.seats) {
          const tool = AI_TOOLS.find(t => t.id === updated.toolId);
          const plan = tool?.plans.find(p => p.name === updated.currentPlan);
          if (plan && updated.seats) {
            updated.monthlySpend = plan.monthlyPricePerSeat * updated.seats;
          }
        }
        
        return updated;
      }
      return item;
    }));
  };

  const addItem = () => {
    setItems(prev => [...prev, { id: generateId(), seats: teamSize }]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(prev => prev.filter(item => item.id !== id));
    }
  };

  const submitAudit = async () => {
    setLoading(true);
    setErrorMessage(null);

    try {
      // Prepare data
      const finalItems: SpendItem[] = items.flatMap(item => {
        if (!item.toolId || !item.currentPlan) {
          return [];
        }

        const tool = AI_TOOLS.find(t => t.id === item.toolId);
        return [{
          id: item.id,
          toolId: item.toolId,
          toolName: tool?.name || 'Unknown Tool',
          currentPlan: item.currentPlan,
          monthlySpend: item.monthlySpend || 0,
          seats: item.seats || 1,
          teamSize,
          useCase,
        }];
      });

      const response = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: finalItems,
          lead: { email, teamSize: teamSize.toString() }
        }),
      });

      const data = await readJsonResponse<ApiResponse<{ id: string; auditResult: AuditResult; persisted: boolean }>>(response);

      if (!response.ok || !data.success || !data.data?.id || !data.data.auditResult) {
        throw new Error(data.error || 'Failed to generate your audit report.');
      }

      localStorage.setItem(
        `audit_${data.data.id}`,
        JSON.stringify(data.data.auditResult)
      );
      router.push(`/audit/${data.data.id}`);
    } catch (error) {
      console.error(error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to generate your audit report.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto relative">
      {/* Decorative gradient blur */}
      <div className="absolute -inset-1 rounded-xl blur-lg bg-gradient-to-r from-blue-500/20 to-purple-500/20 -z-10" />
      
      <Card className="border-zinc-200/50 dark:border-zinc-800/50 backdrop-blur-sm bg-white/90 dark:bg-zinc-950/90 shadow-xl overflow-hidden">
        {/* Progress bar */}
        <div className="h-1 w-full bg-zinc-100 dark:bg-zinc-900">
          <motion.div 
            className="h-full bg-blue-600 dark:bg-blue-500"
            initial={{ width: '33%' }}
            animate={{ width: `${(step / 3) * 100}%` }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          />
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-6 sm:p-8"
            >
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-semibold tracking-tight">Tell us about your team</h2>
                  <p className="text-zinc-500 dark:text-zinc-400 mt-1">We need context to provide accurate recommendations.</p>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="teamSize">Total Engineering Team Size</Label>
                    <Input 
                      id="teamSize" 
                      type="number" 
                      min="1" 
                      value={teamSize}
                      onChange={(e) => setTeamSize(parseInt(e.target.value) || 1)}
                      className="text-lg py-6"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Primary AI Use Case</Label>
                    <Select value={useCase} onValueChange={(value) => setUseCase(value as UseCase)}>
                      <SelectTrigger className="py-6 text-lg">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {USE_CASES.map(uc => (
                          <SelectItem key={uc.value} value={uc.value}>{uc.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button className="w-full py-6 text-lg" onClick={() => setStep(2)}>
                  Next: Add Your Tools
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-6 sm:p-8 flex flex-col min-h-[400px]"
            >
              <div className="space-y-6 flex-1">
                <div>
                  <h2 className="text-2xl font-semibold tracking-tight">What are you paying for?</h2>
                  <p className="text-zinc-500 dark:text-zinc-400 mt-1">Add your current AI subscriptions.</p>
                </div>

                <div className="space-y-4">
                  {items.map((item) => {
                    const tool = AI_TOOLS.find(t => t.id === item.toolId);
                    
                    return (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={item.id} 
                        className="p-4 border border-zinc-200 dark:border-zinc-800 rounded-lg space-y-4 bg-zinc-50 dark:bg-zinc-900/50 relative group"
                      >
                        {items.length > 1 && (
                          <button 
                            onClick={() => removeItem(item.id!)}
                            className="absolute -right-2 -top-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:text-red-500 rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        )}
                        
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>AI Tool</Label>
                            <Select value={item.toolId} onValueChange={(val) => updateItem(item.id!, { toolId: val, currentPlan: undefined })}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a tool" />
                              </SelectTrigger>
                              <SelectContent>
                                {AI_TOOLS.map(t => (
                                  <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="space-y-2">
                            <Label>Plan Tier</Label>
                            <Select 
                              disabled={!item.toolId} 
                              value={item.currentPlan} 
                              onValueChange={(val) => updateItem(item.id!, { currentPlan: val })}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select plan" />
                              </SelectTrigger>
                              <SelectContent>
                                {tool?.plans.map(p => (
                                  <SelectItem key={p.name} value={p.name}>{p.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Number of Seats</Label>
                            <Input 
                              type="number" 
                              min="1" 
                              value={item.seats || ''} 
                              onChange={(e) => updateItem(item.id!, { seats: parseInt(e.target.value) || 0 })}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label>Monthly Spend ($)</Label>
                            <Input 
                              type="number" 
                              min="0" 
                              value={item.monthlySpend || ''} 
                              onChange={(e) => updateItem(item.id!, { monthlySpend: parseInt(e.target.value) || 0 })}
                            />
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                <Button variant="outline" onClick={addItem} className="w-full border-dashed">
                  <Plus className="mr-2 h-4 w-4" /> Add Another Tool
                </Button>
              </div>

              <div className="flex justify-between pt-6 mt-6 border-t border-zinc-200 dark:border-zinc-800">
                <Button variant="ghost" onClick={() => setStep(1)}>Back</Button>
                <Button 
                  onClick={() => setStep(3)} 
                  disabled={items.some(i => !i.toolId || !i.currentPlan)}
                >
                  Next: See Results
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="p-6 sm:p-8 text-center"
            >
              <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-6">
                <Sparkles className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              
              <h2 className="text-3xl font-semibold tracking-tight mb-2">Audit Ready</h2>
              <p className="text-zinc-500 dark:text-zinc-400 mb-8 max-w-sm mx-auto">
                We&apos;ve analyzed your setup. Enter your work email to view your personalized optimization report.
              </p>

              <div className="space-y-4 max-w-sm mx-auto">
                <Input 
                  type="email" 
                  placeholder="name@company.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="text-center py-6 text-lg"
                />
                
                <Button 
                  className="w-full py-6 text-lg font-medium bg-blue-600 hover:bg-blue-700 text-white" 
                  onClick={submitAudit}
                  disabled={!email.includes('@') || loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Generating Report...
                    </>
                  ) : (
                    'Reveal Savings'
                  )}
                </Button>
                
                <p className="text-xs text-zinc-400">
                  We&apos;ll email you a copy. No spam, ever.
                </p>

                {errorMessage ? (
                  <p className="text-sm text-red-500 dark:text-red-400">
                    {errorMessage}
                  </p>
                ) : null}
              </div>
              
              <div className="mt-8 pt-8 border-t border-zinc-200 dark:border-zinc-800">
                <Button variant="ghost" onClick={() => setStep(2)}>
                  Back to editing tools
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </div>
  );
}
