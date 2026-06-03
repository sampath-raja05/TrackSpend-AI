"use client";

import { useEffect, useState, type SVGProps } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";

import { readJsonResponse } from "@/lib/fetch-json";
import { formatCurrency } from "@/lib/utils";

import type {
  ApiResponse,
  AuditResult,
  Recommendation,
} from "@/lib/types";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  ArrowLeft,
  CheckCircle2,
  TrendingDown,
  Info,
  Zap,
  Mail,
} from "lucide-react";

export default function AuditResultsPage() {
  const params = useParams();
  const router = useRouter();

  const [result, setResult] = useState<AuditResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [leadEmail, setLeadEmail] = useState("");
  const [leadStatus, setLeadStatus] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");

  useEffect(() => {
    const fetchAudit = async () => {
      const rawAuditId = params.id;
      const auditId = Array.isArray(rawAuditId)
        ? rawAuditId[0]
        : rawAuditId;

      if (!auditId) {
        setErrorMessage("Missing audit ID.");
        setLoading(false);
        return;
      }

      const loadCachedAudit = () => {
        const cachedAudit = localStorage.getItem(
          `audit_${auditId}`
        );

        if (!cachedAudit) return false;

        try {
          setResult(JSON.parse(cachedAudit) as AuditResult);
          setErrorMessage(null);
          return true;
        } catch (parseError) {
          console.error("Failed to read cached audit:", parseError);
          return false;
        }
      };

      try {
        setErrorMessage(null);

        const response = await fetch(`/api/audit/${auditId}`);

        const data =
          await readJsonResponse<ApiResponse<AuditResult>>(
            response
          );

        if (response.status === 503) {
          setErrorMessage(
            data.error || "Audit storage is temporarily unavailable. Please try again in a moment."
          );
          return;
        }

        if (!response.ok || !data.success || !data.data) {
          throw new Error(
            data.error || "Unable to load this audit report."
          );
        }

        setResult(data.data);
      } catch (error) {
        if (!loadCachedAudit()) {
          if (
            error instanceof Error &&
            error.message === "Audit storage is temporarily unavailable"
          ) {
            setErrorMessage(error.message);
            return;
          }

          console.error("Error fetching audit:", error);
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Unable to load this audit report."
          );
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAudit();
  }, [params.id]);

  const captureLead = async () => {
    const rawAuditId = params.id;

    const auditId = Array.isArray(rawAuditId)
      ? rawAuditId[0]
      : rawAuditId;

    if (!auditId || !leadEmail.includes("@")) return;

    setLeadStatus("saving");

    try {
      const response = await fetch(
        `/api/audit/${auditId}/lead`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: leadEmail,
            teamSize:
              result?.items[0]?.spendItem.teamSize?.toString(),
          }),
        }
      );

      const data =
        await readJsonResponse<ApiResponse<{ id: string }>>(
          response
        );

      if (!response.ok || !data.success) {
        throw new Error(
          data.error || "Unable to save your email."
        );
      }

      setLeadStatus("saved");
    } catch (error) {
      console.error("Lead capture failed:", error);
      setLeadStatus("error");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        <div className="flex flex-col items-center animate-pulse">
          <div className="w-14 h-14 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-4">
            <Zap className="h-7 w-7 text-blue-400 animate-bounce" />
          </div>

          <p className="text-lg text-zinc-300">
            Crunching the numbers...
          </p>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white">
        <h1 className="text-3xl font-bold mb-4">
          {errorMessage || "Audit not found"}
        </h1>

        <Button
          className="bg-blue-600 hover:bg-blue-700"
          onClick={() => router.push("/")}
        >
          Go back home
        </Button>
      </div>
    );
  }

  const efficient =
    result.savingsCategory === "optimized";

  return (
    <div className="min-h-screen bg-black text-white font-sans overflow-hidden pb-20">
      
      {/* Background Glow */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-500/10 blur-[140px] rounded-full" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-500/10 blur-[140px] rounded-full" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-zinc-800 bg-black/70 backdrop-blur-xl">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">

          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-zinc-500 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>

            <span className="font-semibold text-lg text-white">
              Audit Results
            </span>
          </div>

          <Badge
            className={`rounded-full px-4 py-1 border ${
              efficient
                ? "bg-zinc-900 border-zinc-700 text-zinc-300"
                : "bg-blue-600 border-blue-500 text-white"
            }`}
          >
            Efficiency Score:{" "}
            {result.overallEfficiencyScore}/100
          </Badge>
        </div>
      </header>

      <main className="container mx-auto px-4 pt-12 max-w-6xl">

        {/* Summary Section */}
        <div className="grid md:grid-cols-3 gap-6 mb-14">

          {/* Main Savings Card */}
          <Card className="md:col-span-2 rounded-3xl border border-zinc-800 bg-gradient-to-br from-zinc-950 to-zinc-900 shadow-2xl shadow-black/40 overflow-hidden">
            <CardHeader>
              <CardDescription className="text-zinc-500 uppercase tracking-wide">
                Total Potential Savings
              </CardDescription>

              <CardTitle className="text-6xl font-bold tracking-tight text-white">
                {formatCurrency(result.totalAnnualSavings)}
                <span className="text-2xl text-zinc-500 font-normal">
                  /yr
                </span>
              </CardTitle>
            </CardHeader>

            <CardContent>
              <p className="text-lg text-zinc-400 leading-relaxed">
                Your team currently spends{" "}
                <span className="text-white font-semibold">
                  {formatCurrency(result.totalMonthlySpend)}
                  /mo
                </span>
                . We identified{" "}
                <span className="text-emerald-400 font-semibold">
                  {formatCurrency(result.totalMonthlySavings)}
                  /mo
                </span>{" "}
                in actionable reductions.
              </p>
            </CardContent>
          </Card>

          {/* AI Summary */}
          <Card className="rounded-3xl border border-zinc-800 bg-zinc-950 shadow-xl shadow-black/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2 text-white">
                <SparklesIcon className="h-5 w-5 text-blue-400" />
                AI Summary
              </CardTitle>
            </CardHeader>

            <CardContent>
              <p className="text-sm leading-relaxed text-zinc-400">
                {result.aiSummary ||
                  "We've analyzed your AI stack and found multiple opportunities to reduce spend while maintaining productivity and developer velocity."}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Section Heading */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold tracking-tight text-white">
            Tool Breakdown
          </h2>

          <p className="text-zinc-500 mt-2">
            Optimization insights for every AI subscription.
          </p>
        </div>

        {/* Tool Cards */}
        <div className="space-y-6">
          {result.items.map((item, i) => (
            <motion.div
              key={item.spendItem.id}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <Card className="overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950 shadow-xl shadow-black/30">

                {/* Top */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 border-b border-zinc-900">

                  <div className="mb-4 sm:mb-0">
                    <h3 className="text-2xl font-bold flex items-center gap-3 text-white">
                      {item.spendItem.toolName}

                      {item.isEfficient && (
                        <Badge className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                          Optimized
                        </Badge>
                      )}
                    </h3>

                    <p className="text-sm text-zinc-500 mt-2">
                      {item.spendItem.currentPlan} •{" "}
                      {item.spendItem.seats} seats •{" "}
                      {formatCurrency(
                        item.spendItem.monthlySpend
                      )}
                      /mo
                    </p>
                  </div>

                  {!item.isEfficient && (
                    <div className="text-right">
                      <p className="text-sm text-zinc-500 font-medium">
                        Potential Savings
                      </p>

                      <p className="text-3xl font-bold text-emerald-400">
                        {formatCurrency(
                          item.totalMonthlySavings
                        )}

                        <span className="text-sm text-zinc-500">
                          /mo
                        </span>
                      </p>
                    </div>
                  )}
                </div>

                {/* Recommendations */}
                <div className="p-6 bg-zinc-950/60">
                  {item.recommendations.length > 0 ? (
                    <div className="space-y-4">
                      {item.recommendations.map((rec, j) => (
                        <RecommendationCard
                          key={j}
                          recommendation={rec}
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-zinc-500">
                      No actionable recommendations for
                      this tool right now.
                    </p>
                  )}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Lead Capture */}
        <div className="mt-20 text-center">
          <div className="inline-flex flex-col items-center p-10 rounded-3xl border border-zinc-800 bg-zinc-950 shadow-2xl shadow-black/40 max-w-2xl mx-auto">

            <div className="w-16 h-16 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-5">
              <Mail className="h-7 w-7 text-blue-400" />
            </div>

            <h3 className="text-3xl font-bold mb-3 text-white">
              {result.totalMonthlySavings > 500
                ? "Want help capturing these savings?"
                : efficient
                ? "Stay updated on future optimizations"
                : "Save this audit for later"}
            </h3>

            <p className="text-zinc-400 mb-8 max-w-xl leading-relaxed">
              {result.totalMonthlySavings > 500
                ? "TrackSpend AI can help negotiate pricing and prioritize the highest-impact optimization opportunities."
                : efficient
                ? "Your AI stack is optimized today. We’ll notify you when better pricing opportunities become available."
                : "Receive a copy of your audit report and personalized recommendations directly in your inbox."}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
              <Input
                type="email"
                placeholder="name@company.com"
                value={leadEmail}
                onChange={(event) =>
                  setLeadEmail(event.target.value)
                }
                className="h-12 rounded-xl bg-black border-zinc-800 text-white placeholder:text-zinc-500 focus-visible:ring-blue-500"
              />

              <Button
                size="lg"
                className="h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white"
                disabled={
                  !leadEmail.includes("@") ||
                  leadStatus === "saving" ||
                  leadStatus === "saved"
                }
                onClick={captureLead}
              >
                {leadStatus === "saving"
                  ? "Saving..."
                  : leadStatus === "saved"
                  ? "Saved"
                  : "Email me"}
              </Button>
            </div>

            {leadStatus === "error" && (
              <p className="text-sm text-red-400 mt-4">
                Could not save your email. Please try again.
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function RecommendationCard({
  recommendation: rec,
}: {
  recommendation: Recommendation;
}) {
  const isEfficient = rec.type === "efficient";
  const isHighConfidence = rec.confidence === "high";

  return (
    <div
      className={`rounded-2xl border p-5 transition-all ${
        isEfficient
          ? "border-emerald-500/20 bg-emerald-500/5"
          : "border-zinc-800 bg-black/60 hover:border-zinc-700"
      }`}
    >
      <div className="flex gap-4">

        <div className="mt-1">
          {isEfficient ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
          ) : isHighConfidence ? (
            <TrendingDown className="h-5 w-5 text-blue-400" />
          ) : (
            <Info className="h-5 w-5 text-amber-400" />
          )}
        </div>

        <div className="flex-1 space-y-3">

          <div className="flex justify-between items-start gap-3">
            <h4 className="font-semibold text-base text-white">
              {rec.title}
            </h4>

            {!isEfficient && (
              <Badge className="bg-zinc-900 border border-zinc-700 text-zinc-300 whitespace-nowrap">
                Save {formatCurrency(rec.monthlySavings)}
                /mo
              </Badge>
            )}
          </div>

          <p className="text-sm leading-relaxed text-zinc-400">
            {rec.description}
          </p>

          <div className="pt-3 border-t border-zinc-800 text-sm text-zinc-500">
            <span className="font-medium text-zinc-300">
              Why:
            </span>{" "}
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
