// ─────────────────────────────────────────────────────────────────────────────
// POST /api/evidence — log a piece of behavioural evidence.
// The learner records how they applied a BGC framework to a real situation.
// The coach scores the rigour of the application (0–100) and returns sharp
// feedback. Behavioural Evidence is 25% of the Mastery Score, so logging it
// triggers a recompute.
// ─────────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateCoach } from "@/lib/bgc-coach/provider";
import { recomputeMasteryScore } from "@/lib/mastery";
import type { DimensionId } from "@/types/platform";

interface EvidenceBody {
  dimension_id?: DimensionId;
  framework_applied?: string;
  situation_described?: string;
  action_taken?: string;
  outcome?: string;
}

function weekNumber(createdAt?: string | null): number {
  if (!createdAt) return 1;
  const diffMs = Date.now() - new Date(createdAt).getTime();
  return Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24 * 7)));
}

async function scoreEvidence(body: Required<Omit<EvidenceBody, never>>): Promise<{
  score: number;
  feedback: string;
}> {
  const system = `You are the BGC Coach scoring a learner's behavioural evidence — a record of applying a BGC leadership framework to a real situation.

Score the RIGOUR and AUTHENTICITY of the application from 0 to 100:
- 80–100: Specific situation, deliberate framework application, named action, concrete outcome. Real evidence of mastery in motion.
- 50–79: Genuine application but vague in places — soft outcome, generic action, or loose framework fit.
- 20–49: Thin. Reads as activity, not deliberate framework use. Little evidence of reflection.
- 0–19: Empty, evasive, or no real application.

Be demanding. Most first attempts are 40–65. Do not inflate.

Respond with ONLY a JSON object, no prose around it:
{"score": <integer 0-100>, "feedback": "<one or two sharp coaching sentences naming what was strong and what was missing>"}`;

  const userMsg = `Framework applied: ${body.framework_applied}
Dimension: ${body.dimension_id}

Situation:
${body.situation_described}

Action taken:
${body.action_taken}

Outcome:
${body.outcome || "(not stated)"}`;

  try {
    const raw = await generateCoach(system, [{ role: "user", content: userMsg }], 300);
    const match = raw.match(/\{[\s\S]*\}/);
    if (match) {
      const parsed = JSON.parse(match[0]) as { score?: number; feedback?: string };
      const score = Math.max(0, Math.min(100, Math.round(parsed.score ?? 50)));
      return { score, feedback: parsed.feedback ?? "Evidence logged." };
    }
  } catch (err) {
    console.error("[evidence] scoring failed:", err);
  }
  // Fallback if the model is unavailable — log it without blocking the learner.
  return { score: 50, feedback: "Evidence logged. Coach scoring was unavailable; this entry was given a baseline score." };
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await req.json()) as EvidenceBody;
  const dimension_id = body.dimension_id;
  const framework_applied = body.framework_applied?.trim();
  const situation_described = body.situation_described?.trim();
  const action_taken = body.action_taken?.trim();
  const outcome = body.outcome?.trim() ?? "";

  if (!dimension_id || !framework_applied || !situation_described || !action_taken) {
    return NextResponse.json(
      { error: "dimension, framework, situation and action are required" },
      { status: 400 }
    );
  }

  const { data: learner, error: learnerErr } = await supabase
    .from("learners")
    .select("id, created_at")
    .eq("user_id", user.id)
    .single();

  if (learnerErr || !learner) {
    return NextResponse.json({ error: "Learner not found" }, { status: 404 });
  }

  const { score, feedback } = await scoreEvidence({
    dimension_id,
    framework_applied,
    situation_described,
    action_taken,
    outcome,
  });

  const { data: evidence, error: insertErr } = await supabase
    .from("behavioural_evidence")
    .insert({
      user_id: user.id,
      learner_id: learner.id,
      dimension_id,
      framework_applied,
      situation_described,
      action_taken,
      outcome: outcome || null,
      week_number: weekNumber(learner.created_at),
      ai_quality_score: score,
      ai_feedback: feedback,
    })
    .select("id, ai_quality_score, ai_feedback, created_at")
    .single();

  if (insertErr) {
    return NextResponse.json({ error: insertErr.message }, { status: 500 });
  }

  // Behavioural Evidence is 25% of the Mastery Score — recompute now.
  const mastery = await recomputeMasteryScore(user.id);

  return NextResponse.json({ success: true, evidence, mastery });
}
