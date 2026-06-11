// ─────────────────────────────────────────────────────────────────────────────
// Paystack server-side client — server use only, never import in client components
// ─────────────────────────────────────────────────────────────────────────────

const PAYSTACK_BASE = "https://api.paystack.co";

function headers() {
  return {
    Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
    "Content-Type": "application/json",
  };
}

export interface InitializeParams {
  email: string;
  amount: number; // in cents/kobo
  reference: string;
  currency?: string;
  callback_url: string;
  metadata?: Record<string, unknown>;
}

export interface InitializeResult {
  authorization_url: string;
  access_code: string;
  reference: string;
}

export async function initializeTransaction(
  params: InitializeParams
): Promise<InitializeResult> {
  const res = await fetch(`${PAYSTACK_BASE}/transaction/initialize`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      email: params.email,
      amount: params.amount,
      reference: params.reference,
      currency: params.currency ?? "USD",
      callback_url: params.callback_url,
      metadata: params.metadata ?? {},
    }),
  });

  const json = await res.json();
  if (!json.status) {
    throw new Error(json.message ?? "Paystack initialize failed");
  }
  return json.data as InitializeResult;
}

export interface VerifyResult {
  status: "success" | "failed" | "abandoned";
  reference: string;
  amount: number;
  currency: string;
  customer: { email: string };
  metadata: Record<string, unknown>;
  paid_at: string;
}

export async function verifyTransaction(
  reference: string
): Promise<VerifyResult> {
  const res = await fetch(
    `${PAYSTACK_BASE}/transaction/verify/${encodeURIComponent(reference)}`,
    { headers: headers() }
  );

  const json = await res.json();
  if (!json.status) {
    throw new Error(json.message ?? "Paystack verify failed");
  }
  return json.data as VerifyResult;
}

// HMAC-SHA512 signature verification for webhooks
export async function verifyWebhookSignature(
  rawBody: string,
  signature: string
): Promise<boolean> {
  const { createHmac } = await import("crypto");
  const hash = createHmac("sha512", process.env.PAYSTACK_SECRET_KEY ?? "")
    .update(rawBody)
    .digest("hex");
  return hash === signature;
}
