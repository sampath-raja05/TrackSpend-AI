import { AuditForm } from '@/components/audit/audit-form';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, TrendingDown, Zap } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-black text-white font-sans selection:bg-blue-500/30">
      
      {/* Navigation */}
      <header className="sticky top-0 z-50 border-b border-zinc-800 bg-black/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-600/30">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight text-white">
              TrackSpend AI
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-zinc-400 hidden sm:inline-block">
              AI Spend Optimization
            </span>
          </div>
        </div>
      </header>

      <main className="flex-1">
        
        {/* Hero Section */}
        <section className="relative py-24 overflow-hidden">
          
          {/* Background Glow */}
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/20 blur-[120px] pointer-events-none" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/20 blur-[120px] pointer-events-none" />

          {/* Grid Background */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#111_1px,transparent_1px),linear-gradient(to_bottom,#111_1px,transparent_1px)] bg-[size:60px_60px] opacity-20 pointer-events-none" />

          <div className="container relative mx-auto px-4">
            <div className="flex flex-col lg:flex-row gap-16 items-center">
              
              {/* Left Content */}
              <div className="flex-1 text-center lg:text-left space-y-8">
                
                <Badge className="px-4 py-1.5 text-sm bg-zinc-900 text-blue-400 border border-zinc-700 shadow-md">
                  <ShieldCheck className="h-4 w-4 mr-1.5" />
                  Trusted by 500+ Engineering Leaders
                </Badge>

                <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight leading-[1.05]">
                  Stop overpaying for <br className="hidden lg:block" />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-cyan-400 to-purple-500">
                    AI tooling.
                  </span>
                </h1>

                <p className="text-xl text-zinc-400 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                  Identify unused seats, overpriced plans, and overlap in your AI stack.
                  Get a free, personalized optimization report in under 2 minutes.
                </p>

                {/* Stats */}
                <div className="flex flex-col sm:flex-row gap-10 pt-6 justify-center lg:justify-start">
                  
                  <div className="flex flex-col items-center lg:items-start">
                    <h3 className="text-4xl font-bold text-white">$4M+</h3>
                    <p className="text-sm text-zinc-500 mt-1">
                      Savings Identified
                    </p>
                  </div>

                  <div className="hidden sm:block w-px h-14 bg-zinc-800" />

                  <div className="flex flex-col items-center lg:items-start">
                    <h3 className="text-4xl font-bold text-white">32%</h3>
                    <p className="text-sm text-zinc-500 mt-1">
                      Avg. Spend Reduction
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Form */}
              <div className="flex-1 w-full max-w-xl">
                <div className="rounded-3xl border border-zinc-800 bg-zinc-950/70 backdrop-blur-xl shadow-2xl shadow-black/40 p-2">
                  <AuditForm />
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 border-t border-zinc-900 bg-zinc-950">
          <div className="container mx-auto px-4">
            
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold tracking-tight text-white">
                How TrackSpend AI Works
              </h2>

              <p className="mt-4 text-zinc-400 max-w-2xl mx-auto text-lg">
                We analyze your stack against real-world usage and pricing benchmarks
                to uncover actionable savings opportunities.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">

              {/* Card 1 */}
              <div className="group p-8 rounded-3xl bg-zinc-900/60 border border-zinc-800 hover:border-blue-500/40 transition-all duration-300 hover:-translate-y-1">
                <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6 border border-blue-500/20">
                  <TrendingDown className="h-7 w-7 text-blue-400" />
                </div>

                <h3 className="text-2xl font-semibold mb-3 text-white">
                  Right-size Plans
                </h3>

                <p className="text-zinc-400 leading-relaxed">
                  Stop paying for Enterprise features your team doesn&apos;t use.
                  We identify downgrade opportunities without sacrificing productivity.
                </p>
              </div>

              {/* Card 2 */}
              <div className="group p-8 rounded-3xl bg-zinc-900/60 border border-zinc-800 hover:border-purple-500/40 transition-all duration-300 hover:-translate-y-1">
                <div className="w-14 h-14 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-6 border border-purple-500/20">
                  <ShieldCheck className="h-7 w-7 text-purple-400" />
                </div>

                <h3 className="text-2xl font-semibold mb-3 text-white">
                  Consolidate Tools
                </h3>

                <p className="text-zinc-400 leading-relaxed">
                  Detect overlap between GitHub Copilot, ChatGPT, Claude, and more.
                  Standardize your AI stack while reducing unnecessary costs.
                </p>
              </div>

              {/* Card 3 */}
              <div className="group p-8 rounded-3xl bg-zinc-900/60 border border-zinc-800 hover:border-emerald-500/40 transition-all duration-300 hover:-translate-y-1">
                <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6 border border-emerald-500/20">
                  <Zap className="h-7 w-7 text-emerald-400" />
                </div>

                <h3 className="text-2xl font-semibold mb-3 text-white">
                  API Migration
                </h3>

                <p className="text-zinc-400 leading-relaxed">
                  Discover when switching from seat-based subscriptions to API usage
                  becomes more cost-effective for power users.
                </p>
              </div>

            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-8 border-t border-zinc-900 bg-black text-center text-sm text-zinc-500">
        <p>© 2026 TrackSpend AI Inc. All rights reserved.</p>
      </footer>
    </div>
  );
}