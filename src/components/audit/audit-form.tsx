"use client";

import { useEffect, useState } from 'react';
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

const FORM_STORAGE_KEY = 'trackspend_audit_form';

export function AuditForm() {
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hasLoadedDraft, setHasLoadedDraft] = useState(false);

  const [teamSize, setTeamSize] = useState<number>(10);
  const [useCase, setUseCase] = useState<UseCase>('coding');
  const [email, setEmail] = useState('');

  const [items, setItems] = useState<DraftSpendItem[]>([
    {
      id: generateId(),
      toolId: 'github-copilot',
      currentPlan: 'Business',
      seats: 10,
      monthlySpend: 190,
    },
  ]);

  useEffect(() => {
    const restoreDraft = window.setTimeout(() => {
      const savedDraft = localStorage.getItem(FORM_STORAGE_KEY);

      if (savedDraft) {
        try {
          const parsed = JSON.parse(savedDraft);

          if (typeof parsed.teamSize === 'number') {
            setTeamSize(parsed.teamSize);
          }

          if (parsed.useCase) {
            setUseCase(parsed.useCase);
          }

          if (typeof parsed.email === 'string') {
            setEmail(parsed.email);
          }

          if (Array.isArray(parsed.items) && parsed.items.length > 0) {
            setItems(
              parsed.items.map((item: DraftSpendItem) => ({
                ...item,
                id: item.id || generateId(),
              }))
            );
          }
        } catch (error) {
          console.error(error);
        }
      }

      setHasLoadedDraft(true);
    }, 0);

    return () => window.clearTimeout(restoreDraft);
  }, []);

  useEffect(() => {
    if (!hasLoadedDraft) return;

    localStorage.setItem(
      FORM_STORAGE_KEY,
      JSON.stringify({ teamSize, useCase, email, items })
    );
  }, [teamSize, useCase, email, items, hasLoadedDraft]);

  const updateItem = (id: string, updates: Partial<SpendItem>) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const updated = { ...item, ...updates };

          if (updates.toolId || updates.currentPlan || updates.seats) {
            const tool = AI_TOOLS.find((t) => t.id === updated.toolId);
            const plan = tool?.plans.find(
              (p) => p.name === updated.currentPlan
            );

            if (plan && updated.seats) {
              updated.monthlySpend =
                plan.monthlyPricePerSeat * updated.seats;
            }
          }

          return updated;
        }

        return item;
      })
    );
  };

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      {
        id: generateId(),
        seats: teamSize,
      },
    ]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems((prev) => prev.filter((item) => item.id !== id));
    }
  };

  const submitAudit = async () => {
    setLoading(true);
    setErrorMessage(null);

    try {
      const finalItems: SpendItem[] = items.flatMap((item) => {
        if (!item.toolId || !item.currentPlan) return [];

        const tool = AI_TOOLS.find((t) => t.id === item.toolId);

        return [
          {
            id: item.id,
            toolId: item.toolId,
            toolName: tool?.name || 'Unknown Tool',
            currentPlan: item.currentPlan,
            monthlySpend: item.monthlySpend || 0,
            seats: item.seats || 1,
            teamSize,
            useCase,
          },
        ];
      });

      const response = await fetch('/api/audit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: finalItems,
          ...(email.includes('@')
            ? {
                lead: {
                  email,
                  teamSize: teamSize.toString(),
                },
              }
            : {}),
        }),
      });

      const data =
        await readJsonResponse<
          ApiResponse<{
            id: string;
            auditResult: AuditResult;
            persisted: boolean;
          }>
        >(response);

      if (
        !response.ok ||
        !data.success ||
        !data.data?.id ||
        !data.data.auditResult
      ) {
        throw new Error(
          data.error || 'Failed to generate your audit report.'
        );
      }

      localStorage.setItem(
        `audit_${data.data.id}`,
        JSON.stringify(data.data.auditResult)
      );

      router.push(`/audit/${data.data.id}`);
    } catch (error) {
      console.error(error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Failed to generate your audit report.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto relative">
      
      {/* Glow */}
      <div className="absolute -inset-1 rounded-3xl blur-2xl bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-cyan-500/20 -z-10" />

      <Card className="overflow-hidden border border-zinc-800 bg-zinc-950/90 backdrop-blur-xl shadow-2xl shadow-black/40 rounded-3xl">
        
        {/* Progress */}
        <div className="h-1 bg-zinc-900">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
            initial={{ width: '33%' }}
            animate={{ width: `${(step / 3) * 100}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>

        <AnimatePresence mode="wait">

          {/* STEP 1 */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              className="p-8"
            >
              <div className="space-y-8">

                <div>
                  <h2 className="text-3xl font-bold text-white">
                    Tell us about your team
                  </h2>

                  <p className="text-zinc-400 mt-2">
                    We use this information to generate accurate optimization recommendations.
                  </p>
                </div>

                <div className="space-y-5">

                  <div className="space-y-2">
                    <Label className="text-zinc-300">
                      Engineering Team Size
                    </Label>

                    <Input
                      type="number"
                      min="1"
                      value={teamSize}
                      onChange={(e) =>
                        setTeamSize(parseInt(e.target.value) || 1)
                      }
                      className="bg-zinc-900 border-zinc-800 text-white h-14 text-lg rounded-xl"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-zinc-300">
                      Primary AI Use Case
                    </Label>

                    <Select
                      value={useCase}
                      onValueChange={(value) =>
                        setUseCase(value as UseCase)
                      }
                    >
                      <SelectTrigger className="bg-zinc-900 border-zinc-800 text-white h-14 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>

                      <SelectContent className="bg-zinc-950 border-zinc-800 text-white">
                        {USE_CASES.map((uc) => (
                          <SelectItem
                            key={uc.value}
                            value={uc.value}
                          >
                            {uc.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button
                  onClick={() => setStep(2)}
                  className="w-full h-14 text-lg rounded-xl bg-blue-600 hover:bg-blue-700"
                >
                  Next: Add Your Tools
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              className="p-8"
            >
              <div className="space-y-8">

                <div>
                  <h2 className="text-3xl font-bold text-white">
                    Your AI Stack
                  </h2>

                  <p className="text-zinc-400 mt-2">
                    Add the AI tools your team currently uses.
                  </p>
                </div>

                <div className="space-y-5">
                  {items.map((item) => {
                    const tool = AI_TOOLS.find(
                      (t) => t.id === item.toolId
                    );

                    return (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="relative rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5"
                      >
                        {items.length > 1 && (
                          <button
                            onClick={() => removeItem(item.id)}
                            className="absolute top-3 right-3 text-zinc-500 hover:text-red-400 transition"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}

                        <div className="grid sm:grid-cols-2 gap-4">

                          <div className="space-y-2">
                            <Label className="text-zinc-300">
                              AI Tool
                            </Label>

                            <Select
                              value={item.toolId}
                              onValueChange={(val) =>
                                updateItem(item.id, {
                                  toolId: val,
                                  currentPlan: undefined,
                                })
                              }
                            >
                              <SelectTrigger className="bg-black border-zinc-800 text-white rounded-xl">
                                <SelectValue placeholder="Select tool" />
                              </SelectTrigger>

                              <SelectContent className="bg-zinc-950 border-zinc-800 text-white">
                                {AI_TOOLS.map((t) => (
                                  <SelectItem
                                    key={t.id}
                                    value={t.id}
                                  >
                                    {t.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label className="text-zinc-300">
                              Plan Tier
                            </Label>

                            <Select
                              disabled={!item.toolId}
                              value={item.currentPlan}
                              onValueChange={(val) =>
                                updateItem(item.id, {
                                  currentPlan: val,
                                })
                              }
                            >
                              <SelectTrigger className="bg-black border-zinc-800 text-white rounded-xl">
                                <SelectValue placeholder="Select plan" />
                              </SelectTrigger>

                              <SelectContent className="bg-zinc-950 border-zinc-800 text-white">
                                {tool?.plans.map((p) => (
                                  <SelectItem
                                    key={p.name}
                                    value={p.name}
                                  >
                                    {p.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4 mt-4">

                          <div className="space-y-2">
                            <Label className="text-zinc-300">
                              Seats
                            </Label>

                            <Input
                              type="number"
                              min="1"
                              value={item.seats || ''}
                              onChange={(e) =>
                                updateItem(item.id, {
                                  seats:
                                    parseInt(e.target.value) || 0,
                                })
                              }
                              className="bg-black border-zinc-800 text-white rounded-xl"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label className="text-zinc-300">
                              Monthly Spend ($)
                            </Label>

                            <Input
                              type="number"
                              min="0"
                              value={item.monthlySpend || ''}
                              onChange={(e) =>
                                updateItem(item.id, {
                                  monthlySpend:
                                    parseInt(e.target.value) || 0,
                                })
                              }
                              className="bg-black border-zinc-800 text-white rounded-xl"
                            />
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  onClick={addItem}
                  className="w-full border-dashed border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Another Tool
                </Button>

                <div className="flex justify-between pt-6 border-t border-zinc-800">
                  <Button
                    variant="ghost"
                    onClick={() => setStep(1)}
                    className="text-zinc-400 hover:text-white"
                  >
                    Back
                  </Button>

                  <Button
                    onClick={() => setStep(3)}
                    disabled={items.some(
                      (i) => !i.toolId || !i.currentPlan
                    )}
                    className="bg-blue-600 hover:bg-blue-700 rounded-xl"
                  >
                    Continue
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="p-8 text-center"
            >
              <div className="space-y-6">

                <div className="mx-auto w-20 h-20 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                  <Sparkles className="h-9 w-9 text-blue-400" />
                </div>

                <div>
                  <h2 className="text-3xl font-bold text-white">
                    Your Audit Is Ready
                  </h2>

                  <p className="text-zinc-400 mt-3 max-w-md mx-auto">
                    Enter your work email to unlock your personalized AI spend optimization report.
                  </p>
                </div>

                <div className="max-w-sm mx-auto space-y-4">

                  <Input
                    type="email"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-14 text-center bg-zinc-900 border-zinc-800 text-white rounded-xl"
                  />

                  <Button
                    onClick={submitAudit}
                    disabled={!email.includes('@') || loading}
                    className="w-full h-14 text-lg rounded-xl bg-blue-600 hover:bg-blue-700"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      'Reveal Savings'
                    )}
                  </Button>

                  <p className="text-xs text-zinc-500">
                    No spam. We&apos;ll only send your audit report.
                  </p>

                  {errorMessage && (
                    <p className="text-sm text-red-400">
                      {errorMessage}
                    </p>
                  )}
                </div>

                <div className="pt-8 border-t border-zinc-800">
                  <Button
                    variant="ghost"
                    onClick={() => setStep(2)}
                    className="text-zinc-400 hover:text-white"
                  >
                    Back to editing tools
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </Card>
    </div>
  );
}