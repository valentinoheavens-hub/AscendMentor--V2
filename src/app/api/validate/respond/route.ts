// ─────────────────────────────────────────────────────────────────────────────
// POST /api/validate/respond — a validator submits their 360 assessment.
// Public (no auth — the validator isn't a platform user). Keyed by the
// validator invite id. Records the validation in peer_validations, marks the
// invite completed, and recomputes the learner's Mastery Score (PS is 10%).
// ─────────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { recomputeMasteryScore } from "@/lib/mastery";
import type { DimensionId } from "@/types/platform";

interface RespondBody {
  validator_id?: string;
  dimension_scores?: Partial<Record<DimensionId, number>>;
  observation?: string;
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as RespondBody;
  const validatorId = body.validator_id;
  const scores = body.dimension_scores ?? {};
  const observation = body.observation?.trim() ?? "";

  if (!validatorId) {
    return NextResponse.json({ error: "validator_id required" }, { status: 400 });
  }

  const admin = createAdminClient();

  // Look up the invite. validators.learner_id stores the learner's auth user id.
  const { data: validator } = await admin
    .from("validators")
    .select("id, email, relationship, status, learner_id")
    .eq("id", validatorId)
    .maybeSingle();

  if (!validator) {
    return NextResponse.json({ error: "Validation link not recognised" }, { status: 404 });
  }
  if (validator.status === "completed") {
    return NextResponse.json({ error: "This validation has already been submitted" }, { status: 409 });
  }
  if (!validator.learner_id) {
    return NextResponse.json({ error: "Validation link is not linked to a learner" }, { status: 400 });
  }

  // Resolve the learner's profile row (peer_validations FK references learners.id).
  const { data: learner } = await admin
    .from("learners")
    .select("id")
    .eq("user_id", validator.learner_id)
    .maybeSingle();

  if (!learner) {
    return NextResponse.json({ error: "Learner not found" }, { status: 404 });
  }

  // Record the validation.
  const { error: insertErr } = await admin.from("peer_validations").insert({
    learner_id: learner.id,
    validator_name: validator.email,
    validator_relationship: validator.relationship,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    dimension_scores: scores as any,
    overall_observation: observation || null,
    completed_at: new Date().toISOString(),
  });

  if (insertErr) {
    return NextResponse.json({ error: insertErr.message }, { status: 500 });
  }

  // Mark the invite completed (drives the learner's validator list UI).
  await admin.from("validators").update({ status: "completed" }).eq("id", validatorId);

  // Peer Validation is 10% of the Mastery Score — recompute for the learner.
  await recomputeMasteryScore(validator.learner_id);

  return NextResponse.json({ success: true });
}
