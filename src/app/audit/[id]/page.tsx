"use client";

import { useEffect, useState, type SVGProps } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { readJsonResponse } from '@/lib/fetch-json';
import { formatCurrency } from '@/lib/utils';
import type { ApiResponse, AuditResult, Recommendation } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckCircle2, TrendingDown, Info, Zap } from 'lucide-react';
import Link from 'next/link';

export default function AuditResultsPage() {
  const params = useParams();
  const router = useRouter();
  const [result, setResult] = useState<AuditResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchAudit = async () => {
      const rawAuditId = params.id;
      const auditId = Array.isArray(rawAuditId) ? rawAuditId[0] : rawAuditId;

      if (!auditId) {
        setErrorMessage('Missing audit ID.');
        setLoading(false);
        return;
      }

      const loadCachedAudit = () => {
        const cachedAudit = localStorage.getItem(`audit_${auditId}`);

        if (!cachedAudit) {
          return false;
        }

        try {
          setResult(JSON.parse(cachedAudit) as AuditResult);
          setErrorMessage(null);
          return true;
        } catch (parseError) {
          console.error('Failed to read cached audit:', parseError);
          return false;
        }
      };

      try {
        setErrorMessage(null);
        const response = await fetch(`/api/audit/${auditId}`);
        const data = await readJsonResponse<ApiResponse<AuditResult>>(response);
        
        if (!response.ok || !data.success || !data.data) {
          throw new Error(data.error || 'Unable to load this audit report.');
        }

        setResult(data.data);
      } catch (error) {
        console.error("Error fetching audit:", error);
        if (!loadCachedAudit()) {
          setErrorMessage(error instanceof Error ? error.message : 'Unable to load this audit report.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAudit();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-black">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 bg-blue-600/20 rounded-full flex items-center justify-center mb-4">
            <Zap className="h-6 w-6 text-blue-600 animate-bounce" />
          </div>
          <p className="text-lg font-medium">Crunching the numbers...</p>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 dark:bg-black">
        <h1 className="text-2xl font-bold mb-4">{errorMessage || 'Audit not found'}</h1>
        <Button onClick={() => router.push('/')}>Go back home</Button>
      </div>
    );
  }

  const efficient = result.savingsCategory === 'optimized';

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black font-sans pb-20">
      {/* Header */}
      <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 sticky top-0 z-10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <span className="font-semibold text-lg">Audit Results</span>
          </div>
          <Badge variant={efficient ? 'secondary' : 'default'} className={!efficient ? 'bg-blue-600 hover:bg-blue-700 text-white' : ''}>
            Efficiency Score: {result.overallEfficiencyScore}/100
          </Badge>
        </div>
      </header>

      <main className="container mx-auto px-4 pt-12 max-w-5xl">
        {/* Top Summary Dashboard */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="md:col-span-2 bg-gradient-to-br from-zinc-900 to-zinc-950 text-white border-zinc-800">
            <CardHeader>
              <CardDescription className="text-zinc-400">Total Potential Savings</CardDescription>
              <CardTitle className="text-5xl font-bold text-white tracking-tight">
                {formatCurrency(result.totalAnnualSavings)}<span className="text-2xl text-zinc-500 font-normal">/yr</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg text-zinc-300">
                You are currently spending {formatCurrency(result.totalMonthlySpend)}/mo. 
                We found {formatCurrency(result.totalMonthlySavings)}/mo in actionable reductions.
              </p>
            </CardContent>
          </Card>

          <Card className="border-blue-200 dark:border-blue-900/50 bg-blue-50/50 dark:bg-blue-900/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <SparklesIcon className="h-5 w-5 text-blue-500" />
                AI Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
                {result.aiSummary || "Based on your team size and use case, we've analyzed your AI stack. Review the recommendations below to optimize your spend without impacting productivity."}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Breakdown */}
        <h2 className="text-2xl font-bold tracking-tight mb-6">Tool Breakdown</h2>
        
        <div className="space-y-6">
          {result.items.map((item, i) => (
            <motion.div 
              key={item.spendItem.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="overflow-hidden border-zinc-200 dark:border-zinc-800">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 bg-white dark:bg-zinc-950 border-b border-zinc-100 dark:border-zinc-900">
                  <div className="mb-4 sm:mb-0">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                      {item.spendItem.toolName}
                      {item.isEfficient && (
                        <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                          Optimized
                        </Badge>
                      )}
                    </h3>
                    <p className="text-sm text-zinc-500">
                      {item.spendItem.currentPlan} • {item.spendItem.seats} seats • {formatCurrency(item.spendItem.monthlySpend)}/mo
                    </p>
                  </div>
                  
                  {!item.isEfficient && (
                    <div className="text-right">
                      <p className="text-sm text-zinc-500 font-medium">Potential Savings</p>
                      <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(item.totalMonthlySavings)}<span className="text-sm text-zinc-500">/mo</span>
                      </p>
                    </div>
                  )}
                </div>

                <div className="p-6 bg-zinc-50 dark:bg-zinc-900/50">
                  {item.recommendations.length > 0 ? (
                    <div className="space-y-4">
                      {item.recommendations.map((rec, j) => (
                        <RecommendationCard key={j} recommendation={rec} />
                      ))}
                    </div>
                  ) : (
                    <p className="text-zinc-500 text-sm">No actionable recommendations for this tool at this time.</p>
                  )}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
        
        {/* Call to Action */}
        <div className="mt-16 text-center">
          <div className="inline-flex flex-col items-center p-8 rounded-2xl border border-blue-200 dark:border-blue-900/50 bg-white dark:bg-zinc-950 shadow-sm max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold mb-2">Need help implementing these changes?</h3>
            <p className="text-zinc-500 mb-6">Our team can help you migrate plans, consolidate tools, and negotiate enterprise contracts.</p>
            <Button size="lg" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white">
              Schedule Free Consultation
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}

function RecommendationCard({ recommendation: rec }: { recommendation: Recommendation }) {
  const isEfficient = rec.type === 'efficient';
  const isHighConfidence = rec.confidence === 'high';

  return (
    <div className={`p-4 rounded-xl border ${
      isEfficient 
        ? 'border-emerald-200 bg-emerald-50/50 dark:border-emerald-900/30 dark:bg-emerald-900/10' 
        : 'border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950'
    }`}>
      <div className="flex gap-4">
        <div className="mt-1">
          {isEfficient ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
          ) : isHighConfidence ? (
            <TrendingDown className="h-5 w-5 text-blue-500" />
          ) : (
            <Info className="h-5 w-5 text-amber-500" />
          )}
        </div>
        <div className="flex-1 space-y-2">
          <div className="flex justify-between items-start">
            <h4 className="font-semibold text-base">{rec.title}</h4>
            {!isEfficient && (
              <Badge variant="outline" className="ml-2 whitespace-nowrap">
                Save {formatCurrency(rec.monthlySavings)}/mo
              </Badge>
            )}
          </div>
          
          <p className="text-sm text-zinc-600 dark:text-zinc-400">{rec.description}</p>
          
          <div className="pt-2 mt-2 border-t border-zinc-100 dark:border-zinc-800 text-sm text-zinc-500 dark:text-zinc-500">
            <span className="font-medium text-zinc-700 dark:text-zinc-300">Why: </span>
            {rec.reasoning}
          </div>
        </div>
      </div>
    </div>
  );
}

function SparklesIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
    </svg>
  );
}
