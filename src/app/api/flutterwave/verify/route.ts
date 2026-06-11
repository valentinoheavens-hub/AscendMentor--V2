// GET /api/flutterwave/verify?status=successful&tx_ref=AM-FLW-xxx&transaction_id=xxx
// Flutterwave redirect callback after payment.

import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyTransaction } from "@/lib/flutterwave/client";
import type { SubscriptionTier } from "@/types/platform";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const transactionId = searchParams.get("transaction_id");
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  if (status !== "successful" || !transactionId) {
    return NextResponse.redirect(`${appUrl}/upgrade?error=payment_${status ?? "failed"}`);
  }

  let txn;
  try {
    txn = await verifyTransaction(transactionId);
  } catch {
    return NextResponse.redirect(`${appUrl}/upgrade?error=verify_failed`);
  }

  if (txn.status !== "successful") {
    return NextResponse.redirect(`${appUrl}/upgrade?error=payment_${txn.status}`);
  }

  const userId = txn.meta?.user_id as string | undefined;
  const planId = txn.meta?.plan_id as SubscriptionTier | undefined;

  if (!userId || !planId) {
    return NextResponse.redirect(`${appUrl}/upgrade?error=metadata_missing`);
  }

  const supabase = createAdminClient();
  await supabase
    .from("learners")
    .update({ subscription_tier: planId, subscription_status: "active" })
    .eq("user_id", userId);

  return NextResponse.redirect(
    `${appUrl}/dashboard?payment=success&plan=${planId}`
  );
}
