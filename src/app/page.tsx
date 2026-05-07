import { AuditForm } from '@/components/audit/audit-form';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, TrendingDown, Zap } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-black font-sans selection:bg-blue-500/30">
      
      {/* Navigation */}
      <header className="sticky top-0 z-50 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-black/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight text-zinc-950 dark:text-zinc-50">Credex</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-zinc-500 hidden sm:inline-block">AI Spend Optimization</span>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-20 overflow-hidden">
          {/* Background Gradients */}
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/20 blur-[120px] pointer-events-none" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/20 blur-[120px] pointer-events-none" />
          
          <div className="container mx-auto px-4">
            <div className="flex flex-col lg:flex-row gap-12 items-center">
              
              {/* Copy */}
              <div className="flex-1 text-center lg:text-left space-y-8">
                <Badge variant="secondary" className="px-3 py-1 text-sm bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/50">
                  <ShieldCheck className="h-4 w-4 mr-1.5" /> Trusted by 500+ Engineering Leaders
                </Badge>
                
                <h1 className="text-5xl lg:text-7xl font-bold tracking-tight text-zinc-950 dark:text-white leading-[1.1]">
                  Stop overpaying for <br className="hidden lg:block" />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                    AI tooling.
                  </span>
                </h1>
                
                <p className="text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto lg:mx-0">
                  Identify unused seats, overpriced plans, and overlap in your AI stack. Get a free, personalized optimization report in 2 minutes.
                </p>

                <div className="flex flex-col sm:flex-row gap-8 pt-4 justify-center lg:justify-start">
                  <div className="flex flex-col items-center lg:items-start">
                    <h3 className="text-3xl font-bold text-zinc-950 dark:text-zinc-50">$4M+</h3>
                    <p className="text-sm text-zinc-500">Savings Identified</p>
                  </div>
                  <div className="w-px h-12 bg-zinc-200 dark:bg-zinc-800 hidden sm:block" />
                  <div className="flex flex-col items-center lg:items-start">
                    <h3 className="text-3xl font-bold text-zinc-950 dark:text-zinc-50">32%</h3>
                    <p className="text-sm text-zinc-500">Avg. Spend Reduction</p>
                  </div>
                </div>
              </div>

              {/* Form */}
              <div className="flex-1 w-full max-w-xl">
                <AuditForm />
              </div>
            </div>
          </div>
        </section>

        {/* Features / Trust Section */}
        <section className="py-24 bg-white dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">How Credex Works</h2>
              <p className="mt-4 text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto">
                We analyze your stack against real-world data and pricing benchmarks to find actionable savings.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center mb-4">
                  <TrendingDown className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Right-size Plans</h3>
                <p className="text-zinc-600 dark:text-zinc-400">
                  Stop paying for Enterprise features your team doesn't use. We identify when to downgrade without losing functionality.
                </p>
              </div>
              <div className="p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/50 rounded-lg flex items-center justify-center mb-4">
                  <ShieldCheck className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Consolidate Tools</h3>
                <p className="text-zinc-600 dark:text-zinc-400">
                  Identify overlap between GitHub Copilot, ChatGPT, Claude, and others to standardize your stack and save money.
                </p>
              </div>
              <div className="p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/50 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2">API Migration</h3>
                <p className="text-zinc-600 dark:text-zinc-400">
                  Discover when it's more cost-effective to switch from seat-based subscriptions to direct API usage for heavy users.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-8 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-center text-sm text-zinc-500">
        <p>© 2026 Credex Inc. All rights reserved.</p>
      </footer>
    </div>
  );
}
