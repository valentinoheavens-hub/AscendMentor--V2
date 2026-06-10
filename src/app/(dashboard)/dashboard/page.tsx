// ─────────────────────────────────────────────────────────────────────────────
// Dashboard Home — server component
// Shows learner state: assessment CTA if not yet taken, mastery snapshot if done.
// Full dashboard with score rings, radar chart etc. will be built in Step 6.
// ─────────────────────────────────────────────────────────────────────────────

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowRight, BarChart3, Trophy, Flame, MessageSquare } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getBeltForScore } from "@/constants/bgc-frameworks";
import { cn } from "@/lib/utils";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Fetch learner + latest mastery in parallel
  const [learnerRes, masteryRes] = await Promise.all([
    supabase
      .from("learners")
      .select("full_name, first_name, assessment_complete, subscription_tier")
      .eq("user_id", user.id)
      .maybeSingle(),

    supabase
      .from("mastery_scores")
      .select("total_score, ca_score, be_score, lp_score, ai_score, ps_score, belt_tier, current_streak_weeks, snapshot_date")
      .eq("user_id", user.id)
      .order("snapshot_date", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const learner = learnerRes.data;
  const mastery = masteryRes.data;

  const firstName = learner?.first_name ?? "Leader";
  const totalScore = mastery?.total_score ?? 0;
  // Belt comes from mastery snapshot; fall back to computing from score
  const belt = mastery?.belt_tier ?? getBeltForScore(totalScore).id;
  const assessmentDone = learner?.assessment_complete ?? false;
  const streakCount = mastery?.current_streak_weeks ?? 0;

  // Time-of-day greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="space-y-8 animate-fade-up">
      {/* ── Header ── */}
      <div>
        <h1 className="font-display text-2xl lg:text-3xl font-bold text-foreground">
          {greeting}, {firstName} 👋
        </h1>
        <p className="text-muted-foreground mt-1">
          Your Blackbelt OS™ leadership mastery hub.
        </p>
      </div>

      {/* ── Assessment CTA (if not yet taken) ── */}
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

      {/* ── Stats row ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Mastery Score */}
        <Card className="border-border/50">
          <CardContent className="pt-5 pb-5">
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-2">
              Mastery Score™
            </p>
            <p className="text-3xl font-display font-bold text-foreground">
              {assessmentDone ? totalScore.toFixed(0) : "—"}
            </p>
            <div className="mt-2">
              <span className={cn("belt-badge text-[10px]", `belt-badge-${belt}`)}>
                {belt.replace("_", " ").toUpperCase()}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Weekly streak */}
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
              {streakCount === 0 ? "No reflections yet" : `${streakCount} week${streakCount !== 1 ? "s" : ""} in a row`}
            </p>
          </CardContent>
        </Card>

        {/* Belt tier */}
        <Card className="border-border/50">
          <CardContent className="pt-5 pb-5">
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-2">
              Current Belt
            </p>
            <p className="text-3xl font-display font-bold text-foreground capitalize">
              {belt === "yellow_belt" ? "Yellow" :
               belt === "green_belt" ? "Green" :
               belt === "blue_belt" ? "Blue" :
               belt === "black_belt" ? "Black" : "Seeker"}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              {assessmentDone ? `Score: ${totalScore.toFixed(0)}/100` : "Complete assessment"}
            </p>
          </CardContent>
        </Card>

        {/* Subscription */}
        <Card className="border-border/50">
          <CardContent className="pt-5 pb-5">
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-2">
              Programme
            </p>
            <p className="text-lg font-display font-bold text-foreground">
              {learner?.subscription_tier === "beta_90" ? "Beta 90-Day" :
               learner?.subscription_tier === "monthly" ? "Monthly" :
               learner?.subscription_tier === "enterprise" ? "Enterprise" : "Free"}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              BGC Blackbelt OS™
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ── Quick links ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link href="/assessment" className="group">
          <Card className="border-border/50 hover:border-primary/40 transition-colors h-full">
            <CardHeader className="pb-2">
              <div className="w-9 h-9 rounded-lg bg-chart-1/10 flex items-center justify-center mb-1">
                <BarChart3 className="h-5 w-5 text-chart-1" />
              </div>
              <CardTitle className="text-base font-display group-hover:text-primary transition-colors">
                Clarity Assessment™
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                {assessmentDone
                  ? "Review your scores or take a new assessment round."
                  : "Measure your leadership clarity across 5 BGC dimensions."}
              </CardDescription>
            </CardContent>
          </Card>
        </Link>

        <Link href="/coaching" className="group">
          <Card className="border-border/50 hover:border-primary/40 transition-colors h-full">
            <CardHeader className="pb-2">
              <div className="w-9 h-9 rounded-lg bg-chart-2/10 flex items-center justify-center mb-1">
                <MessageSquare className="h-5 w-5 text-chart-2" />
              </div>
              <CardTitle className="text-base font-display group-hover:text-primary transition-colors">
                BGC AI Coach
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Chat with your personalised BGC framework coach — available 24/7.
              </CardDescription>
            </CardContent>
          </Card>
        </Link>

        <Link href="/validate" className="group">
          <Card className="border-border/50 hover:border-primary/40 transition-colors h-full">
            <CardHeader className="pb-2">
              <div className="w-9 h-9 rounded-lg bg-chart-3/10 flex items-center justify-center mb-1">
                <Trophy className="h-5 w-5 text-chart-3" />
              </div>
              <CardTitle className="text-base font-display group-hover:text-primary transition-colors">
                Peer Validation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Invite colleagues to validate your behavioural evidence and earn belt upgrades.
              </CardDescription>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
