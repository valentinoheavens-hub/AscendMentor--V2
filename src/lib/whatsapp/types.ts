// ─────────────────────────────────────────────────────────────────────────────
// WhatsApp Cloud API — TypeScript message types
// ─────────────────────────────────────────────────────────────────────────────

// ── Incoming webhook ─────────────────────────────────────────────────────────

export interface WAIncomingWebhook {
  object: string;
  entry: WAEntry[];
}

export interface WAEntry {
  id: string;
  changes: WAChange[];
}

export interface WAChange {
  value: WAChangeValue;
  field: string;
}

export interface WAChangeValue {
  messaging_product: string;
  metadata: WAMetadata;
  contacts?: WAContact[];
  messages?: WAIncomingMessage[];
  statuses?: WAMessageStatus[];
}

export interface WAMetadata {
  display_phone_number: string;
  phone_number_id: string;
}

export interface WAContact {
  profile: { name: string };
  wa_id: string;
}

export interface WAIncomingMessage {
  from: string;
  id: string;
  timestamp: string;
  type: "text" | "interactive" | "button" | "image" | "document" | "audio";
  text?: { body: string };
  interactive?: {
    type: "button_reply" | "list_reply";
    button_reply?: { id: string; title: string };
    list_reply?: { id: string; title: string; description?: string };
  };
  button?: { text: string; payload: string };
}

export interface WAMessageStatus {
  id: string;
  status: "sent" | "delivered" | "read" | "failed";
  timestamp: string;
  recipient_id: string;
}

// ── Outgoing messages ─────────────────────────────────────────────────────────

export interface WATextPayload {
  messaging_product: "whatsapp";
  recipient_type: "individual";
  to: string;
  type: "text";
  text: { body: string; preview_url?: boolean };
}

export interface WAInteractivePayload {
  messaging_product: "whatsapp";
  recipient_type: "individual";
  to: string;
  type: "interactive";
  interactive: WAInteractiveContent;
}

export interface WAReadPayload {
  messaging_product: "whatsapp";
  status: "read";
  message_id: string;
}

export type WAInteractiveContent = WAButtonInteractive | WAListInteractive;

export interface WAButtonInteractive {
  type: "button";
  body: { text: string };
  header?: { type: "text"; text: string };
  footer?: { text: string };
  action: {
    buttons: Array<{
      type: "reply";
      reply: { id: string; title: string };
    }>;
  };
}

export interface WAListInteractive {
  type: "list";
  body: { text: string };
  header?: { type: "text"; text: string };
  footer?: { text: string };
  action: {
    button: string;
    sections: Array<{
      title: string;
      rows: Array<{
        id: string;
        title: string;
        description?: string;
      }>;
    }>;
  };
}
