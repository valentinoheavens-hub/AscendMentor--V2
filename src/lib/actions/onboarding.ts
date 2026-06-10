"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { Step1Input, Step2Input, Step3Input, Step4Input, Step5Input } from "@/lib/validations/onboarding";
import {
  step1Schema,
  step2Schema,
  step3Schema,
  step4Schema,
  step5Schema,
} from "@/lib/validations/onboarding";

// ─────────────────────────────────────────────────────────────────────────────
// Helper — ensure learner record exists for current user
// ─────────────────────────────────────────────────────────────────────────────
async function getOrCreateLearner(supabase: Awaited<ReturnType<typeof createClient>>) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const { data: learner } = await supabase
    .from("learners")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (learner) return { user, learnerId: learner.id };

  // Create learner record if it doesn't exist (e.g. manual sign-in without callback)
  const { data: newLearner, error } = await supabase
    .from("learners")
    .insert({
      user_id: user.id,
      email: user.email!,
      first_name: user.user_metadata?.full_name?.split(" ")[0] ?? "",
    })
    .select("id")
    .single();

  if (error) throw new Error(`Failed to create learner: ${error.message}`);
  return { user, learnerId: newLearner.id };
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 1 — Profile details
// ─────────────────────────────────────────────────────────────────────────────
export async function saveOnboardingStep1(
  data: Step1Input
): Promise<{ error?: string }> {
  const parsed = step1Schema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  try {
    const supabase = await createClient();
    const { user } = await getOrCreateLearner(supabase);

    const { error } = await supabase
      .from("learners")
      .update({
        full_name: parsed.data.full_name,
        first_name: parsed.data.full_name.split(" ")[0],
        last_name: parsed.data.full_name.split(" ").slice(1).join(" ") || null,
        role_title: parsed.data.role_title,
        organisation_name: parsed.data.organisation_name,
        organisation_size: parsed.data.organisation_size,
      })
      .eq("user_id", user.id);

    if (error) return { error: error.message };
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Unknown error" };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 2 — Organisation details
// ─────────────────────────────────────────────────────────────────────────────
export async function saveOnboardingStep2(
  data: Step2Input
): Promise<{ error?: string }> {
  const parsed = step2Schema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  try {
    const supabase = await createClient();
    const { user } = await getOrCreateLearner(supabase);

    const { error } = await supabase
      .from("learners")
      .update({
        years_running: parsed.data.years_running,
        country: parsed.data.country,
        phone_number: parsed.data.phone_number,
      })
      .eq("user_id", user.id);

    if (error) return { error: error.message };
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Unknown error" };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 3 — Initial challenge
// ─────────────────────────────────────────────────────────────────────────────
export async function saveOnboardingStep3(
  data: Step3Input
): Promise<{ error?: string }> {
  const parsed = step3Schema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  try {
    const supabase = await createClient();
    const { user } = await getOrCreateLearner(supabase);

    const { error } = await supabase
      .from("learners")
      .update({ initial_challenge: parsed.data.initial_challenge })
      .eq("user_id", user.id);

    if (error) return { error: error.message };
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Unknown error" };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 4 — Coaching history
// ─────────────────────────────────────────────────────────────────────────────
export async function saveOnboardingStep4(
  data: Step4Input
): Promise<{ error?: string }> {
  const parsed = step4Schema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  try {
    const supabase = await createClient();
    const { user } = await getOrCreateLearner(supabase);

    const { error } = await supabase
      .from("learners")
      .update({
        past_coaching: parsed.data.past_coaching,
        past_coaching_outcome: parsed.data.past_coaching_outcome ?? null,
      })
      .eq("user_id", user.id);

    if (error) return { error: error.message };
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Unknown error" };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 5 — Success criteria + mark onboarding complete
// ─────────────────────────────────────────────────────────────────────────────
export async function completeOnboarding(
  data: Step5Input
): Promise<{ error?: string }> {
  const parsed = step5Schema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  try {
    const supabase = await createClient();
    const { user } = await getOrCreateLearner(supabase);

    const { error } = await supabase
      .from("learners")
      .update({
        success_criteria: parsed.data.success_criteria,
        onboarding_complete: true,
        subscription_tier: "beta_90",
        subscription_status: "trial",
      })
      .eq("user_id", user.id);

    if (error) return { error: error.message };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Unknown error" };
  }

  // Redirect to assessment after successful onboarding
  redirect("/assessment");
}

// ─────────────────────────────────────────────────────────────────────────────
// Get current learner data for onboarding pre-fill
// ─────────────────────────────────────────────────────────────────────────────
export async function getLearnerForOnboarding() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data } = await supabase
    .from("learners")
    .select(
      "full_name, role_title, organisation_name, organisation_size, years_running, country, phone_number, initial_challenge, past_coaching, past_coaching_outcome, success_criteria, onboarding_complete"
    )
    .eq("user_id", user.id)
    .maybeSingle();

  return data;
}
