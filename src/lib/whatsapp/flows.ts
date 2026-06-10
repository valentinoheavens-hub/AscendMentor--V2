// ─────────────────────────────────────────────────────────────────────────────
// WhatsApp conversation flows — 5 BGC coaching flows
//
// Flow routing by session_state:
//   onboarding   → prompt to complete web onboarding
//   assessment   → prompt to complete Clarity Assessment
//   coaching     → BGC Coach AI session
//   reflection   → weekly framework reflection prompt
//   completed    → main menu with score/belt overview
// ─────────────────────────────────────────────────────────────────────────────

import Anthropic from "@anthropic-ai/sdk";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendText, sendInteractive, markRead } from "./client";
import { buildSystemPrompt } from "@/lib/bgc-coach/system-prompt";
import { getBeltForScore } from "@/constants/bgc-frameworks";
import { getPromptForWeek } from "@/constants/reflection-prompts";
import type {
  WASession,
  WAMessage,
  LearnerProfile,
  ClarityProfile,
  MasteryScoreBreakdown,
  DimensionId,
  SessionState,
} from "@/types/platform";
import type { WAIncomingMessage, WAContact } from "./types";

const anthropic = new Anthropic();
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://ascendmentor.ai";

// Cast typed arrays to the `unknown` Supabase expects for JSONB columns
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const j = (v: unknown): any => v;

// ── Entry point ───────────────────────────────────────────────────────────────

export async function handleIncomingMessage(
  message: WAIncomingMessage,
  contact: WAContact | null
): Promise<void> {
  const supabase = createAdminClient();
  const phone = message.from;
  const text = extractText(message);

  await markRead(message.id).catch(() => null);

  // ── Load or create WA session ───────────────────────────────────────────────
  const { data: rawSession } = await supabase
    .from("wa_sessions")
    .select("*")
    .eq("wa_phone_number", phone)
    .maybeSingle();

  let session = rawSession as WASession | null;

  if (!session) {
    const { data: learner } = await supabase
      .from("learners")
      .select("id, user_id, onboarding_complete, assessment_complete")
      .eq("phone_number", phone)
      .maybeSingle();

    const initialState: SessionState = learner
      ? learner.onboarding_complete
        ? learner.assessment_complete
          ? "coaching"
          : "assessment"
        : "onboarding"
      : "onboarding";

    const { data: newSession } = await supabase
      .from("wa_sessions")
      .insert({
        wa_phone_number: phone,
        user_id: learner?.user_id ?? null,
        learner_id: learner?.id ?? null,
        session_state: initialState,
        conversation_history: j([]),
        clarity_scores: j({}),
        mastery_score: 0,
        current_dimension: null,
        assessment_answers: j([]),
        assessment_question_index: 0,
        streak_count: 0,
        last_menu_open: false,
        last_active_at: new Date().toISOString(),
      })
      .select("*")
      .single();

    session = newSession as WASession | null;
  }

  if (!session) {
    await sendText(phone, "Something went wrong. Please try again.");
    return;
  }

  await supabase
    .from("wa_sessions")
    .update({ last_active_at: new Date().toISOString() })
    .eq("id", session.id);

  // ── Global commands ─────────────────────────────────────────────────────────
  const lower = text.toLowerCase().trim();

  if (lower === "menu" || lower === "0") {
    await sendMainMenu(phone, session);
    return;
  }
  if (lower === "help") {
    await sendText(
      phone,
      `*AscendMentor AI — BGC Coach*\n\nType:\n• *menu* — your dashboard\n• *score* — current Mastery Score\n• *coach* — start coaching\n• *reflect* — weekly reflection\n\n${APP_URL}/dashboard`
    );
    return;
  }
  if (lower === "score") {
    await sendScoreCard(phone, session);
    return;
  }

  // ── Route by state ──────────────────────────────────────────────────────────
  switch (session.session_state as SessionState) {
    case "onboarding":
      await flowOnboarding(phone, session, text);
      break;
    case "assessment":
      await flowAssessmentPrompt(phone, session, text);
      break;
    case "coaching":
      await flowCoaching(phone, session, text);
      break;
    case "reflection":
      await flowReflection(phone, session, text);
      break;
    case "completed":
      await flowCompleted(phone, session, text);
      break;
    default:
      await sendMainMenu(phone, session);
  }
}

