// ─────────────────────────────────────────────────────────────────────────────
// BGC Coach API — streaming chat endpoint (Groq — fast inference)
// GET  /api/bgc-coach?type=coaching|reflection|assessment_debrief
//      → creates a new coaching session, returns { session_id }
// POST /api/bgc-coach
//      body: { messages, session_id?, session_type? }
//      → streams Groq SSE text/event-stream
// ─────────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { createClient } from "@/lib/supabase/server";
import { buildSystemPrompt } from "@/lib/bgc-coach/system-prompt";
import type {
  LearnerProfile,
  ClarityProfile,
  MasteryScoreBreakdown,
  SessionType,
} from "@/types/platform";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// ── GET — create session ──────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const sessionType = (searchParams.get("type") ?? "coaching") as SessionType;

  const { data: learner, error } = await supabase
    .from("learners")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (error || !learner) {
    return NextResponse.json({ error: "Learner not found" }, { status: 404 });
  }

  const { data: session } = await supabase
    .from("coaching_sessions")
    .insert({
      user_id: user.id,
      learner_id: learner.id,
      session_type: sessionType,
      message_count: 0,
      started_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  return NextResponse.json({ session_id: session?.id ?? null });
}

// ── POST — stream response ────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const {
    messages,
    session_id,
    session_type = "coaching",
  } = body as {
    messages: Array<{ role: "user" | "assistant"; content: string }>;
    session_id?: string;
    session_type?: SessionType;
  };

  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: "messages required" }, { status: 400 });
  }

  // Load learner + latest mastery + latest assessment in parallel
  const [learnerRes, masteryRes, assessmentRes] = await Promise.all([
    supabase
      .from("learners")
      .select(
        "full_name, organisation_name, role_title, organisation_size, years_running, country, initial_challenge, success_criteria, past_coaching, past_coaching_outcome, created_at"
      )
      .eq("user_id", user.id)
      .single(),
    supabase
      .from("mastery_scores")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("clarity_assessments")
      .select("*")
      .eq("user_id", user.id)
      .order("completed_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  if (learnerRes.error || !learnerRes.data) {
    return NextResponse.json({ error: "Learner not found" }, { status: 404 });
  }

  const systemPrompt = buildSystemPrompt({
    learner: learnerRes.data as unknown as LearnerProfile,
    clarityProfile: assessmentRes.data as ClarityProfile | null,
    masteryScore: masteryRes.data as MasteryScoreBreakdown | null,
    weekNumber: computeWeekNumber(learnerRes.data as { created_at?: string }),
    sessionType: session_type,
  });

  // Stream via TransformStream
  const encoder = new TextEncoder();
  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter();

  (async () => {
    let fullContent = "";
    try {
      const stream = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        max_tokens: 1024,
        messages: [
          { role: "system", content: systemPrompt },
          ...messages.map((m) => ({ role: m.role, content: m.content })),
        ],
        stream: true,
      });

      for await (const chunk of stream) {
        const text = chunk.choices[0]?.delta?.content ?? "";
        if (text) {
          fullContent += text;
          await writer.write(
            encoder.encode(`data: ${JSON.stringify({ text })}\n\n`)
          );
        }
      }

      // Persist messages if session is tracked
      if (session_id && fullContent) {
        const lastUser = messages.at(-1);
        if (lastUser?.role === "user") {
          await supabase.from("session_messages").insert([
            {
              session_id,
              role: "user",
              content: lastUser.content,
              framework_citations: [],
            },
            {
              session_id,
              role: "assistant",
              content: fullContent,
              framework_citations: extractCitations(fullContent),
            },
          ]);
          await supabase
            .from("coaching_sessions")
            .update({
              message_count: messages.length + 1,
              ended_at: new Date().toISOString(),
            })
            .eq("id", session_id);
        }
      }

      await writer.write(encoder.encode("data: [DONE]\n\n"));
    } catch (err) {
      console.error("[bgc-coach] stream error:", err);
      await writer.write(
        encoder.encode(`data: ${JSON.stringify({ error: "Stream error" })}\n\n`)
      );
    } finally {
      await writer.close();
    }
  })();

  return new Response(readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function computeWeekNumber(learner: { created_at?: string }): number {
  if (!learner.created_at) return 1;
  const diffMs = Date.now() - new Date(learner.created_at).getTime();
  return Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24 * 7)));
}

const FRAMEWORK_NAMES = [
  "The Clarity Mandate",
  "Blackbelt OS",
  "People · Systems · Structure",
  "Blackbelt Delivery Framework",
  "BANT+F",
  "BDF",
];

function extractCitations(text: string): string[] {
  return FRAMEWORK_NAMES.filter((f) => text.includes(f));
}
