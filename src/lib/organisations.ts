// ─────────────────────────────────────────────────────────────────────────────
// Organisations — invite-code redemption. Server only.
// An institution invite vouches for the member: redeeming a valid code attaches
// the learner to the organisation and activates them immediately (no manual
// review), as long as the org is active and has seats left.
// ─────────────────────────────────────────────────────────────────────────────

import { createAdminClient } from "@/lib/supabase/admin";

export interface RedeemResult {
  ok: boolean;
  orgName?: string;
  error?: "invalid_code" | "org_suspended" | "no_seats" | "no_learner" | "db_error";
}

export async function getOrganisationByInviteCode(code: string) {
  const admin = createAdminClient();
  const { data } = await admin
    .from("organisations")
    .select("id, name, seat_count, status")
    .eq("invite_code", code)
    .maybeSingle();
  return data;
}

export async function countOrgMembers(orgId: string): Promise<number> {
  const admin = createAdminClient();
  const { count } = await admin
    .from("learners")
    .select("id", { count: "exact", head: true })
    .eq("organisation_id", orgId);
  return count ?? 0;
}

/** Attach the learner (by auth user id) to the org behind `code` and activate them. */
export async function redeemInviteCode(userId: string, code: string): Promise<RedeemResult> {
  const admin = createAdminClient();

  const org = await getOrganisationByInviteCode(code);
  if (!org) return { ok: false, error: "invalid_code" };
  if (org.status !== "active") return { ok: false, error: "org_suspended", orgName: org.name };

  const members = await countOrgMembers(org.id);
  if (members >= org.seat_count) return { ok: false, error: "no_seats", orgName: org.name };

  const { data: learner } = await admin
    .from("learners")
    .select("id, organisation_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (!learner) return { ok: false, error: "no_learner", orgName: org.name };

  // Already a member — idempotent success
  if (learner.organisation_id === org.id) return { ok: true, orgName: org.name };

  const { error } = await admin
    .from("learners")
    .update({ organisation_id: org.id, status: "active" })
    .eq("id", learner.id);

  if (error) {
    console.error("[organisations] redeem failed:", error.message);
    return { ok: false, error: "db_error", orgName: org.name };
  }

  return { ok: true, orgName: org.name };
}
