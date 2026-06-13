// ─────────────────────────────────────────────────────────────────────────────
// POST /api/assessment/submit
// Scores a completed Clarity Assessment, creates a mastery snapshot,
// and marks the learner's assessment_complete flag.
// ─────────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getBeltForScore } from "@/constants/bgc-frameworks";
import { recomputeMasteryScore } from "@/lib/mastery";
import type { AssessmentAnswer, BeltTier, DimensionId } from "@/types/platform";

// Max raw scores per dimension (from assessment-questions: 6×4=24, 5×4=20 each)
const DIM_MAXES: Record<DimensionId, number> = {
  strategic_direction: 24,
  people_clarity: 20,
  systems_processes: 20,
  structural_clarity: 20,
  leadership_mastery: 20,
};

const MAX_TOTAL = 104; // sum of all dimension maxes

// Question id prefix → dimension
const PREFIX_TO_DIM: Record<string, DimensionId> = {
  sd: "strategic_direction",
  pc: "people_clarity",
  sp: "systems_processes",
  sc: "structural_clarity",
  lm: "leadership_mastery",
};

export async function POST(req: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { answers } = (await req.json()) as { answers: AssessmentAnswer[] };

  if (!Array.isArray(answers) || answers.length === 0) {
    return NextResponse.json({ error: "answers array required" }, { status: 400 });
  }

  // ── Aggregate scores per dimension ─────────────────────────────────────────
  const dimScores: Record<DimensionId, number> = {
    strategic_direction: 0,
    people_clarity: 0,
    systems_processes: 0,
    structural_clarity: 0,
    leadership_mastery: 0,
  };

  for (const answer of answers) {
    const prefix = answer.question_id.split("_")[0];
    const dim = PREFIX_TO_DIM[prefix];
    if (dim) dimScores[dim] += answer.score;
  }

  // ── Compute percentages ─────────────────────────────────────────────────────
  const dimPcts = {} as Record<DimensionId, number>;
  for (const dim of Object.keys(dimScores) as DimensionId[]) {
    dimPcts[dim] = Math.round((dimScores[dim] / DIM_MAXES[dim]) * 100);
  }

  const rawTotal = Object.values(dimScores).reduce((a, b) => a + b, 0);
  const overallPct = Math.round((rawTotal / MAX_TOTAL) * 100);
  const belt = getBeltForScore(overallPct);

  // ── Primary gap and strength ────────────────────────────────────────────────
  const entries = Object.entries(dimPcts) as [DimensionId, number][];
  const primaryGap = entries.reduce((min, cur) => (cur[1] < min[1] ? cur : min))[0];
  const primaryStrength = entries.reduce((max, cur) =>
    cur[1] > max[1] ? cur : max
  )[0];

  // ── Get learner ─────────────────────────────────────────────────────────────
  const { data: learner, error: learnerErr } = await supabase
    .from("learners")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (learnerErr || !learner) {
    return NextResponse.json({ error: "Learner not found" }, { status: 404 });
  }

  // ── Assessment round number ─────────────────────────────────────────────────
  const { count: prevCount } = await supabase
    .from("clarity_assessments")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);

  const assessmentRound = (prevCount ?? 0) + 1;
  const completedAt = new Date().toISOString();

  // ── Insert clarity_assessments record ──────────────────────────────────────
  const { data: assessment, error: insertErr } = await supabase
    .from("clarity_assessments")
    .insert({
      user_id: user.id,
      learner_id: learner.id,
      strategic_direction_score: dimScores.strategic_direction,
      people_clarity_score: dimScores.people_clarity,
      systems_processes_score: dimScores.systems_processes,
      structural_clarity_score: dimScores.structural_clarity,
      leadership_mastery_score: dimScores.leadership_mastery,
      strategic_direction_pct: dimPcts.strategic_direction,
      people_clarity_pct: dimPcts.people_clarity,
      systems_processes_pct: dimPcts.systems_processes,
      structural_clarity_pct: dimPcts.structural_clarity,
      leadership_mastery_pct: dimPcts.leadership_mastery,
      overall_pct: overallPct,
      belt_tier: belt.id as BeltTier,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      raw_answers: answers as any,
      assessment_round: assessmentRound,
      completed_at: completedAt,
    })
    .select("id")
    .single();

  if (insertErr) {
    return NextResponse.json({ error: insertErr.message }, { status: 500 });
  }

  // ── Mark assessment complete ────────────────────────────────────────────────
  await supabase
    .from("learners")
    .update({ assessment_complete: true })
    .eq("user_id", user.id);

  // ── Recompute the Mastery Score from all signals (single source of truth).
  // Belt tier is derived from the full 0–100 total inside recompute — never
  // from the 30-point CA component alone.
  const mastery = await recomputeMasteryScore(user.id);

  return NextResponse.json({
    success: true,
    assessment_id: assessment!.id,
    clarity_profile: {
      strategic_direction_pct: dimPcts.strategic_direction,
      people_clarity_pct: dimPcts.people_clarity,
      systems_processes_pct: dimPcts.systems_processes,
      structural_clarity_pct: dimPcts.structural_clarity,
      leadership_mastery_pct: dimPcts.leadership_mastery,
      overall_pct: overallPct,
      belt_tier: belt.id as BeltTier,
      primary_gap: primaryGap,
      primary_strength: primaryStrength,
      assessment_round: assessmentRound,
      completed_at: completedAt,
    },
    mastery_score: mastery,
  });
}
