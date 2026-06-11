// ─────────────────────────────────────────────────────────────────────────────
// M-Pesa Daraja API client — server use only
// Supports: STK Push (Lipa na M-Pesa Online), STK Push Query
// Docs: https://developer.safaricom.co.ke/Documentation
// ─────────────────────────────────────────────────────────────────────────────

function baseUrl() {
  return process.env.MPESA_ENVIRONMENT === "production"
    ? "https://api.safaricom.co.ke"
    : "https://sandbox.safaricom.co.ke";
}

// ── OAuth token (short-lived, ~1 hour) ───────────────────────────────────────
let _cachedToken: { token: string; expiresAt: number } | null = null;

export async function getAccessToken(): Promise<string> {
  const now = Date.now();
  if (_cachedToken && _cachedToken.expiresAt > now + 60_000) {
    return _cachedToken.token;
  }

  const key = process.env.MPESA_CONSUMER_KEY ?? "";
  const secret = process.env.MPESA_CONSUMER_SECRET ?? "";
  const credentials = Buffer.from(`${key}:${secret}`).toString("base64");

  const res = await fetch(
    `${baseUrl()}/oauth/v1/generate?grant_type=client_credentials`,
    {
      headers: {
        Authorization: `Basic ${credentials}`,
      },
    }
  );

  const json = await res.json();
  if (!json.access_token) {
    throw new Error(json.errorMessage ?? "M-Pesa auth failed");
  }

  _cachedToken = {
    token: json.access_token,
    expiresAt: now + parseInt(json.expires_in ?? "3600") * 1000,
  };
  return _cachedToken.token;
}

// ── STK Push ─────────────────────────────────────────────────────────────────
export interface STKPushParams {
  phone: string;      // format: 254XXXXXXXXX
  amount: number;     // whole KES
  accountRef: string; // shown on M-Pesa prompt (e.g. "AM-INDIVIDUAL")
  description: string;
  callbackUrl: string;
}

export interface STKPushResult {
  MerchantRequestID: string;
  CheckoutRequestID: string;
  ResponseCode: string;
  ResponseDescription: string;
  CustomerMessage: string;
}

function stkTimestamp(): string {
  return new Date()
    .toISOString()
    .replace(/[-:T.Z]/g, "")
    .slice(0, 14);
}

function stkPassword(timestamp: string): string {
  const shortcode = process.env.MPESA_SHORTCODE ?? "";
  const passkey = process.env.MPESA_PASSKEY ?? "";
  return Buffer.from(`${shortcode}${passkey}${timestamp}`).toString("base64");
}

export async function stkPush(params: STKPushParams): Promise<STKPushResult> {
  const token = await getAccessToken();
  const timestamp = stkTimestamp();
  const shortcode = process.env.MPESA_SHORTCODE ?? "";

  const res = await fetch(`${baseUrl()}/mpesa/stkpush/v1/processrequest`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      BusinessShortCode: shortcode,
      Password: stkPassword(timestamp),
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: Math.ceil(params.amount),
      PartyA: params.phone,
      PartyB: shortcode,
      PhoneNumber: params.phone,
      CallBackURL: params.callbackUrl,
      AccountReference: params.accountRef,
      TransactionDesc: params.description,
    }),
  });

  const json = await res.json();
  if (json.ResponseCode !== "0") {
    throw new Error(
      json.ResponseDescription ?? json.errorMessage ?? "STK Push failed"
    );
  }
  return json as STKPushResult;
}

// ── STK Push Query (poll status) ─────────────────────────────────────────────
export interface STKQueryResult {
  ResultCode: string;       // "0" = success, "1032" = cancelled, "1" = failed
  ResultDesc: string;
  CheckoutRequestID: string;
}

export async function stkQuery(
  checkoutRequestId: string
): Promise<STKQueryResult> {
  const token = await getAccessToken();
  const timestamp = stkTimestamp();
  const shortcode = process.env.MPESA_SHORTCODE ?? "";

  const res = await fetch(`${baseUrl()}/mpesa/stkpushquery/v1/query`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      BusinessShortCode: shortcode,
      Password: stkPassword(timestamp),
      Timestamp: timestamp,
      CheckoutRequestID: checkoutRequestId,
    }),
  });

  const json = await res.json();
  return json as STKQueryResult;
}

// Normalize phone to 254XXXXXXXXX format
export function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("0")) return `254${digits.slice(1)}`;
  if (digits.startsWith("254")) return digits;
  if (digits.startsWith("+254")) return digits.slice(1);
  return digits;
}
