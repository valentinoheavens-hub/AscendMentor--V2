// ─────────────────────────────────────────────────────────────────────────────
// Dashboard Layout — server component
// Checks onboarding + assessment completion and routes accordingly.
// Renders a persistent sidebar + top nav for authenticated learners.
// ─────────────────────────────────────────────────────────────────────────────

import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";
import { getBeltForScore } from "@/constants/bgc-frameworks";
import {
  LayoutDashboard,
  BarChart3,
  MessageSquare,
  Star,
  Settings,
  LogOut,
  Trophy,
} from "lucide-react";

export const metadata: Metadata = {
  title: "AscendMentor AI — Dashboard",
};

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/assessment", label: "Clarity Assessment", icon: BarChart3 },
  { href: "/coaching", label: "BGC Coach", icon: MessageSquare },
  { href: "/progress", label: "My Progress", icon: Star },
  { href: "/validate", label: "Peer Validation", icon: Trophy },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Load learner state for routing decisions
  const { data: learner } = await supabase
    .from("learners")
    .select("full_name, first_name, onboarding_complete, assessment_complete")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!learner?.onboarding_complete) redirect("/onboarding");

  // Belt comes from latest mastery snapshot
  const { data: mastery } = await supabase
    .from("mastery_scores")
    .select("belt_tier, total_score")
    .eq("user_id", user.id)
    .order("snapshot_date", { ascending: false })
    .limit(1)
    .maybeSingle();

  const displayName = learner?.first_name ?? user.email?.split("@")[0] ?? "Leader";
  const totalScore = mastery?.total_score ?? 0;
  const belt = mastery?.belt_tier ?? getBeltForScore(totalScore).id;

  return (
    <div className="min-h-screen bg-background flex">
      {/* ── Sidebar ── */}
      <aside className="hidden lg:flex flex-col w-60 bg-card border-r border-border/50 fixed inset-y-0 left-0 z-30">
        {/* Brand */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-border/40">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
            <span className="text-primary-foreground font-bold text-sm font-display">A</span>
          </div>
          <div>
            <p className="font-display font-bold text-sm text-foreground leading-none">AscendMentor</p>
            <p className="text-[10px] text-muted-foreground tracking-wider uppercase mt-0.5">AI by BGC</p>
          </div>
        </div>

        {/* Learner belt badge */}
        <div className="px-5 py-4 border-b border-border/40">
          <p className="text-xs text-muted-foreground mb-1">Signed in as</p>
          <p className="font-semibold text-sm text-foreground truncate">{displayName}</p>
          <div className="mt-2">
            <span className={cn("belt-badge text-[10px]", `belt-badge-${belt}`)}>
              {belt.replace("_", " ").toUpperCase()}
            </span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-3 space-y-1">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors group"
            >
              <Icon className="h-4 w-4 flex-shrink-0 group-hover:text-primary transition-colors" />
              {label}
            </Link>
          ))}
        </nav>

        {/* Sign out */}
        <div className="px-3 py-4 border-t border-border/40">
          <form action="/auth/signout" method="POST">
            <button
              type="submit"
              className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            >
              <LogOut className="h-4 w-4 flex-shrink-0" />
              Sign out
            </button>
          </form>
        </div>
      </aside>

      {/* ── Main content ── */}
      <div className="flex-1 lg:ml-60 flex flex-col min-h-screen">
        {/* Top bar (mobile + breadcrumb) */}
        <header className="sticky top-0 z-20 bg-background/80 backdrop-blur-md border-b border-border/40 px-4 lg:px-8 py-3 flex items-center justify-between">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 lg:hidden">
            <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xs font-display">A</span>
            </div>
            <span className="font-display font-semibold text-sm">AscendMentor</span>
          </div>

          {/* BGC tagline — visible desktop */}
          <div className="hidden lg:flex items-center gap-2 text-xs text-muted-foreground">
            <span>BGC Blackbelt OS™</span>
          </div>

          <div className="flex items-center gap-3">
            <span className={cn("belt-badge text-[10px]", `belt-badge-${belt}`)}>
              {belt.replace("_", " ").toUpperCase()}
            </span>
          </div>
        </header>

        {/* Page */}
        <main className="flex-1 p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
