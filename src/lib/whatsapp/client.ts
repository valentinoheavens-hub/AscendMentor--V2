// ─────────────────────────────────────────────────────────────────────────────
// WhatsApp Cloud API — HTTP client
// ─────────────────────────────────────────────────────────────────────────────

import type {
  WATextPayload,
  WAInteractivePayload,
  WAInteractiveContent,
  WAReadPayload,
} from "./types";

const GRAPH_BASE = "https://graph.facebook.com/v21.0";

function getCredentials() {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const token = process.env.WHATSAPP_TOKEN;
  if (!phoneNumberId || !token) {
    throw new Error("WHATSAPP_PHONE_NUMBER_ID / WHATSAPP_TOKEN not configured");
  }
  return { phoneNumberId, token };
}

async function post(
  path: string,
  token: string,
  body: WATextPayload | WAInteractivePayload | WAReadPayload
): Promise<void> {
  const res = await fetch(`${GRAPH_BASE}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`WhatsApp API ${res.status}: ${text}`);
  }
}

export function sendText(to: string, body: string): Promise<void> {
  const { phoneNumberId, token } = getCredentials();
  return post(`/${phoneNumberId}/messages`, token, {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to,
    type: "text",
    text: { body },
  });
}

export function sendInteractive(
  to: string,
  interactive: WAInteractiveContent
): Promise<void> {
  const { phoneNumberId, token } = getCredentials();
  return post(`/${phoneNumberId}/messages`, token, {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to,
    type: "interactive",
    interactive,
  });
}

export function markRead(messageId: string): Promise<void> {
  const { phoneNumberId, token } = getCredentials();
  return post(`/${phoneNumberId}/messages`, token, {
    messaging_product: "whatsapp",
    status: "read",
    message_id: messageId,
  });
}
