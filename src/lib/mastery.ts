// ─────────────────────────────────────────────────────────────────────────────
// Mastery Score — the single source of truth. SERVER ONLY.
//
// The BGC Mastery Score™ is a live 0–100 number built from five weighted
// signals. It is recomputed from real data whenever evidence lands — never a
// static snapshot. Belt tier is always derived from the full 0–100 total.
//
//   CA  Clarity Assessment   30%  — latest assessment overall %
//   BE  Behavioural Evidence  25%  — weekly framework-application logs
//   LP  Learning Path         20%  — module completion depth
//   AI  AI Session Quality    15%  — substantive coaching engagement
//   PS  Peer Validation       10%  — completed 360-style validators
// ─────────────────────────────────────────────────────────────────────────────

import { createAdminClient } from "@/lib/supabase/admin";
import { getBeltForScore } from "@/constants/bgc-frameworks";
import type { BeltTier, MasteryScoreBreakdown } from "@/types/platform";

const MAX = {
  ca: 30,
  be: 25,
  lp: 20,
  ai: 15,
  ps: 10,
} as const;

function clamp(value: number, max: number): number {
  return Math.max(0, Math.min(max, Math.round(value)));
}

/** Longest run of consecutive weeks (ending at the latest) with logged evidence. */
function consecutiveWeeks(weekNumbers: number[]): number {
  if (weekNumbers.length === 0) return 0;
  const weeks = Array.from(new Set(weekNumbers)).sort((a, b) => b - a);
  let streak = 1;
  for (let i = 1; i < weeks.length; i++) {
    if (weeks[i] === weeks[i - 1] - 1) streak++;
    else break;
  }
  return streak;
}

/**
 * Recompute the learner's Mastery Score from current data and write a fresh
 * snapshot. Returns the new breakdown, or null if the learner has no profile.
 */
export async function recomputeMasteryScore(
  userId: string
): Promise<MasteryScoreBreakdown | null> {
  const admin = createAdminClient();

  const { data: learner } = await admin
    .from("learners")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  if (!learner) return null;
  const learnerId = learner.id;

  const [
    { data: assessment },
    { data: evidence },
    { count: moduleCount },
    { data: sessions },
    { data: peerValidations },
    { data: prevSnapshot },
  ] = await Promise.all([
    admin
      .from("clarity_assessments")
      .select("overall_pct")
      .eq("user_id", userId)
      .order("completed_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    admin
      .from("behavioural_evidence")
      .select("ai_quality_score, week_number")
      .eq("user_id", userId),
    admin
      .from("module_completions")
      .select("id", { count: "exact", head: true })
      .eq("learner_id", learnerId),
    admin
      .from("coaching_sessions")
      .select("message_count, quality_score")
      .eq("learner_id", learnerId),
    admin
      .from("peer_validations")
      .select("completed_at")
      .eq("learner_id", learnerId),
    admin
      .from("mastery_scores")
      .select("total_score")
      .eq("user_id", userId)
      .order("snapshot_date", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  // ── CA — Clarity Assessment (30) ────────────────────────────────────────────
  const overallPct = assessment?.overall_pct ?? 0;
  const ca = clamp((overallPct / 100) * MAX.ca, MAX.ca);

  // ── BE — Behavioural Evidence (25) ──────────────────────────────────────────
  // Each logged piece of evidence is worth up to 5 points, scaled by the AI
  // quality score when present (un-scored entries get a base 3).
  const beRaw = (evidence ?? []).reduce((sum, e) => {
    const pts = e.ai_quality_score != null ? (e.ai_quality_score / 100) * 5 : 3;
    return sum + pts;
  }, 0);
  const be = clamp(beRaw, MAX.be);

  // ── LP — Learning Path (20) ─────────────────────────────────────────────────
  const lp = clamp((moduleCount ?? 0) * 4, MAX.lp);

  // ── AI — AI Session Quality (15) ────────────────────────────────────────────
  // Only substantive sessions (4+ messages) count; scaled by session quality.
  const aiRaw = (sessions ?? [])
    .filter((s) => (s.message_count ?? 0) >= 4)
    .reduce((sum, s) => {
      const pts = s.quality_score != null ? (s.quality_score / 100) * 3 : 2;
      return sum + pts;
    }, 0);
  const ai = clamp(aiRaw, MAX.ai);

  // ── PS — Peer Validation (10) ───────────────────────────────────────────────
  // Each completed 360-style validation is worth 2 points (5 → full 10).
  const completedPeerVals = (peerValidations ?? []).filter(
    (p) => p.completed_at != null
  ).length;
  const ps = clamp(completedPeerVals * 2, MAX.ps);

  // ── Total + belt (belt always derives from the full 0–100 total) ────────────
  const total = ca + be + lp + ai + ps;
  const belt = getBeltForScore(total);
  const prevTotal = prevSnapshot?.total_score ?? 0;
  const streak = consecutiveWeeks((evidence ?? []).map((e) => e.week_number));
  const snapshotDate = new Date().toISOString();

  await admin.from("mastery_scores").insert({
    user_id: userId,
    learner_id: learnerId,
    total_score: total,
    belt_tier: belt.id as BeltTier,
    ca_score: ca,
    be_score: be,
    lp_score: lp,
    ai_score: ai,
    ps_score: ps,
    current_streak_weeks: streak,
    score_velocity: total - prevTotal,
    snapshot_date: snapshotDate,
  });

  return {
    total_score: total,
    belt_tier: belt.id as BeltTier,
    ca_score: ca,
    be_score: be,
    lp_score: lp,
    ai_score: ai,
    ps_score: ps,
    current_streak_weeks: streak,
    score_velocity: total - prevTotal,
    snapshot_date: snapshotDate,
  };
}
