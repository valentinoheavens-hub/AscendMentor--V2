// POST /api/flutterwave/webhook
// Set this URL in Flutterwave dashboard → Settings → Webhooks
// Also set Secret Hash to match FLUTTERWAVE_WEBHOOK_HASH env var.

import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyWebhookSignature } from "@/lib/flutterwave/client";
import type { SubscriptionTier } from "@/types/platform";

export async function POST(req: NextRequest) {
  const signature = req.headers.get("verif-hash") ?? "";
  const webhookHash = process.env.FLUTTERWAVE_WEBHOOK_HASH ?? "";

  if (!verifyWebhookSignature(signature, webhookHash)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const event = await req.json() as { event: string; data: Record<string, unknown> };
  const supabase = createAdminClient();

  if (event.event === "charge.completed" && event.data.status === "successful") {
    const meta = event.data.meta as Record<string, unknown> | undefined;
    const userId = meta?.user_id as string | undefined;
    const planId = meta?.plan_id as SubscriptionTier | undefined;

    if (userId && planId) {
      await supabase
        .from("learners")
        .update({ subscription_tier: planId, subscription_status: "active" })
        .eq("user_id", userId);
    }
  }

  return NextResponse.json({ received: true });
}
