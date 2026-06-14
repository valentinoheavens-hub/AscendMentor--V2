// ─────────────────────────────────────────────────────────────────────────────
// POST /api/paystack/initialize
// Body: { plan_id: 'individual' | 'professional', interval: 'monthly' | 'annual' }
// Returns: { authorization_url, reference }
// ─────────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { initializeTransaction } from "@/lib/paystack/client";
import { SUBSCRIPTION_PLANS, planPrice } from "@/constants/subscription-plans";
import type { SubscriptionTier } from "@/types/platform";

function generateRef(): string {
  return `AM-${Date.now()}-${Math.random().toString(36).slice(2, 9).toUpperCase()}`;
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { plan_id, interval = "monthly" } = (await req.json()) as {
    plan_id: SubscriptionTier;
    interval: "monthly" | "annual";
  };

  const plan = SUBSCRIPTION_PLANS.find((p) => p.id === plan_id);
  if (!plan || plan.id === "free") {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  // Paystack charges in Naira (kobo) — ClarityOS's primary market.
  const { amount } = planPrice(plan, "NGN", interval);
  const reference = generateRef();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const result = await initializeTransaction({
    email: user.email!,
    amount,
    reference,
    currency: "NGN",
    callback_url: `${appUrl}/api/paystack/verify?reference=${reference}`,
    metadata: {
      user_id: user.id,
      plan_id: plan.id,
      interval,
      plan_name: plan.name,
    },
  });

  return NextResponse.json({
    authorization_url: result.authorization_url,
    reference: result.reference,
  });
}
