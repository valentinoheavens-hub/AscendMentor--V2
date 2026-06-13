// ─────────────────────────────────────────────────────────────────────────────
// BGC Coach — provider. SERVER ONLY.
//
// One brain, one voice across every channel (web, WhatsApp, evidence scoring).
// All coaching inference runs through Groq so the model and provider are defined
// in exactly one place. Override the model with BGC_COACH_MODEL.
// ─────────────────────────────────────────────────────────────────────────────

import Groq from "groq-sdk";

export const COACH_MODEL =
  process.env.BGC_COACH_MODEL ?? "llama-3.3-70b-versatile";

let client: Groq | null = null;
function groq(): Groq {
  if (!client) client = new Groq({ apiKey: process.env.GROQ_API_KEY });
  return client;
}

export type CoachMessage = { role: "user" | "assistant"; content: string };

/** Stream the coach response as text deltas (used by the web chat endpoint). */
export async function* streamCoach(
  system: string,
  messages: CoachMessage[],
  maxTokens = 1024
): AsyncGenerator<string> {
  const stream = await groq().chat.completions.create({
    model: COACH_MODEL,
    max_tokens: maxTokens,
    messages: [{ role: "system", content: system }, ...messages],
    stream: true,
  });
  for await (const chunk of stream) {
    const text = chunk.choices[0]?.delta?.content ?? "";
    if (text) yield text;
  }
}

/** One-shot coach completion returning the full text (WhatsApp, scoring). */
export async function generateCoach(
  system: string,
  messages: CoachMessage[],
  maxTokens = 600
): Promise<string> {
  const res = await groq().chat.completions.create({
    model: COACH_MODEL,
    max_tokens: maxTokens,
    messages: [{ role: "system", content: system }, ...messages],
  });
  return res.choices[0]?.message?.content ?? "";
}
