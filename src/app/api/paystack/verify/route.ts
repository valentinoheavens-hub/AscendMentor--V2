// ─────────────────────────────────────────────────────────────────────────────
// GET /api/paystack/verify?reference=AM-xxx
// Called by Paystack as callback_url after payment.
// Verifies the transaction, upgrades the learner, redirects to dashboard.
// ─────────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyTransaction } from "@/lib/paystack/client";
import type { SubscriptionTier } from "@/types/platform";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const reference = searchParams.get("reference");
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  if (!reference) {
    return NextResponse.redirect(`${appUrl}/upgrade?error=missing_reference`);
  }

  let transaction;
  try {
    transaction = await verifyTransaction(reference);
  } catch {
    return NextResponse.redirect(`${appUrl}/upgrade?error=verify_failed`);
  }

  if (transaction.status !== "success") {
    return NextResponse.redirect(
      `${appUrl}/upgrade?error=payment_${transaction.status}`
    );
  }

  const userId = transaction.metadata?.user_id as string | undefined;
  const planId = transaction.metadata?.plan_id as SubscriptionTier | undefined;

  if (!userId || !planId) {
    return NextResponse.redirect(`${appUrl}/upgrade?error=metadata_missing`);
  }

  // Use admin client so we can update regardless of RLS
  const supabase = createAdminClient();

  await supabase
    .from("learners")
    .update({
      subscription_tier: planId,
      subscription_status: "active",
    })
    .eq("user_id", userId);

  return NextResponse.redirect(
    `${appUrl}/dashboard?payment=success&plan=${planId}`
  );
}
