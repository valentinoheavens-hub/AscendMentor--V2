// ─────────────────────────────────────────────────────────────────────────────
// Dashboard Home — server component
// Step 5: Full dashboard with Mastery Score ring, Clarity radar, dimension cards
// ─────────────────────────────────────────────────────────────────────────────

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  MessageSquare,
  Trophy,
  Flame,
  TrendingUp,
  Users,
  Layers,
  Target,
  Zap,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BGC_DIMENSIONS, MASTERY_BELTS, getBeltForScore, getClarityLabel } from "@/constants/bgc-frameworks";
import { cn } from "@/lib/utils";
import { MasteryRing } from "@/components/dashboard/mastery-ring";
import { ClarityRadar } from "@/components/dashboard/clarity-radar";
import { ScoreBreakdown } from "@/components/dashboard/score-breakdown";

// Dimension icon map
const DIMENSION_ICONS = {
  strategic_direction: Target,
  people_clarity: Users,
  systems_processes: Zap,
  structural_clarity: Layers,
  leadership_mastery: TrendingUp,
} as const;

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [learnerRes, masteryRes, assessmentRes, streakRes] = await Promise.all([
    supabase
      .from("learners")
      .select("full_name, first_name, assessment_complete, subscription_tier, onboarding_complete")
      .eq("user_id", user.id)
      .maybeSingle(),

    supabase
      .from("mastery_scores")
      .select("total_score, ca_score, be_score, lp_score, ps_score, ai_score, belt_tier, current_streak_weeks, snapshot_date")
      .eq("user_id", user.id)
      .order("snapshot_date", { ascending: false })
      .limit(1)
      .maybeSingle(),

    supabase
      .from("clarity_assessments")
      .select("leadership_mastery_pct, people_clarity_pct, strategic_direction_pct, structural_clarity_pct, systems_processes_pct, overall_pct, belt_tier, completed_at")
      .eq("user_id", user.id)
      .order("completed_at", { ascending: false })
      .limit(1)
      .maybeSingle(),

    supabase
      .from("weekly_streaks")
      .select("id")
      .eq("user_id", user.id)
      .eq("completed", true),
  ]);

  const learner = learnerRes.data;
  const mastery = masteryRes.data;
  const assessment = assessmentRes.data;

  const firstName = learner?.first_name ?? "Leader";
  const totalScore = mastery?.total_score ?? 0;
  const belt = MASTERY_BELTS.find(b => b.id === (mastery?.belt_tier ?? getBeltForScore(totalScore).id)) ?? MASTERY_BELTS[4];
  const assessmentDone = learner?.assessment_complete ?? false;
  const streakCount = mastery?.current_streak_weeks ?? 0;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  // Radar data from latest assessment
  const radarData = [
    { subject: "Leadership", score: Math.round(assessment?.leadership_mastery_pct ?? 0), fullMark: 100 },
    { subject: "People", score: Math.round(assessment?.people_clarity_pct ?? 0), fullMark: 100 },
    { subject: "Strategy", score: Math.round(assessment?.strategic_direction_pct ?? 0), fullMark: 100 },
    { subject: "Structure", score: Math.round(assessment?.structural_clarity_pct ?? 0), fullMark: 100 },
    { subject: "Systems", score: Math.round(assessment?.systems_processes_pct ?? 0), fullMark: 100 },
  ];

  // Dimension cards data
  const dimensionScores: Record<string, number> = {
    leadership_mastery: assessment?.leadership_mastery_pct ?? 0,
    people_clarity: assessment?.people_clarity_pct ?? 0,
    strategic_direction: assessment?.strategic_direction_pct ?? 0,
    structural_clarity: assessment?.structural_clarity_pct ?? 0,
    systems_processes: assessment?.systems_processes_pct ?? 0,
  };

  // Score breakdown components
  const scoreComponents = [
    { label: "Clarity Assessment", abbr: "CA", score: mastery?.ca_score ?? 0, max: 40, color: "#1B6FF3" },
    { label: "Behavioural Evidence", abbr: "BE", score: mastery?.be_score ?? 0, max: 25, color: "#059669" },
    { label: "Learning Progress", abbr: "LP", score: mastery?.lp_score ?? 0, max: 15, color: "#2563EB" },
    { label: "AI Session Quality", abbr: "AI", score: mastery?.ai_score ?? 0, max: 10, color: "#7C3AED" },
    { label: "Peer Validation", abbr: "PS", score: mastery?.ps_score ?? 0, max: 10, color: "#DC2626" },
  ];

  return (
    <div className="space-y-8 animate-fade-up">

      {/* ── Header ── */}
      <div>
        <h1 className="font-display text-2xl lg:text-3xl font-bold text-foreground">
          {greeting}, {firstName} 👋
        </h1>
        <p className="text-muted-foreground mt-1">Your Blackbelt OS™ leadership mastery hub.</p>
      </div>

      {/* ── Assessment CTA ── */}
      {!assessmentDone && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="pt-6 pb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h2 className="font-display font-semibold text-foreground text-lg">
                  Take your Clarity Assessment™
                </h2>
                <p className="text-muted-foreground text-sm mt-0.5">
                  30 questions. 10 minutes. Reveals your BGC Mastery Score™ across 5 leadership dimensions.
                </p>
              </div>
              <Link
                href="/assessment"
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors shrink-0"
              >
                Start assessment
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Mastery Score + Belt Hero ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Score Ring */}
        <Card className="border-border/50 flex flex-col items-center justify-center py-8 lg:col-span-1">
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-6">
            BGC Mastery Score™
          </p>
          <MasteryRing
            score={totalScore}
            beltName={belt.name}
            beltSubtitle={belt.subtitle}
            beltColor={belt.color}
            size={200}
          />
        </Card>

        {/* Stats + Streak */}
        <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-2 gap-4">

          {/* Streak */}
          <Card className="border-border/50">
            <CardContent className="pt-5 pb-5">
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-2">
                Weekly Streak
              </p>
              <div className="flex items-end gap-1.5">
                <p className="text-3xl font-display font-bold text-foreground">{streakCount}</p>
                <Flame className="h-5 w-5 text-orange-400 mb-1" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {streakCount === 0 ? "Start your first reflection" : `${streakCount} week${streakCount !== 1 ? "s" : ""} in a row`}
              </p>
            </CardContent>
          </Card>

          {/* Programme */}
          <Card className="border-border/50">
            <CardContent className="pt-5 pb-5">
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-2">
                Programme
              </p>
              <p className="text-xl font-display font-bold text-foreground capitalize">
                {learner?.subscription_tier === "beta_90" ? "Beta 90-Day" :
                 learner?.subscription_tier === "monthly" ? "Monthly" :
                 learner?.subscription_tier === "enterprise" ? "Enterprise" :
                 learner?.subscription_tier === "beta" ? "Beta" : "Free"}
              </p>
              <p className="text-xs text-muted-foreground mt-2">BGC Blackbelt OS™</p>
            </CardContent>
          </Card>

          {/* Overall clarity */}
          <Card className="border-border/50">
            <CardContent className="pt-5 pb-5">
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-2">
                Overall Clarity
              </p>
              <p className="text-3xl font-display font-bold text-foreground">
                {assessmentDone ? `${Math.round(assessment?.overall_pct ?? 0)}%` : "—"}
              </p>
              {assessmentDone && (
                <p className="text-xs mt-2" style={{ color: getClarityLabel(assessment?.overall_pct ?? 0).color }}>
                  {getClarityLabel(assessment?.overall_pct ?? 0).label}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Belt */}
          <Card className="border-border/50" style={{ borderColor: `${belt.color}30` }}>
            <CardContent className="pt-5 pb-5">
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-2">
                Current Belt
              </p>
              <p className="text-xl font-display font-bold" style={{ color: belt.color }}>
                {belt.name}
              </p>
              <p className="text-xs text-muted-foreground mt-2">{belt.subtitle}</p>
            </CardContent>
          </Card>

        </div>
      </div>

      {/* ── Clarity Profile (assessment done) ── */}
      {assessmentDone && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Radar Chart */}
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                Clarity Profile
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ClarityRadar data={radarData} color={belt.color} />
            </CardContent>
          </Card>

          {/* Dimension Cards */}
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                Dimension Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {BGC_DIMENSIONS.map((dim) => {
                const pct = Math.round(dimensionScores[dim.id] ?? 0);
                const clarityLabel = getClarityLabel(pct);
                const Icon = DIMENSION_ICONS[dim.id];
                return (
                  <div key={dim.id} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className="h-3.5 w-3.5 flex-shrink-0" style={{ color: dim.color }} />
                        <span className="text-xs font-medium text-foreground">{dim.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-foreground tabular-nums">{pct}%</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                          style={{ color: clarityLabel.color, backgroundColor: `${clarityLabel.color}18` }}>
                          {clarityLabel.label}
                        </span>
                      </div>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-border/40 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${pct}%`, backgroundColor: dim.color }}
                      />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

        </div>
      )}

      {/* ── Score Breakdown ── */}
      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Mastery Score Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScoreBreakdown components={scoreComponents} />
        </CardContent>
      </Card>

      {/* ── Quick Actions ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link href="/assessment" className="group">
          <Card className="border-border/50 hover:border-primary/40 transition-colors h-full">
            <CardHeader className="pb-2">
              <div className="w-9 h-9 rounded-lg bg-yellow-500/10 flex items-center justify-center mb-1">
                <BarChart3 className="h-5 w-5 text-yellow-500" />
              </div>
              <CardTitle className="text-base font-display group-hover:text-primary transition-colors">
                Clarity Assessment™
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              {assessmentDone
                ? "Review your scores or take a new assessment round."
                : "Measure your leadership clarity across 5 BGC dimensions."}
            </CardContent>
          </Card>
        </Link>

        <Link href="/coaching" className="group">
          <Card className="border-border/50 hover:border-primary/40 transition-colors h-full">
            <CardHeader className="pb-2">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center mb-1">
                <MessageSquare className="h-5 w-5 text-emerald-500" />
              </div>
              <CardTitle className="text-base font-display group-hover:text-primary transition-colors">
                BGC AI Coach
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Chat with your personalised BGC framework coach — available 24/7.
            </CardContent>
          </Card>
        </Link>

        <Link href="/validate" className="group">
          <Card className="border-border/50 hover:border-primary/40 transition-colors h-full">
            <CardHeader className="pb-2">
              <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center mb-1">
                <Trophy className="h-5 w-5 text-blue-500" />
              </div>
              <CardTitle className="text-base font-display group-hover:text-primary transition-colors">
                Peer Validation
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Invite colleagues to validate your evidence and earn belt upgrades.
            </CardContent>
          </Card>
        </Link>
      </div>

    </div>
  );
}