// ── Flow 1: Onboarding ────────────────────────────────────────────────────────

async function flowOnboarding(
  phone: string,
  _session: WASession,
  _text: string
): Promise<void> {
  await sendText(
    phone,
    `Welcome to *AscendMentor AI* — the BGC leadership mastery platform for African founders and executives.\n\nTo access your personalised BGC Coach, complete your profile at:\n\n👉 ${APP_URL}/signup\n\nOnce you finish the 5-step onboarding, your coach will be ready here.`
  );
}

// ── Flow 2: Assessment prompt ─────────────────────────────────────────────────

async function flowAssessmentPrompt(
  phone: string,
  _session: WASession,
  text: string
): Promise<void> {
  if (text === "start_assessment") {
    await sendText(
      phone,
      `Open your Clarity Assessment here:\n\n${APP_URL}/assessment\n\nOnce complete, type *menu* to start coaching.`
    );
    return;
  }
  if (text === "remind_later") {
    await sendText(
      phone,
      `No problem. When you are ready, type *assess* or visit:\n${APP_URL}/assessment`
    );
    return;
  }

  await sendInteractive(phone, {
    type: "button",
    header: { type: "text", text: "Clarity Assessment™" },
    body: {
      text:
        `Onboarding complete.\n\nBefore your BGC Coach can give you a personalised plan, complete the *30-question Clarity Assessment™* (8–12 min).\n\nIt reveals exactly where your leadership clarity gaps are.`,
    },
    footer: { text: "BGC — Clarity changes everything" },
    action: {
      buttons: [
        { type: "reply", reply: { id: "start_assessment", title: "Take Assessment" } },
        { type: "reply", reply: { id: "remind_later", title: "Remind me later" } },
      ],
    },
  });
}

// ── Flow 3: Coaching ──────────────────────────────────────────────────────────

async function flowCoaching(
  phone: string,
  session: WASession,
  text: string
): Promise<void> {
  const supabase = createAdminClient();
  const lower = text.toLowerCase().trim();

  if (lower === "start_coaching" || lower === "coach") {
    await sendText(
      phone,
      `*BGC Coach is ready.*\n\nTell me what you are working through. I will ask precise questions and give you a direct diagnosis — no fluff.\n\nWhat is the most pressing leadership or organisational challenge you are facing right now?`
    );
    return;
  }
  if (lower === "end" || lower === "stop") {
    await sendText(
      phone,
      `Session ended. Type *menu* for your dashboard or *reflect* for your weekly prompt.`
    );
    return;
  }

  const learnerContext = await loadLearnerContext(session);
  if (!learnerContext) {
    await sendText(
      phone,
      `Your profile could not be loaded. Sign in at ${APP_URL}/login and try again.`
    );
    return;
  }

  const history: WAMessage[] = (session.conversation_history as WAMessage[]) ?? [];
  const withUser: WAMessage[] = [
    ...history,
    { role: "user", content: text, timestamp: new Date().toISOString() },
  ];
  const capped = withUser.slice(-20);

  const systemPrompt = buildSystemPrompt({
    learner: learnerContext.learner,
    clarityProfile: learnerContext.clarityProfile,
    masteryScore: learnerContext.masteryScore,
    weekNumber: computeWeekNumber(learnerContext.learner as { created_at?: string }),
    sessionType: "coaching",
  });

  let reply = "";
  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 500,
      system: systemPrompt,
      messages: capped.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    });
    reply =
      response.content[0].type === "text"
        ? response.content[0].text
        : "Could not generate a response. Please try again.";
  } catch {
    reply = "There was an issue connecting to the BGC Coach. Please try again.";
  }

  const updated: WAMessage[] = [
    ...capped,
    { role: "assistant", content: reply, timestamp: new Date().toISOString() },
  ];

  await supabase
    .from("wa_sessions")
    .update({ conversation_history: j(updated) })
    .eq("id", session.id);

  await sendText(phone, reply.length > 4000 ? reply.slice(0, 3997) + "…" : reply);
}

