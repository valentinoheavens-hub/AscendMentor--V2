// ─────────────────────────────────────────────────────────────────────────────
// Flutterwave server-side client — server use only
// Docs: https://developer.flutterwave.com/docs
// ─────────────────────────────────────────────────────────────────────────────

const FLW_BASE = "https://api.flutterwave.com/v3";

function headers() {
  return {
    Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
    "Content-Type": "application/json",
  };
}

export interface FLWInitializeParams {
  tx_ref: string;
  amount: number;
  currency: string;
  redirect_url: string;
  customer: { email: string; name?: string; phonenumber?: string };
  meta?: Record<string, unknown>;
  customizations?: { title?: string; logo?: string };
}

export interface FLWInitializeResult {
  link: string; // Flutterwave hosted checkout URL
}

export async function initializePayment(
  params: FLWInitializeParams
): Promise<FLWInitializeResult> {
  const res = await fetch(`${FLW_BASE}/payments`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      tx_ref: params.tx_ref,
      amount: params.amount,
      currency: params.currency,
      redirect_url: params.redirect_url,
      customer: params.customer,
      meta: params.meta ?? {},
      customizations: {
        title: params.customizations?.title ?? "ClarityOS",
        logo: params.customizations?.logo,
      },
    }),
  });

  const json = await res.json();
  if (json.status !== "success") {
    throw new Error(json.message ?? "Flutterwave initialize failed");
  }
  return { link: json.data.link };
}

export interface FLWVerifyResult {
  status: "successful" | "failed" | "pending";
  tx_ref: string;
  amount: number;
  currency: string;
  customer: { email: string };
  meta: Record<string, unknown> | null;
}

export async function verifyTransaction(
  transactionId: string
): Promise<FLWVerifyResult> {
  const res = await fetch(
    `${FLW_BASE}/transactions/${transactionId}/verify`,
    { headers: headers() }
  );

  const json = await res.json();
  if (json.status !== "success") {
    throw new Error(json.message ?? "Flutterwave verify failed");
  }
  return json.data as FLWVerifyResult;
}

// Webhook signature: compare x-flw-signature header against webhook hash
export function verifyWebhookSignature(
  signature: string,
  webhookHash: string
): boolean {
  return signature === webhookHash;
}
