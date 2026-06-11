// ─────────────────────────────────────────────────────────────────────────────
// POST /api/paystack/webhook
// Receives signed Paystack events. Configure this URL in your Paystack dashboard:
//   https://dashboard.paystack.com/#/settings/developer → Webhooks
// ─────────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyWebhookSignature } from "@/lib/paystack/client";
import type { SubscriptionTier } from "@/types/platform";

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-paystack-signature") ?? "";

  const valid = await verifyWebhookSignature(rawBody, signature);
  if (!valid) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let event: { event: string; data: Record<string, unknown> };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const supabase = createAdminClient();

  switch (event.event) {
    case "charge.success": {
      const meta = event.data.metadata as Record<string, unknown> | undefined;
      const userId = meta?.user_id as string | undefined;
      const planId = meta?.plan_id as SubscriptionTier | undefined;

      if (userId && planId) {
        await supabase
          .from("learners")
          .update({ subscription_tier: planId, subscription_status: "active" })
          .eq("user_id", userId);
      }
      break;
    }

    case "subscription.disable": {
      // Customer cancelled — downgrade to free at end of period
      const customer = event.data.customer as { email?: string } | undefined;
      if (customer?.email) {
        await supabase
          .from("learners")
          .update({ subscription_status: "cancelled" })
          .eq("email", customer.email);
      }
      break;
    }

    case "invoice.payment_failed": {
      const customer = event.data.customer as { email?: string } | undefined;
      if (customer?.email) {
        await supabase
          .from("learners")
          .update({ subscription_status: "inactive" })
          .eq("email", customer.email);
      }
      break;
    }

    default:
      // Unknown event — ignore
      break;
  }

  return NextResponse.json({ received: true });
}
