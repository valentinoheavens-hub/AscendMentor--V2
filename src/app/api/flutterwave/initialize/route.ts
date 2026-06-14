// POST /api/flutterwave/initialize
// Body: { plan_id, interval }
// Returns: { payment_link }

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { initializePayment } from "@/lib/flutterwave/client";
import { SUBSCRIPTION_PLANS } from "@/constants/subscription-plans";
import type { SubscriptionTier } from "@/types/platform";

function generateRef(): string {
  return `AM-FLW-${Date.now()}-${Math.random().toString(36).slice(2, 9).toUpperCase()}`;
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

  const amount = interval === "annual" ? plan.amount_annual : plan.amount_monthly;
  const tx_ref = generateRef();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const { link } = await initializePayment({
    tx_ref,
    amount: amount / 100, // Flutterwave takes whole USD, not cents
    currency: plan.currency,
    redirect_url: `${appUrl}/api/flutterwave/verify`,
    customer: { email: user.email! },
    meta: { user_id: user.id, plan_id: plan.id, interval, tx_ref },
    customizations: { title: "ClarityOS — Upgrade" },
  });

  return NextResponse.json({ payment_link: link });
}
