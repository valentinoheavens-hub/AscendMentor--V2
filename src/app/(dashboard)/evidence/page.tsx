// ─────────────────────────────────────────────────────────────────────────────
// Behavioural Evidence — log framework application, see coach scores, watch the
// Behavioural Evidence component (25% of the Mastery Score) build over time.
// ─────────────────────────────────────────────────────────────────────────────

import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { EvidenceClient } from "@/components/evidence/evidence-client";

export const metadata: Metadata = {
  title: "Behavioural Evidence — ClarityOS",
};

const DIMENSION_LABELS: Record<string, string> = {
  strategic_direction: "Strategic Direction",
  people_clarity: "People Clarity",
  systems_processes: "Systems & Processes",
  structural_clarity: "Structural Clarity",
  leadership_mastery: "Leadership Mastery",
};

export default async function EvidencePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: evidence }, { data: mastery }] = await Promise.all([
    supabase
      .from("behavioural_evidence")
      .select("id, dimension_id, framework_applied, situation_described, action_taken, outcome, ai_quality_score, ai_feedback, week_number, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("mastery_scores")
      .select("be_score, current_streak_weeks")
      .eq("user_id", user.id)
      .order("snapshot_date", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const list = evidence ?? [];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Behavioural Evidence</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Insight without evidence is just opinion. Log how you apply the frameworks —
          this is 25% of your BGC Mastery Score™.
        </p>
      </div>

      {/* Component progress */}
      <div className="bg-card border border-border/40 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Behavioural Evidence score
          </p>
          <span className="text-lg font-bold text-foreground">
            {mastery?.be_score ?? 0}<span className="text-muted-foreground text-sm font-normal">/25</span>
          </span>
        </div>
        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all"
            style={{ width: `${Math.min(((mastery?.be_score ?? 0) / 25) * 100, 100)}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          {list.length} {list.length === 1 ? "entry" : "entries"} logged
          {mastery?.current_streak_weeks ? ` · ${mastery.current_streak_weeks}-week streak` : ""}
        </p>
      </div>

      {/* Capture form */}
      <EvidenceClient />

      {/* History */}
      {list.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Your evidence log
          </h2>
          {list.map((e) => (
            <div key={e.id} className="bg-card border border-border/40 rounded-2xl p-5">
              <div className="flex items-start justify-between gap-4 mb-2">
                <div>
                  <span className="text-xs font-semibold text-yellow-400">
                    {e.framework_applied}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {" · "}{DIMENSION_LABELS[e.dimension_id] ?? e.dimension_id}
                  </span>
                </div>
                {e.ai_quality_score != null && (
                  <span className="text-sm font-bold text-foreground whitespace-nowrap">
                    {e.ai_quality_score}<span className="text-muted-foreground text-xs font-normal">/100</span>
                  </span>
                )}
              </div>
              <p className="text-sm text-foreground leading-relaxed">{e.situation_described}</p>
              <p className="text-sm text-muted-foreground leading-relaxed mt-1">{e.action_taken}</p>
              {e.outcome && (
                <p className="text-sm text-muted-foreground/80 leading-relaxed mt-1 italic">→ {e.outcome}</p>
              )}
              {e.ai_feedback && (
                <p className="mt-3 text-xs text-muted-foreground leading-relaxed border-l-2 border-primary/40 pl-3">
                  {e.ai_feedback}
                </p>
              )}
              <p className="mt-2 text-[11px] text-muted-foreground/60">
                Week {e.week_number} ·{" "}
                {e.created_at ? new Date(e.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : ""}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