// ── Flow 4: Reflection ────────────────────────────────────────────────────────

async function flowReflection(
  phone: string,
  session: WASession,
  text: string
): Promise<void> {
  const supabase = createAdminClient();
  const learnerContext = await loadLearnerContext(session);
  const primaryGap: DimensionId =
    (learnerContext?.clarityProfile?.primary_gap as DimensionId) ?? "leadership_mastery";

  const weekNumber = computeWeekNumber(
    learnerContext?.learner as { created_at?: string } | undefined
  );
  const prompt = getPromptForWeek(weekNumber, primaryGap);

  const history: WAMessage[] = (session.conversation_history as WAMessage[]) ?? [];
  const isFirst = history.length === 0 || text.toLowerCase() === "reflect";

  if (isFirst) {
    await sendText(
      phone,
      `*Week ${weekNumber} Reflection — ${prompt.framework}*\n\n${prompt.prompt}\n\nTake a moment, then reply with your honest answer.`
    );
    await supabase
      .from("wa_sessions")
      .update({ conversation_history: j([]) })
      .eq("id", session.id);
    return;
  }

  const systemPrompt = buildSystemPrompt({
    learner: (learnerContext?.learner ?? {}) as LearnerProfile,
    clarityProfile: learnerContext?.clarityProfile ?? null,
    masteryScore: learnerContext?.masteryScore ?? null,
    weekNumber,
    sessionType: "reflection",
  });

  const instruction = `The learner is responding to this reflection prompt:\n"${prompt.prompt}"\n\nCoaching note: ${prompt.coaching_note}\n\nDeliver a sharp, framework-grounded coaching reply. End with ONE specific commitment for them to make before next week.`;

  let reply = "";
  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 500,
      system: systemPrompt + "\n\n" + instruction,
      messages: [{ role: "user", content: text }],
    });
    reply =
      response.content[0].type === "text"
        ? response.content[0].text
        : "Could not process your reflection. Please try again.";
  } catch {
    reply = "There was an issue. Please try again.";
  }

  // Record weekly activity if user is linked
  if (session.user_id) {
    try {
      await supabase.from("weekly_streaks").upsert(
        {
          user_id: session.user_id,
          week_start: getWeekStart(),
          activity_type: "reflection",
          completed: true,
        },
        { onConflict: "user_id, week_start" }
      );
    } catch {
      // Non-critical — don't block the reply
    }
  }

  await sendText(phone, reply.length > 4000 ? reply.slice(0, 3997) + "…" : reply);
}

// ── Flow 5: Completed / Main menu fallback ────────────────────────────────────

async function flowCompleted(
  phone: string,
  session: WASession,
  text: string
): Promise<void> {
  const supabase = createAdminClient();
  const lower = text.toLowerCase().trim();

  if (lower === "coach" || lower === "start_coaching") {
    await supabase
      .from("wa_sessions")
      .update({ session_state: "coaching", conversation_history: j([]) })
      .eq("id", session.id);
    await flowCoaching(phone, { ...session, session_state: "coaching" }, text);
    return;
  }

  if (lower === "reflect") {
    await supabase
      .from("wa_sessions")
      .update({ session_state: "reflection", conversation_history: j([]) })
      .eq("id", session.id);
    await flowReflection(
      phone,
      { ...session, session_state: "reflection" },
      "reflect"
    );
    return;
  }

  await sendMainMenu(phone, session);
}

// ── Shared helpers ────────────────────────────────────────────────────────────

