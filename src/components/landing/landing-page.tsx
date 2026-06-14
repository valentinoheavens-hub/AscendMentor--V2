// ─────────────────────────────────────────────────────────────────────────────
// Landing Page — ClarityOS by BGC
// ClarityOS blue-accented marketing page. Themeable (light/dark) via tokens.
// ─────────────────────────────────────────────────────────────────────────────

import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import {
  ArrowRight,
  BarChart3,
  Building2,
  CheckCircle2,
  Cog,
  Crown,
  MessageSquare,
  Sparkles,
  Target,
  Trophy,
  Users,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

interface LandingPageProps {
  isAuthenticated: boolean;
}

const DIMENSIONS = [
  {
    name: "Strategic Direction",
    desc: "Clarity of purpose, goals, priorities, and where your organisation is headed.",
    icon: Target,
    color: "#2563EB",
    bg: "bg-blue-500/10",
  },
  {
    name: "People Clarity",
    desc: "Role clarity, accountability, talent architecture, and leadership alignment.",
    icon: Users,
    color: "#059669",
    bg: "bg-emerald-500/10",
  },
  {
    name: "Systems & Processes",
    desc: "Operational infrastructure, workflows, SOPs, and execution capacity.",
    icon: Cog,
    color: "#7C3AED",
    bg: "bg-violet-500/10",
  },
  {
    name: "Structural Clarity",
    desc: "Organisational design, reporting architecture, governance, and growth infrastructure.",
    icon: Building2,
    color: "#DC2626",
    bg: "bg-red-500/10",
  },
  {
    name: "Leadership Mastery",
    desc: "Personal leadership clarity, self-mastery, executive presence, and impact capacity.",
    icon: Crown,
    color: "#F59E0B",
    bg: "bg-amber-500/10",
  },
];

const SCORE_COMPONENTS = [
  { label: "Clarity Assessment", pts: 30, color: "#2563EB" },
  { label: "Behavioural Evidence", pts: 25, color: "#059669" },
  { label: "Learning Progress", pts: 20, color: "#7C3AED" },
  { label: "AI Session Quality", pts: 15, color: "#DC2626" },
  { label: "Peer Validation", pts: 10, color: "#16C0F0" },
];

const BELTS = [
  { name: "Clarity Seeker", range: "0–19", color: "#6B7280", subtitle: "Journey Beginning" },
  { name: "Yellow Belt", range: "20–39", color: "#D97706", subtitle: "Clarity Builder" },
  { name: "Green Belt", range: "40–59", color: "#059669", subtitle: "Clarity Practitioner" },
  { name: "Blue Belt", range: "60–79", color: "#1D4ED8", subtitle: "Clarity Champion" },
  { name: "Black Belt", range: "80–100", color: "#B8960C", subtitle: "Mastery Engineered" },
];

const STEPS = [
  {
    n: "01",
    title: "Take the Clarity Assessment™",
    desc: "26 questions across 5 leadership dimensions. Ten minutes reveals exactly where your clarity gaps are — and where to attack first.",
    icon: BarChart3,
  },
  {
    n: "02",
    title: "Coach with BGC AI — 24/7",
    desc: "Your personalised coach is trained on BGC's five proprietary frameworks. It knows your scores, your context, and your next move.",
    icon: MessageSquare,
  },
  {
    n: "03",
    title: "Log evidence, earn your belt",
    desc: "Weekly behavioural evidence + peer validation turn insight into proof. Your BGC Mastery Score™ climbs. Your belt follows.",
    icon: Trophy,
  },
];

const PLANS = [
  {
    name: "Seeker",
    price: "Free",
    period: "forever",
    highlight: false,
    cta: "Start free",
    features: [
      "Clarity Assessment™ — Round 1",
      "BGC Mastery Score™ baseline",
      "5 AI coaching sessions / month",
      "Belt progression tracking",
    ],
  },
  {
    name: "Builder",
    price: "₦75,000",
    period: "/month",
    highlight: true,
    cta: "Upgrade to Builder",
    features: [
      "Unlimited AI coaching sessions",
      "Quarterly re-assessments",
      "Weekly reflection & evidence logs",
      "Peer validation (up to 5 validators)",
      "WhatsApp coaching access",
      "Priority support",
    ],
  },
  {
    name: "Professional",
    price: "₦180,000",
    period: "/month",
    highlight: false,
    cta: "Go Professional",
    features: [
      "Everything in Builder",
      "Assessment debrief deep-dives",
      "Advanced mastery analytics",
      "Quarterly strategy clinics",
      "Direct line to BGC consultants",
      "Team licence discounts",
    ],
  },
];

export function LandingPage({ isAuthenticated }: LandingPageProps) {
  const primaryHref = isAuthenticated ? "/dashboard" : "/signup";
  const primaryLabel = isAuthenticated ? "Open dashboard" : "Start free assessment";

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* ── Nav ── */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/40">
        <nav className="max-w-6xl mx-auto px-5 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <Logo className="h-9 w-auto" priority />
          </Link>

          <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#dimensions" className="hover:text-foreground transition-colors">Framework</a>
            <a href="#how-it-works" className="hover:text-foreground transition-colors">How it works</a>
            <a href="#mastery-score" className="hover:text-foreground transition-colors">Mastery Score™</a>
            <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
            <Link href="/institutions" className="hover:text-foreground transition-colors">For institutions</Link>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            {!isAuthenticated && (
              <Link
                href="/login"
                className="hidden sm:block text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Sign in
              </Link>
            )}
            <Link
              href={primaryHref}
              className="btn-gold px-4 py-2 rounded-lg text-sm transition-colors"
            >
              {isAuthenticated ? "Dashboard" : "Get started"}
            </Link>
          </div>
        </nav>
      </header>

      {/* ── Hero ── */}
      <section className="relative">
        <div className="absolute inset-0 landing-glow pointer-events-none" />
        <div className="absolute inset-0 landing-grid-bg pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-5 lg:px-8 pt-20 pb-16 lg:pt-28 lg:pb-24">
          <div className="grid lg:grid-cols-2 gap-14 items-center">
            {/* Copy */}
            <div className="landing-stagger">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-xs font-medium text-primary mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ticker-pulse" />
                Built on BGC&apos;s 5 proprietary leadership frameworks
              </div>

              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.08] tracking-tight">
                Clarity.{" "}
                <span className="text-gold-gradient">Mastery.</span>{" "}
                Scale.
              </h1>

              <p className="mt-6 text-base lg:text-lg text-muted-foreground leading-relaxed max-w-xl">
                The AI-powered leadership mastery platform for African founders and
                executives. Measure your clarity across 5 dimensions, coach with an AI
                trained on the Blackbelt OS™, and engineer your way to Black Belt.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Link
                  href={primaryHref}
                  className="btn-gold inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-base transition-colors"
                >
                  {primaryLabel}
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <a
                  href="#how-it-works"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-base font-medium border border-border/60 text-foreground hover:border-primary/50 hover:bg-white/5 transition-colors"
                >
                  See how it works
                </a>
              </div>

              <p className="mt-5 text-xs text-muted-foreground">
                Free Clarity Assessment™ · No card required · 10 minutes
              </p>
            </div>

            {/* Hero visual — mastery score card */}
            <div className="relative hidden lg:block">
              <div className="animate-float-slow">
                <div className="bg-card border border-border/50 rounded-3xl p-8 shadow-2xl shadow-black/40 max-w-md mx-auto">
                  <p className="text-[10px] font-semibold text-muted-foreground tracking-[0.2em] uppercase mb-6">
                    BGC Mastery Score™
                  </p>

                  {/* Score ring */}
                  <div className="relative w-44 h-44 mx-auto">
                    <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                      <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="7" />
                      <circle
                        cx="50" cy="50" r="45" fill="none"
                        stroke="url(#goldGrad)" strokeWidth="7" strokeLinecap="round"
                        strokeDasharray="283"
                        strokeDashoffset="51"
                      />
                      <defs>
                        <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#1B6FF3" />
                          <stop offset="100%" stopColor="#16C0F0" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-5xl font-bold font-display text-foreground">82</span>
                      <span className="text-xs text-muted-foreground">/100</span>
                    </div>
                  </div>

                  <div className="mt-6 text-center">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold belt-black border">
                      <Crown className="h-3.5 w-3.5" />
                      BLACK BELT
                    </span>
                    <p className="text-xs text-muted-foreground mt-2">Mastery Engineered</p>
                  </div>

                  {/* Mini breakdown bars */}
                  <div className="mt-7 space-y-2.5">
                    {SCORE_COMPONENTS.slice(0, 3).map((c) => (
                      <div key={c.label}>
                        <div className="flex justify-between text-[11px] mb-1">
                          <span className="text-muted-foreground">{c.label}</span>
                          <span className="text-foreground font-medium">{Math.round(c.pts * 0.82)}/{c.pts}</span>
                        </div>
                        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: "82%", background: c.color }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Floating chat chip */}
              <div className="absolute -bottom-5 -left-6 bg-card border border-border/50 rounded-2xl px-4 py-3 shadow-xl shadow-black/40 max-w-[240px]">
                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-primary/15 flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-snug">
                    <span className="text-foreground font-medium">BGC Coach:</span>{" "}
                    Your Strategic Direction jumped 12 points this quarter. Let&apos;s lock it in…
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats strip ── */}
      <section className="border-y border-border/40 bg-card/40">
        <div className="max-w-6xl mx-auto px-5 lg:px-8 py-10 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: "5", label: "Proprietary BGC frameworks", color: "#1B6FF3" },
            { value: "26", label: "Assessment questions, 5 dimensions", color: "#7C3AED" },
            { value: "24/7", label: "AI coaching availability", color: "#059669" },
            { value: "90", label: "Days per mastery cycle", color: "#F59E0B" },
          ].map((s) => (
            <div key={s.label}>
              <p className="font-display text-3xl lg:text-4xl font-bold" style={{ color: s.color }}>{s.value}</p>
              <p className="text-xs text-muted-foreground mt-2 leading-snug">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Five dimensions ── */}
      <section id="dimensions" className="max-w-6xl mx-auto px-5 lg:px-8 py-20 lg:py-28">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-xs font-semibold text-primary tracking-[0.25em] uppercase mb-4">The Framework</p>
          <h2 className="font-display text-3xl lg:text-4xl font-bold tracking-tight">
            Five dimensions. One complete picture of your leadership.
          </h2>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            Most leaders run on instinct. The Clarity Assessment™ measures what instinct
            can&apos;t see — across the exact dimensions BGC uses with executive clients.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {DIMENSIONS.map((d) => {
            const Icon = d.icon;
            return (
              <div
                key={d.name}
                className="landing-card bg-card border border-border/40 rounded-2xl p-6"
              >
                <div className={`w-11 h-11 rounded-xl ${d.bg} flex items-center justify-center mb-5`}>
                  <Icon className="h-5 w-5" style={{ color: d.color }} />
                </div>
                <h3 className="font-display font-semibold text-lg">{d.name}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{d.desc}</p>
              </div>
            );
          })}

          {/* CTA card to fill the grid */}
          <div className="landing-card bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/30 rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <div className="w-11 h-11 rounded-xl bg-primary/20 flex items-center justify-center mb-5">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-display font-semibold text-lg">Where do you stand?</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Ten minutes from now you&apos;ll know — with a score, a belt, and a plan.
              </p>
            </div>
            <Link
              href={primaryHref}
              className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
            >
              Take the assessment <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how-it-works" className="border-y border-border/40 bg-card/30">
        <div className="max-w-6xl mx-auto px-5 lg:px-8 py-20 lg:py-28">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <p className="text-xs font-semibold text-primary tracking-[0.25em] uppercase mb-4">How it works</p>
            <h2 className="font-display text-3xl lg:text-4xl font-bold tracking-tight">
              Assess. Coach. Prove it.
            </h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              Insight without evidence is just opinion. ClarityOS closes the loop —
              every 90 days, your mastery is measured, coached, and validated.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {STEPS.map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.n} className="landing-card bg-card border border-border/40 rounded-2xl p-7 relative">
                  <span className="absolute top-6 right-6 font-display text-4xl font-bold text-white/5 select-none">
                    {s.n}
                  </span>
                  <div className="w-11 h-11 rounded-xl bg-primary/15 flex items-center justify-center mb-5">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-display font-semibold text-lg pr-10">{s.title}</h3>
                  <p className="mt-2.5 text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Mastery Score ── */}
      <section id="mastery-score" className="max-w-6xl mx-auto px-5 lg:px-8 py-20 lg:py-28">
        <div className="grid lg:grid-cols-2 gap-14 items-center">
          <div>
            <p className="text-xs font-semibold text-primary tracking-[0.25em] uppercase mb-4">
              BGC Mastery Score™
            </p>
            <h2 className="font-display text-3xl lg:text-4xl font-bold tracking-tight">
              One number that can&apos;t be faked.
            </h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              Your Mastery Score™ blends five weighted signals — assessment results,
              real behavioural evidence, learning depth, coaching quality, and what your
              peers actually observe. It rewards leaders who do the work, not leaders
              who talk about it.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                "Recalculated continuously as evidence lands",
                "Peer-validated — colleagues confirm what changed",
                "Belt promotions are earned, never given",
              ].map((t) => (
                <li key={t} className="flex items-start gap-3 text-sm text-foreground">
                  <CheckCircle2 className="h-4.5 w-4.5 text-primary flex-shrink-0 mt-0.5" />
                  {t}
                </li>
              ))}
            </ul>
          </div>

          {/* Weight breakdown card */}
          <div className="bg-card border border-border/50 rounded-3xl p-8">
            <p className="text-[10px] font-semibold text-muted-foreground tracking-[0.2em] uppercase mb-6">
              Score composition — 100 points
            </p>

            {/* Stacked bar */}
            <div className="flex h-4 rounded-full overflow-hidden mb-7">
              {SCORE_COMPONENTS.map((c) => (
                <div
                  key={c.label}
                  style={{ width: `${c.pts}%`, background: c.color }}
                  title={`${c.label} — ${c.pts} pts`}
                />
              ))}
            </div>

            <div className="space-y-4">
              {SCORE_COMPONENTS.map((c) => (
                <div key={c.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: c.color }} />
                    <span className="text-sm text-foreground">{c.label}</span>
                  </div>
                  <span className="text-sm font-semibold text-muted-foreground">{c.pts} pts</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Belt journey ── */}
      <section className="border-y border-border/40 bg-card/30">
        <div className="max-w-6xl mx-auto px-5 lg:px-8 py-20 lg:py-28">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <p className="text-xs font-semibold text-primary tracking-[0.25em] uppercase mb-4">The Belt Journey</p>
            <h2 className="font-display text-3xl lg:text-4xl font-bold tracking-tight">
              From Clarity Seeker to Black Belt.
            </h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              Five belts. Each one a verified milestone in your leadership mastery —
              the same progression BGC engineers with its executive clients.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {BELTS.map((b, i) => (
              <div
                key={b.name}
                className="landing-card bg-card border border-border/40 rounded-2xl p-5 text-center relative"
              >
                {i === BELTS.length - 1 && (
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[9px] font-bold tracking-wider uppercase bg-primary text-primary-foreground px-2.5 py-0.5 rounded-full">
                    The Goal
                  </span>
                )}
                <div
                  className="w-12 h-2.5 rounded-full mx-auto mb-4"
                  style={{ background: b.color }}
                />
                <p className="font-display font-semibold text-sm">{b.name}</p>
                <p className="text-[11px] text-muted-foreground mt-1">{b.subtitle}</p>
                <p className="text-[10px] text-muted-foreground/70 mt-2 font-mono">{b.range} pts</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── AI Coach showcase ── */}
      <section className="max-w-6xl mx-auto px-5 lg:px-8 py-20 lg:py-28">
        <div className="grid lg:grid-cols-2 gap-14 items-center">
          {/* Chat mockup */}
          <div className="order-2 lg:order-1">
            <div className="bg-card border border-border/50 rounded-3xl p-6 shadow-2xl shadow-black/30">
              <div className="flex items-center gap-3 pb-4 border-b border-border/40 mb-5">
                <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center">
                  <span className="text-base">🥋</span>
                </div>
                <div>
                  <p className="text-sm font-semibold">BGC AI Coach</p>
                  <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    Online — trained on Blackbelt OS™
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="chat-user px-4 py-3 ml-10 text-sm text-foreground">
                  My team keeps missing deadlines but everyone says they&apos;re &quot;busy&quot;. Where do I start?
                </div>
                <div className="chat-ai px-4 py-3 mr-6 text-sm text-muted-foreground leading-relaxed">
                  <span className="text-foreground">That&apos;s a Systems &amp; Processes signal, not a people problem.</span>{" "}
                  Your assessment shows S&amp;P at 11/20 — busyness without throughput
                  usually means missing workflow ownership. Let&apos;s apply the
                  People · Systems · Structure framework: first, name the 3 workflows
                  where deadlines die…
                </div>
                <div className="flex items-center gap-2 text-[11px] text-muted-foreground pl-1">
                  <span className="w-1 h-1 rounded-full bg-primary animate-ticker-pulse" />
                  Cites: People · Systems · Structure — Systems pillar
                </div>
              </div>
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <p className="text-xs font-semibold text-primary tracking-[0.25em] uppercase mb-4">
              BGC AI Coach
            </p>
            <h2 className="font-display text-3xl lg:text-4xl font-bold tracking-tight">
              A coach that already knows your numbers.
            </h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              Generic AI gives generic advice. The BGC Coach is grounded in your Clarity
              Assessment™, your Mastery Score™, and five proprietary frameworks — so
              every answer is specific to your organisation, your gaps, your week.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                "Framework-cited answers — never vague platitudes",
                "Weekly reflections that convert into behavioural evidence",
                "Assessment debriefs that turn scores into 90-day plans",
              ].map((t) => (
                <li key={t} className="flex items-start gap-3 text-sm">
                  <CheckCircle2 className="h-4.5 w-4.5 text-primary flex-shrink-0 mt-0.5" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── Founder quote ── */}
      <section className="border-y border-border/40 bg-gradient-to-b from-primary/[0.07] to-transparent">
        <div className="max-w-3xl mx-auto px-5 lg:px-8 py-20 text-center">
          <p className="font-display text-2xl lg:text-3xl font-semibold leading-snug text-foreground">
            &ldquo;The art of mastering your world begins with the art of{" "}
            <span className="text-gold-gradient">self&nbsp;mastery</span>.&rdquo;
          </p>
          <div className="mt-7 flex items-center justify-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm font-display">VH</span>
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold">Dr. Valentino Heavens</p>
              <p className="text-xs text-muted-foreground">Founder, Blackbelt Global Consulting</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="max-w-6xl mx-auto px-5 lg:px-8 py-20 lg:py-28">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-xs font-semibold text-primary tracking-[0.25em] uppercase mb-4">Pricing</p>
          <h2 className="font-display text-3xl lg:text-4xl font-bold tracking-tight">
            Start free. Upgrade when you&apos;re ready to climb.
          </h2>
          <p className="mt-4 text-muted-foreground">
            Pay with card, bank transfer, mobile money, or M-Pesa. African founders
            pricing available on request.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-5 items-stretch">
          {PLANS.map((p) => (
            <div
              key={p.name}
              className={`relative rounded-3xl p-7 flex flex-col border ${
                p.highlight
                  ? "bg-gradient-to-b from-primary/15 to-card border-primary/40"
                  : "bg-card border-border/40 landing-card"
              }`}
            >
              {p.highlight && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-bold tracking-wider uppercase bg-primary text-primary-foreground px-3 py-1 rounded-full">
                  Most Popular
                </span>
              )}
              <p className="font-display font-semibold text-lg">{p.name}</p>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="font-display text-4xl font-bold">{p.price}</span>
                <span className="text-sm text-muted-foreground">{p.period}</span>
              </div>
              <ul className="mt-6 space-y-3 flex-1">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href={isAuthenticated ? "/upgrade" : "/signup"}
                className={`mt-7 inline-flex items-center justify-center py-3 rounded-xl text-sm font-semibold transition-colors ${
                  p.highlight
                    ? "btn-gold"
                    : "border border-border/60 text-foreground hover:border-primary/50 hover:bg-white/5"
                }`}
              >
                {p.cta}
              </Link>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-8">
          🛡️ 30-day money-back guarantee · ✋ Cancel any time · 🌍 Paystack · Flutterwave · M-Pesa
        </p>

        {/* Enterprise — contact-only package */}
        <div className="mt-6 bg-gradient-to-r from-primary/15 via-primary/5 to-transparent border border-primary/30 rounded-2xl px-7 py-6 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="lg:max-w-md">
            <p className="text-xs font-semibold text-primary tracking-[0.2em] uppercase mb-1">Enterprise</p>
            <p className="font-display font-semibold text-lg">Register your whole organisation</p>
            <p className="text-sm text-muted-foreground mt-1">
              Bulk seats for banks, agencies, universities and corporates. Your team joins
              through one invite link — no individual applications — and you get an
              organisation clarity dashboard.{" "}
              <span className="text-foreground font-medium">Custom pricing — let&apos;s talk.</span>
            </p>
          </div>
          <Link
            href="/institutions"
            className="btn-gold inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm whitespace-nowrap transition-colors"
          >
            Contact sales
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="relative border-t border-border/40 overflow-hidden">
        <div className="absolute inset-0 landing-glow pointer-events-none" />
        <div className="relative max-w-3xl mx-auto px-5 lg:px-8 py-20 lg:py-28 text-center">
          <h2 className="font-display text-3xl lg:text-5xl font-bold tracking-tight leading-tight">
            Your Black Belt journey starts with{" "}
            <span className="text-gold-gradient">one honest score</span>.
          </h2>
          <p className="mt-5 text-muted-foreground text-base lg:text-lg max-w-xl mx-auto">
            26 questions. 10 minutes. A number you can build on for the rest of your
            leadership career.
          </p>
          <Link
            href={primaryHref}
            className="btn-gold inline-flex items-center gap-2 px-8 py-4 rounded-xl text-base mt-9 transition-colors"
          >
            {primaryLabel}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-border/40">
        <div className="max-w-6xl mx-auto px-5 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex flex-col gap-2">
              <Logo className="h-9 w-auto" />
              <p className="text-[10px] text-muted-foreground tracking-[0.2em] uppercase">
                Blackbelt Global Consulting
              </p>
            </div>

            <div className="flex items-center gap-6 text-xs text-muted-foreground">
              <a href="#dimensions" className="hover:text-foreground transition-colors">Framework</a>
              <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
              <Link href="/institutions" className="hover:text-foreground transition-colors">For institutions</Link>
              <Link href="/login" className="hover:text-foreground transition-colors">Sign in</Link>
              <a href="mailto:support@clarityos.ai" className="hover:text-foreground transition-colors">
                support@clarityos.ai
              </a>
            </div>
          </div>

          <p className="text-center text-[11px] text-muted-foreground/60 mt-10">
            © {new Date().getFullYear()} Blackbelt Global Consulting Limited. BGC Mastery Score™,
            Clarity Assessment™ and Blackbelt OS™ are trademarks of BGC.
          </p>
        </div>
      </footer>
    </div>
  );
}
