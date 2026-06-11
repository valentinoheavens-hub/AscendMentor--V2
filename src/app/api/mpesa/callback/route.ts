// POST /api/mpesa/callback?user_id=xxx&plan_id=xxx
// Safaricom calls this after STK Push completes (success or failure).
// Must be publicly reachable — use ngrok in dev, real domain in prod.

import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { SubscriptionTier } from "@/types/platform";

interface MPesaCallbackBody {
  Body: {
    stkCallback: {
      ResultCode: number; // 0 = success
      ResultDesc: string;
      CheckoutRequestID: string;
      CallbackMetadata?: {
        Item: Array<{ Name: string; Value?: string | number }>;
      };
    };
  };
}

export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("user_id");
  const planId = searchParams.get("plan_id") as SubscriptionTier | null;

  let body: MPesaCallbackBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ResultCode: 0, ResultDesc: "Success" });
  }

  const callback = body.Body?.stkCallback;
  if (!callback) {
    return NextResponse.json({ ResultCode: 0, ResultDesc: "Success" });
  }

  // ResultCode 0 = payment successful
  if (callback.ResultCode === 0 && userId && planId) {
    const supabase = createAdminClient();
    await supabase
      .from("learners")
      .update({ subscription_tier: planId, subscription_status: "active" })
      .eq("user_id", userId);
  }

  // Always return 200 — Safaricom expects this
  return NextResponse.json({ ResultCode: 0, ResultDesc: "Success" });
}