async function sendMainMenu(phone: string, session: WASession): Promise<void> {
  const score = (session.mastery_score as number) ?? 0;
  const belt = getBeltForScore(score);
  const scoreText =
    score > 0
      ? `*Mastery Score*: ${score}/100 — ${belt.name}`
      : `*Mastery Score*: Not yet assessed`;

  await sendInteractive(phone, {
    type: "list",
    header: { type: "text", text: "AscendMentor AI" },
    body: {
      text: `${scoreText}\n*Streak*: ${(session.streak_count as number) ?? 0} weeks\n\nWhat would you like to do?`,
    },
    footer: { text: "BGC — Clarity changes everything" },
    action: {
      button: "Open menu",
      sections: [
        {
          title: "Coaching",
          rows: [
            {
              id: "coach",
              title: "BGC Coaching Session",
              description: "Direct AI coaching on your leadership challenges",
            },
            {
              id: "reflect",
              title: "Weekly Reflection",
              description: "Framework-anchored prompt for this week",
            },
          ],
        },
        {
          title: "Progress",
          rows: [
            {
              id: "score",
              title: "My Mastery Score",
              description: "See your current score and belt breakdown",
            },
            {
              id: "dashboard",
              title: "Open Dashboard",
              description: `${APP_URL}/dashboard`,
            },
          ],
        },
      ],
    },
  });
}

async function sendScoreCard(phone: string, session: WASession): Promise<void> {
  const score = (session.mastery_score as number) ?? 0;
  const belt = getBeltForScore(score);

  if (score === 0) {
    await sendText(
      phone,
      `*No Mastery Score yet.*\n\nComplete your Clarity Assessment to unlock your score:\n${APP_URL}/assessment`
    );
    return;
  }

  await sendText(
    phone,
    `*Your BGC Mastery Score*\n\nScore: *${score}/100*\nBelt: *${belt.name}* — ${belt.subtitle}\nStreak: ${(session.streak_count as number) ?? 0} consecutive weeks\n\nFull Clarity Profile:\n${APP_URL}/dashboard`
  );
}

interface LearnerContext {
  learner: LearnerProfile;
  clarityProfile: ClarityProfile | null;
  masteryScore: MasteryScoreBreakdown | null;
}

async function loadLearnerContext(
  session: WASession
): Promise<LearnerContext | null> {
  if (!session.user_id) return null;

  const supabase = createAdminClient();
  const [learnerRes, masteryRes, assessmentRes] = await Promise.all([
    supabase
      .from("learners")
      .select(
        "full_name, organisation_name, role_title, organisation_size, years_running, country, initial_challenge, past_coaching, past_coaching_outcome, success_criteria, created_at"
      )
      .eq("user_id", session.user_id)
      .single(),
    supabase
      .from("mastery_scores")
      .select("*")
      .eq("user_id", session.user_id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("clarity_assessments")
      .select("*")
      .eq("user_id", session.user_id)
      .order("completed_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  if (learnerRes.error || !learnerRes.data) return null;

  if ((masteryRes.data as { total_score?: number } | null)?.total_score !== undefined) {
    try {
      await supabase
        .from("wa_sessions")
        .update({ mastery_score: (masteryRes.data as { total_score: number }).total_score })
        .eq("id", session.id);
    } catch {
      // Non-critical
    }
  }

  return {
    learner: learnerRes.data as unknown as LearnerProfile,
    clarityProfile: assessmentRes.data as ClarityProfile | null,
    masteryScore: masteryRes.data as MasteryScoreBreakdown | null,
  };
}

function extractText(message: WAIncomingMessage): string {
  if (message.type === "text") return message.text?.body ?? "";
  if (message.type === "interactive") {
    return (
      message.interactive?.button_reply?.id ??
      message.interactive?.list_reply?.id ??
      ""
    );
  }
  if (message.type === "button") return message.button?.payload ?? "";
  return "";
}

function computeWeekNumber(learner?: { created_at?: string }): number {
  if (!learner?.created_at) return 1;
  const diffMs = Date.now() - new Date(learner.created_at).getTime();
  return Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24 * 7)));
}

function getWeekStart(): string {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() - d.getUTCDay());
  return d.toISOString().split("T")[0];
}
