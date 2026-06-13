// ─────────────────────────────────────────────────────────────────────────────
// /institutions — enterprise marketing page + inquiry form.
// Sales-led: institutions inquire, BGC creates the organisation + invite link.
// ─────────────────────────────────────────────────────────────────────────────

import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  BarChart3,
  Building2,
  CheckCircle2,
  LinkIcon,
  ShieldCheck,
  Users,
} from "lucide-react";
import { InquiryForm } from "@/components/landing/inquiry-form";

export const metadata: Metadata = {
  title: "For Institutions — AscendMentor AI",
  description:
    "Seat-based AscendMentor AI licences for banks, government agencies, universities and corporates. Build leadership clarity across your whole management layer.",
};

const BENEFITS = [
  {
    icon: Users,
    title: "Seat-based licensing",
    desc: "Buy seats for your leadership team. Members join via your private invite link — no individual applications, no review queue.",
  },
  {
    icon: BarChart3,
    title: "Team clarity analytics",
    desc: "See your management layer's aggregate Mastery Scores, belt distribution, and weakest clarity dimensions — evidence for your L&D investment.",
  },
  {
    icon: LinkIcon,
    title: "One-link onboarding",
    desc: "Share a single invite link internally. Every member is activated instantly and counted against your seats automatically.",
  },
  {
    icon: ShieldCheck,
    title: "Invoice billing",
    desc: "Annual contracts with invoice and bank-transfer billing — built for institutional procurement, including NGN, KES and USD.",
  },
];

const STEPS = [
  { n: "1", text: "Tell us about your organisation and team size below." },
  { n: "2", text: "We agree seats and pricing, and issue your invoice." },
  { n: "3", text: "You receive a private invite link for your team." },
  { n: "4", text: "Members join instantly; you track team progress each quarter." },
];

export default function InstitutionsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/40">
        <nav className="max-w-6xl mx-auto px-5 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm font-display">A</span>
            </div>
            <div>
              <p className="font-display font-bold text-sm leading-none">AscendMentor</p>
              <p className="text-[9px] text-muted-foreground tracking-[0.2em] uppercase mt-0.5">AI by BGC</p>
            </div>
          </Link>
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
        </nav>
      </header>

      <main className="max-w-6xl mx-auto px-5 lg:px-8 py-16 lg:py-24">
        {/* Hero */}
        <div className="max-w-2xl mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-xs font-medium text-yellow-400 mb-6">
            <Building2 className="h-3.5 w-3.5" />
            For banks, agencies, universities &amp; corporates
          </div>
          <h1 className="font-display text-4xl lg:text-5xl font-bold leading-[1.1] tracking-tight">
            Leadership clarity for your{" "}
            <span className="text-gold-gradient">entire management layer</span>.
          </h1>
          <p className="mt-5 text-base lg:text-lg text-muted-foreground leading-relaxed">
            One executive with clarity is an asset. A whole leadership team with
            clarity is a different institution. AscendMentor AI Enterprise gives every
            leader in your organisation the Clarity Assessment™, 24/7 BGC coaching,
            and a measurable mastery journey — with team-level analytics for you.
          </p>
        </div>

        {/* Benefits */}
        <div className="grid sm:grid-cols-2 gap-5 mb-16">
          {BENEFITS.map((b) => {
            const Icon = b.icon;
            return (
              <div key={b.title} className="landing-card bg-card border border-border/40 rounded-2xl p-6">
                <div className="w-11 h-11 rounded-xl bg-primary/15 flex items-center justify-center mb-5">
                  <Icon className="h-5 w-5 text-yellow-400" />
                </div>
                <h3 className="font-display font-semibold text-lg">{b.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{b.desc}</p>
              </div>
            );
          })}
        </div>

        {/* How it works + form */}
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          <div>
            <p className="text-xs font-semibold text-yellow-400 tracking-[0.25em] uppercase mb-4">
              How it works
            </p>
            <h2 className="font-display text-2xl lg:text-3xl font-bold tracking-tight mb-8">
              From inquiry to onboarded team in days, not months.
            </h2>
            <ol className="space-y-5">
              {STEPS.map((s) => (
                <li key={s.n} className="flex items-start gap-4">
                  <span className="w-8 h-8 rounded-full bg-primary/15 text-yellow-400 font-display font-bold text-sm flex items-center justify-center flex-shrink-0">
                    {s.n}
                  </span>
                  <p className="text-sm text-muted-foreground leading-relaxed pt-1.5">{s.text}</p>
                </li>
              ))}
            </ol>

            <div className="mt-10 space-y-3">
              {[
                "Volume pricing from 10 seats",
                "Quarterly team clarity reports",
                "Optional BGC consulting engagement alongside",
              ].map((t) => (
                <div key={t} className="flex items-center gap-3 text-sm">
                  <CheckCircle2 className="h-4.5 w-4.5 text-yellow-400 flex-shrink-0" />
                  {t}
                </div>
              ))}
            </div>
          </div>

          <InquiryForm />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 py-10">
        <p className="text-center text-[11px] text-muted-foreground/60">
          © {new Date().getFullYear()} Blackbelt Global Consulting Limited ·{" "}
          <a href="mailto:support@ascendmentor.ai" className="hover:text-foreground transition-colors">
            support@ascendmentor.ai
          </a>
        </p>
      </footer>
    </div>
  );
}
