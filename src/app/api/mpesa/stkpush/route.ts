// POST /api/mpesa/stkpush
// Body: { plan_id, interval, phone }
// Initiates STK Push. User gets a prompt on their phone.
// Returns: { CheckoutRequestID, message }

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { stkPush, normalizePhone } from "@/lib/mpesa/client";
import { SUBSCRIPTION_PLANS } from "@/constants/subscription-plans";
import type { SubscriptionTier } from "@/types/platform";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { plan_id, interval = "monthly", phone } = (await req.json()) as {
    plan_id: SubscriptionTier;
    interval: "monthly" | "annual";
    phone: string;
  };

  if (!phone) {
    return NextResponse.json({ error: "Phone number required" }, { status: 400 });
  }

  const plan = SUBSCRIPTION_PLANS.find((p) => p.id === plan_id);
  if (!plan || plan.id === "free") {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  const amount =
    interval === "annual" ? plan.amount_annual_kes : plan.amount_monthly_kes;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const normalizedPhone = normalizePhone(phone);

  const result = await stkPush({
    phone: normalizedPhone,
    amount,
    accountRef: `AM-${plan.id.toUpperCase()}`,
    description: `AscendMentor ${plan.name} ${interval}`,
    callbackUrl: `${appUrl}/api/mpesa/callback?user_id=${user.id}&plan_id=${plan.id}`,
  });

  return NextResponse.json({
    CheckoutRequestID: result.CheckoutRequestID,
    message: result.CustomerMessage,
  });
}
