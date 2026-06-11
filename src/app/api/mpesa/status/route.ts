// GET /api/mpesa/status?id=CheckoutRequestID
// Client polls this to know if the STK Push completed.
// Returns: { status: 'pending' | 'success' | 'failed', message }

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { stkQuery } from "@/lib/mpesa/client";

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const checkoutRequestId = searchParams.get("id");

  if (!checkoutRequestId) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }

  let result;
  try {
    result = await stkQuery(checkoutRequestId);
  } catch {
    // Query may fail if transaction is still processing — treat as pending
    return NextResponse.json({ status: "pending", message: "Processing…" });
  }

  if (result.ResultCode === "0") {
    return NextResponse.json({ status: "success", message: result.ResultDesc });
  }

  // 1032 = cancelled by user, 1 = insufficient funds / generic failure
  if (result.ResultCode === "1032") {
    return NextResponse.json({ status: "cancelled", message: "Payment cancelled." });
  }

  if (result.ResultCode === "1") {
    return NextResponse.json({ status: "failed", message: result.ResultDesc });
  }

  // Still pending (query too early)
  return NextResponse.json({ status: "pending", message: "Waiting for payment…" });
}
