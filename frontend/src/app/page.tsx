/**
 * Landing page — marketing-grade, dark gradient, glassmorphism.
 */
import Link from "next/link";
import {
  Sparkles, BarChart3, MessageSquare,
  Zap, ArrowRight, Database, TrendingUp,
} from "lucide-react";

const FEATURES = [
  {
    icon: MessageSquare,
    title: "Ask anything",
    desc: "Type your question in plain English. No SQL, no formulas, no pivot tables.",
    accent: "text-primary-glow",
    bg: "bg-primary/10",
    border: "border-primary/20",
  },
  {
    icon: BarChart3,
    title: "Instant visuals",
    desc: "Auto-selected charts appear the moment you ask. Bar, line, pie, trend — all instant.",
    accent: "text-accent",
    bg: "bg-accent/10",
    border: "border-accent/20",
  },
  {
    icon: Zap,
    title: "Smart insights",
    desc: "Get actionable insights alongside every chart. Deterministic, fast, trustworthy.",
    accent: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
  },
];

const DEMO_MESSAGES = [
  { role: "user", text: "Show me total sales by region" },
  { role: "ai", text: "**North** leads with $2.1M — 18% above average. **South** at $1.3M is the lowest." },
  { role: "user", text: "What are the top 5 products by revenue?" },
  { role: "ai", text: "Product A dominates at $890K, followed by B ($720K) and C ($650K)." },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0b0f19] text-[#e2e8f0]">

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-[#1e2d45]">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <Sparkles size={13} className="text-white" />
            </div>
            <span className="font-bold font-display gradient-text">Ask Your Data</span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm text-text-muted">
            <a href="#features" className="hover:text-[#e2e8f0] transition-colors">Features</a>
            <a href="#demo" className="hover:text-[#e2e8f0] transition-colors">Demo</a>
          </div>
          <Link
            href="/app"
            className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-glow text-white
              text-sm font-medium transition-all shadow-glow-sm"
          >
            Get started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero-gradient pt-32 pb-24 px-6">
        <div className="max-w-4xl mx-auto text-center space-y-6">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full
            bg-primary/10 border border-primary/20 text-primary-glow text-sm">
            <Sparkles size={13} />
            AI-powered data analytics
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-6xl font-bold font-display leading-tight">
            Chat with your{" "}
            <span className="gradient-text">business data</span>
          </h1>

          <p className="text-lg text-[#94a3b8] max-w-xl mx-auto leading-relaxed">
            Upload a CSV. Ask questions in plain English.
            Get instant charts, insights, and answers—no SQL required.
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link
              href="/app/datasets"
              className="flex items-center gap-2 px-6 py-3 rounded-xl
                bg-primary hover:bg-primary-glow text-white font-medium transition-all
                shadow-glow text-sm"
            >
              <Database size={16} />
              Upload your dataset
              <ArrowRight size={15} />
            </Link>
            <Link
              href="/app"
              className="flex items-center gap-2 px-6 py-3 rounded-xl
                border border-[#1e2d45] hover:border-primary/30 text-[#e2e8f0]
                font-medium transition-all text-sm hover:bg-surface"
            >
              <BarChart3 size={16} />
              Try the demo
            </Link>
          </div>

          {/* Trust note */}
          <p className="text-xs text-text-muted">
            No account required · Your data stays local · Open source
          </p>
        </div>
      </section>

      {/* Demo preview */}
      <section id="demo" className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12 space-y-2">
            <p className="text-xs text-text-muted uppercase tracking-widest font-semibold">
              See it in action
            </p>
            <h2 className="text-3xl font-bold font-display">
              From question to chart in seconds
            </h2>
          </div>

          {/* Mock workspace */}
          <div className="rounded-2xl border border-[#1e2d45] overflow-hidden shadow-card bg-surface">
            {/* Window chrome */}
            <div className="flex items-center gap-2 px-4 h-10 border-b border-[#1e2d45] bg-[#0d1220]">
              <div className="w-3 h-3 rounded-full bg-red-500/70" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/70" />
              <span className="ml-4 text-xs text-text-muted font-mono">ask-your-data · workspace</span>
            </div>

            <div className="grid grid-cols-2 min-h-[360px]">
              {/* Chat panel */}
              <div className="border-r border-[#1e2d45] p-5 flex flex-col gap-4">
                {DEMO_MESSAGES.map((m, i) => (
                  <div
                    key={i}
                    className={`flex gap-2.5 ${m.role === "user" ? "flex-row-reverse" : ""}`}
                  >
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs flex-shrink-0
                      ${m.role === "user"
                        ? "bg-primary/20 text-primary-glow border border-primary/30"
                        : "bg-accent/10 text-accent border border-accent/20"
                      }`}
                    >
                      {m.role === "user" ? "U" : "AI"}
                    </div>
                    <div className={`text-sm px-3.5 py-2.5 rounded-2xl max-w-[80%]
                      ${m.role === "user"
                        ? "bg-primary/15 border border-primary/20 rounded-tr-sm"
                        : "bg-[#131929] border border-[#1e2d45] rounded-tl-sm"
                      }`}
                    >
                      {m.text.split("**").map((part, j) =>
                        j % 2 === 1
                          ? <strong key={j} className="text-primary-glow">{part}</strong>
                          : part
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Viz panel */}
              <div className="p-5 flex flex-col gap-3">
                {/* Mock bar chart */}
                <div className="rounded-xl border border-[#1e2d45] p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#e2e8f0]">Sales by Region</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-primary/10 text-primary-glow">bar</span>
                  </div>
                  <div className="flex items-end gap-2 h-28">
                    {[85, 55, 70, 40, 95].map((h, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1">
                        <div
                          className="w-full rounded-t-md transition-all"
                          style={{
                            height: `${h}%`,
                            background: ["#6366f1","#22d3ee","#10b981","#f59e0b","#8b5cf6"][i],
                          }}
                        />
                        <span className="text-[9px] text-text-muted">
                          {["N","S","E","W","C"][i]}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Mock insight */}
                <div className="rounded-xl border border-[#1e2d45] bg-[#131929] p-3 space-y-1">
                  <div className="flex items-center gap-1.5">
                    <TrendingUp size={12} className="text-yellow-400" />
                    <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">
                      Insight
                    </span>
                  </div>
                  <p className="text-xs text-[#cbd5e1]">
                    <strong className="text-[#e2e8f0]">Central</strong> leads all regions at $2.1M,
                    18% above average.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12 space-y-2">
            <p className="text-xs text-text-muted uppercase tracking-widest font-semibold">
              Why Ask Your Data
            </p>
            <h2 className="text-3xl font-bold font-display">
              Built for speed,{" "}
              <span className="gradient-text">designed for insight</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className={`rounded-2xl border ${f.border} p-6 space-y-4 ${f.bg} transition-all hover:shadow-glow-sm`}
              >
                <div className={`w-10 h-10 rounded-xl ${f.bg} ${f.border} border flex items-center justify-center`}>
                  <f.icon size={20} className={f.accent} />
                </div>
                <div>
                  <h3 className="font-semibold text-[#e2e8f0] font-display">{f.title}</h3>
                  <p className="text-sm text-text-muted mt-1 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className="py-20 px-6">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <h2 className="text-3xl font-bold font-display">
            Ready to understand your data?
          </h2>
          <p className="text-[#94a3b8]">
            Upload a CSV and ask your first question in seconds.
          </p>
          <Link
            href="/app/datasets"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl
              bg-primary hover:bg-primary-glow text-white font-semibold transition-all
              shadow-glow text-sm"
          >
            Get started — it&apos;s free
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#1e2d45] py-8 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-sm text-text-muted">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-primary flex items-center justify-center">
              <Sparkles size={10} className="text-white" />
            </div>
            <span className="font-display">Ask Your Data</span>
          </div>
          <span>Built with Next.js · FastAPI · pandas</span>
        </div>
      </footer>
    </div>
  );
}
