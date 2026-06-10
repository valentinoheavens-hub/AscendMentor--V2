// ─────────────────────────────────────────────────────────────────────────────
// WhatsApp Cloud API Webhook
// GET  — verify webhook (hub.challenge handshake)
// POST — receive incoming messages and status updates
//
// WhatsApp requires a 200 response within 15 seconds.
// Message processing runs async — we respond immediately.
// ─────────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from "next/server";
import { handleIncomingMessage } from "@/lib/whatsapp/flows";
import type { WAIncomingWebhook, WAIncomingMessage, WAContact } from "@/lib/whatsapp/types";

// ── GET — webhook verification ────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    // Echo the challenge back to verify ownership
    return new Response(challenge, { status: 200 });
  }

  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

// ── POST — incoming message handler ──────────────────────────────────────────

export async function POST(req: NextRequest) {
  let body: WAIncomingWebhook;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (body.object !== "whatsapp_business_account") {
    return NextResponse.json({ error: "Unrecognised webhook object" }, { status: 400 });
  }

  // Process asynchronously — WhatsApp will retry if we don't respond within 15s
  processWebhook(body).catch((err) =>
    console.error("[whatsapp/webhook] processing error:", err)
  );

  // Respond 200 immediately as required by the WhatsApp webhook contract
  return NextResponse.json({ status: "ok" });
}

// ── Async processor ───────────────────────────────────────────────────────────

async function processWebhook(webhook: WAIncomingWebhook): Promise<void> {
  for (const entry of webhook.entry) {
    for (const change of entry.changes) {
      if (change.field !== "messages") continue;

      const { messages, contacts, statuses } = change.value;

      // Status updates (delivered / read) — no action needed
      if (statuses?.length && !messages?.length) continue;

      if (!messages?.length) continue;

      for (let i = 0; i < messages.length; i++) {
        const message = messages[i] as WAIncomingMessage;
        const contact = (contacts?.[i] as WAContact) ?? null;

        // Only handle message types the flows support
        if (!["text", "interactive", "button"].includes(message.type)) continue;

        try {
          await handleIncomingMessage(message, contact);
        } catch (err) {
          console.error(
            `[whatsapp/webhook] failed to handle message from ${message.from}:`,
            err
          );
        }
      }
    }
  }
}
