// ─────────────────────────────────────────────────────────────────────────────
// GET /api/cron/weekly-prompts
// Vercel Cron — runs every Monday 07:00 UTC (08:00 WAT).
// Sends each active, WhatsApp-linked learner their dimension-matched weekly
// reflection prompt (BDF Deploy phase — defeats the "90-day enthusiasm drop"),
// and advances their streak. Auth: Bearer CRON_SECRET.
// ─────────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendText } from "@/lib/whatsapp/client";
import { getPromptForWeek } from "@/constants/reflection-prompts";
import { BGC_DIMENSIONS } from "@/constants/bgc-frameworks";
import type { DimensionId } from "@/types/platform";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const DIM_NAME: Record<DimensionId, string> = Object.fromEntries(
  BGC_DIMENSIONS.map((d) => [d.id, d.name])
) as Record<DimensionId, string>;

/** Derive the lowest-scoring dimension from a clarity assessment row. */
function primaryGapFromAssessment(a: {
  strategic_direction_pct: number | null;
  people_clarity_pct: number | null;
  systems_processes_pct: number | null;
  structural_clarity_pct: number | null;
  leadership_mastery_pct: number | null;
}): DimensionId {
  const pcts: [DimensionId, number][] = [
    ["strategic_direction", a.strategic_direction_pct ?? 0],
    ["people_clarity", a.people_clarity_pct ?? 0],
    ["systems_processes", a.systems_processes_pct ?? 0],
    ["structural_clarity", a.structural_clarity_pct ?? 0],
    ["leadership_mastery", a.leadership_mastery_pct ?? 0],
  ];
  return pcts.reduce((min, cur) => (cur[1] < min[1] ? cur : min))[0];
}

function programmeWeek(startISO: string | null): number {
  if (!startISO) return 1;
  const diff = Date.now() - new Date(startISO).getTime();
  return Math.max(1, Math.ceil(diff / (7 * 24 * 60 * 60 * 1000)));
}

export async function GET(req: NextRequest) {
  // ── Auth ────────────────────────────────────────────────────────────────────
  const auth = req.headers.get("authorization");
  if (!process.env.CRON_SECRET || auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();

  // Active, WhatsApp-linked learners (replied within the last 21 days).
  const cutoff = new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString();
  const { data: sessions, error } = await admin
    .from("wa_sessions")
    .select("id, wa_phone_number, user_id, streak_count, created_at")
    .not("user_id", "is", null)
    .gte("last_active_at", cutoff);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  let sent = 0;
  const failures: string[] = [];

  for (const s of sessions ?? []) {
    try {
      // Latest assessment → primary gap + programme start.
      const { data: assessment } = await admin
        .from("clarity_assessments")
        .select(
          "strategic_direction_pct, people_clarity_pct, systems_processes_pct, structural_clarity_pct, leadership_mastery_pct, completed_at"
        )
        .eq("user_id", s.user_id)
        .order("completed_at", { ascending: true })
        .limit(1)
        .maybeSingle();

      // No assessment yet → nudge them to complete it instead of a prompt.
      if (!assessment) {
        await sendText(
          s.wa_phone_number,
          "Good morning. Your Clarity Assessment is still pending — it's the 10-minute diagnostic that maps your gaps before coaching can begin. Reply *START* when you're ready."
        );
        sent++;
        continue;
      }

      const primaryGap = primaryGapFromAssessment(assessment);
      const week = programmeWeek(assessment.completed_at ?? s.created_at);
      const prompt = getPromptForWeek(week, primaryGap);
      const gapName = DIM_NAME[primaryGap] ?? "your focus dimension";

      const message =
        `*Week ${week} reflection*\n\n` +
        `Your priority dimension is *${gapName}*.\n\n` +
        `${prompt.prompt}\n\n` +
        `Reply here with your honest answer — your coach will respond, and it counts toward your Behavioural Evidence score.`;

      await sendText(s.wa_phone_number, message);

      // Advance streak and mark them awaiting a reflection reply.
      await admin
        .from("wa_sessions")
        .update({
          streak_count: (s.streak_count ?? 0) + 1,
          session_state: "reflection",
        })
        .eq("id", s.id);

      sent++;
    } catch (err) {
      console.error("[cron/weekly-prompts] failed for", s.wa_phone_number, err);
      failures.push(s.wa_phone_number);
    }
  }

  return NextResponse.json({
    ok: true,
    eligible: sessions?.length ?? 0,
    sent,
    failed: failures.length,
  });
}
