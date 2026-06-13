"use server";

// ─────────────────────────────────────────────────────────────────────────────
// Admin server actions — application review + organisation management.
// Every action re-verifies is_admin() server-side before touching data.
// ─────────────────────────────────────────────────────────────────────────────

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendApprovalEmail, sendDeclineEmail } from "@/lib/email";

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (!isAdmin) throw new Error("Not authorised");
  return user;
}

// ── Application review ────────────────────────────────────────────────────────

export async function approveLearner(learnerId: string): Promise<{ error?: string }> {
  try {
    await requireAdmin();
    const admin = createAdminClient();

    const { data: learner, error } = await admin
      .from("learners")
      .update({ status: "active" })
      .eq("id", learnerId)
      .select("email, first_name")
      .single();

    if (error) return { error: error.message };

    await sendApprovalEmail(learner.email, learner.first_name);
    revalidatePath("/admin/applications");
    revalidatePath("/admin");
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Unknown error" };
  }
}

export async function declineLearner(learnerId: string): Promise<{ error?: string }> {
  try {
    await requireAdmin();
    const admin = createAdminClient();

    const { data: learner, error } = await admin
      .from("learners")
      .update({ status: "declined" })
      .eq("id", learnerId)
      .select("email, first_name")
      .single();

    if (error) return { error: error.message };

    await sendDeclineEmail(learner.email, learner.first_name);
    revalidatePath("/admin/applications");
    revalidatePath("/admin");
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Unknown error" };
  }
}

// ── Organisations ─────────────────────────────────────────────────────────────

export async function createOrganisation(formData: FormData): Promise<{ error?: string }> {
  try {
    await requireAdmin();
    const admin = createAdminClient();

    const name = String(formData.get("name") ?? "").trim();
    const contactName = String(formData.get("contact_name") ?? "").trim();
    const contactEmail = String(formData.get("contact_email") ?? "").trim();
    const seats = parseInt(String(formData.get("seat_count") ?? "10"), 10);

    if (!name) return { error: "Organisation name is required" };
    if (!Number.isFinite(seats) || seats < 1) return { error: "Seat count must be at least 1" };

    const { error } = await admin.from("organisations").insert({
      name,
      contact_name: contactName || null,
      contact_email: contactEmail || null,
      seat_count: seats,
    });

    if (error) return { error: error.message };
    revalidatePath("/admin/organisations");
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Unknown error" };
  }
}

export async function updateOrganisationStatus(
  orgId: string,
  status: "active" | "suspended"
): Promise<{ error?: string }> {
  try {
    await requireAdmin();
    const admin = createAdminClient();

    const { error } = await admin.from("organisations").update({ status }).eq("id", orgId);
    if (error) return { error: error.message };

    revalidatePath("/admin/organisations");
    revalidatePath(`/admin/organisations/${orgId}`);
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Unknown error" };
  }
}

export async function updateOrganisationSeats(
  orgId: string,
  seatCount: number
): Promise<{ error?: string }> {
  try {
    await requireAdmin();
    if (!Number.isFinite(seatCount) || seatCount < 1) {
      return { error: "Seat count must be at least 1" };
    }
    const admin = createAdminClient();

    const { error } = await admin
      .from("organisations")
      .update({ seat_count: seatCount })
      .eq("id", orgId);
    if (error) return { error: error.message };

    revalidatePath(`/admin/organisations/${orgId}`);
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Unknown error" };
  }
}

// ── Enterprise inquiries ──────────────────────────────────────────────────────

export async function updateInquiryStatus(
  inquiryId: string,
  status: "new" | "contacted" | "closed"
): Promise<{ error?: string }> {
  try {
    await requireAdmin();
    const admin = createAdminClient();

    const { error } = await admin
      .from("enterprise_inquiries")
      .update({ status })
      .eq("id", inquiryId);
    if (error) return { error: error.message };

    revalidatePath("/admin/inquiries");
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Unknown error" };
  }
}
