// My Progress page — assessment history, belt trajectory, mastery breakdown

import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getBeltForScore } from "@/constants/bgc-frameworks";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "My Progress — AscendMentor AI",
};

const DIMENSION_LABELS: Record<string, string> = {
  strategic_direction: "Strategic Direction",
  people_clarity: "People Clarity",
  systems_processes: "Systems & Processes",
  structural_clarity: "Structural Clarity",
  leadership_mastery: "Leadership Mastery",
};

const BELT_ORDER = ["seeker", "yellow_belt", "green_belt", "blue_belt", "black_belt"];
const BELT_LABELS: Record<string, string> = {
  seeker: "Clarity Seeker",
  yellow_belt: "Yellow Belt",
  green_belt: "Green Belt",
  blue_belt: "Blue Belt",
  black_belt: "Black Belt",
};

function ProgressBar({ value, max, className }: { value: number; max: number; className?: string }) {
  const pct = Math.round((value / max) * 100);
  return (
    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
      <div
        className={cn("h-full rounded-full transition-all", className ?? "bg-primary")}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export default async function ProgressPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [masteryRes, assessmentsRes, sessionsRes] = await Promise.all([
    supabase
      .from("mastery_scores")
      .select("*")
      .eq("user_id", user.id)
      .order("snapshot_date", { ascending: false })
      .limit(6),
    supabase
      .from("clarity_assessments")
      .select("*")
      .eq("user_id", user.id)
      .order("completed_at", { ascending: false })
      .limit(5),
    supabase
      .from("coaching_sessions")
      .select("id, session_type, started_at, message_count")
      .eq("user_id", user.id)
      .order("started_at", { ascending: false })
      .limit(5),
  ]);

  const masteryScores = masteryRes.data ?? [];
  const assessments = assessmentsRes.data ?? [];
  const sessions = sessionsRes.data ?? [];
  const latest = masteryScores[0];
  const currentBelt = latest?.belt_tier ?? "seeker";
  const totalScore = latest?.total_score ?? 0;
  const beltIndex = BELT_ORDER.indexOf(currentBelt);

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">My Progress</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Track your BGC Mastery Score™ and belt progression over time.
        </p>
      </div>

      {/* Belt Journey */}
      <section className="bg-card border border-border/40 rounded-2xl p-6">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
          Belt Journey
        </h2>
        <div className="flex items-center gap-2 flex-wrap">
          {BELT_ORDER.map((belt, i) => (
            <div key={belt} className="flex items-center gap-2">
              <div
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
                  i < beltIndex
                    ? "bg-primary/20 text-primary"
                    : i === beltIndex
                      ? "bg-primary text-primary-foreground ring-2 ring-primary/30"
                      : "bg-white/5 text-muted-foreground"
                )}
              >
                {BELT_LABELS[belt]}
              </div>
              {i < BELT_ORDER.length - 1 && (
                <div className={cn("h-0.5 w-4 rounded", i < beltIndex ? "bg-primary/40" : "bg-white/10")} />
              )}
            </div>
          ))}
        </div>
        <p className="text-sm text-muted-foreground mt-4">
          Current belt: <span className="text-foreground font-semibold">{BELT_LABELS[currentBelt]}</span>
          {" · "}BGC Score: <span className="text-foreground font-semibold">{totalScore}/100</span>
        </p>
      </section>

      {/* Mastery Breakdown */}
      {latest ? (
        <section className="bg-card border border-border/40 rounded-2xl p-6 space-y-4">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Latest Mastery Breakdown
          </h2>
          {[
            { key: "ca_score", label: "Clarity Assessment", max: 40 },
            { key: "be_score", label: "Behavioural Evidence", max: 25 },
            { key: "lp_score", label: "Learning Progress", max: 15 },
            { key: "ai_score", label: "AI Session Quality", max: 10 },
            { key: "ps_score", label: "Peer Validation", max: 10 },
          ].map(({ key, label, max }) => {
            const val = (latest as unknown as Record<string, number>)[key] ?? 0;
            return (
              <div key={key}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="text-foreground font-medium">{val.toFixed(1)}/{max}</span>
                </div>
                <ProgressBar value={val} max={max} />
              </div>
            );
          })}
        </section>
      ) : (
        <section className="bg-card border border-border/40 rounded-2xl p-6 text-center">
          <p className="text-muted-foreground text-sm mb-4">
            No mastery data yet. Complete your Clarity Assessment to see your breakdown.
          </p>
          <Link
            href="/assessment"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Start Assessment
          </Link>
        </section>
      )}

      {/* Assessment History */}
      <section className="bg-card border border-border/40 rounded-2xl p-6">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
          Assessment History
        </h2>
        {assessments.length === 0 ? (
          <p className="text-sm text-muted-foreground">No assessments completed yet.</p>
        ) : (
          <div className="space-y-3">
            {assessments.map((a) => {
              const belt = getBeltForScore(a.overall_pct ?? 0);
              return (
                <div key={a.id} className="flex items-center justify-between py-2 border-b border-border/20 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-foreground">Round {a.assessment_round}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(a.completed_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-foreground">{Math.round(a.overall_pct ?? 0)}%</p>
                    <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded belt-badge", `belt-badge-${belt.id}`)}>
                      {belt.name.toUpperCase()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Recent Coaching Sessions */}
      <section className="bg-card border border-border/40 rounded-2xl p-6">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
          Recent Coaching Sessions
        </h2>
        {sessions.length === 0 ? (
          <div>
            <p className="text-sm text-muted-foreground mb-3">No coaching sessions yet.</p>
            <Link
              href="/coaching"
              className="text-sm text-primary hover:underline font-medium"
            >
              Start your first session →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map((s) => (
              <div key={s.id} className="flex items-center justify-between py-2 border-b border-border/20 last:border-0">
                <div>
                  <p className="text-sm font-medium text-foreground capitalize">
                    {s.session_type.replace("_", " ")}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {s.started_at ? new Date(s.started_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : "—"}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground">
                  {s.message_count} message{s.message_count !== 1 ? "s" : ""}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
