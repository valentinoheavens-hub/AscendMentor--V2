// ─────────────────────────────────────────────────────────────────────────────
// Weekly Reflection Prompts — BGC Framework-mapped
// Rotate on a 12-week cycle, dimension-specific
// ─────────────────────────────────────────────────────────────────────────────

import type { DimensionId } from "@/types/platform";

export interface ReflectionPrompt {
  id: string;
  dimension_id: DimensionId;
  week_pattern: number; // 1–12, then repeats
  framework: string;
  prompt: string;
  coaching_note: string; // what Claude should watch for in responses
}

export const REFLECTION_PROMPTS: ReflectionPrompt[] = [
  // ── STRATEGIC DIRECTION ────────────────────────────────────────────────────
  {
    id: 'rp_sd_01',
    dimension_id: 'strategic_direction',
    week_pattern: 1,
    framework: 'The Clarity Mandate — Strategy & Direction domain',
    prompt:
      'Name one decision you avoided making this week because you were not sure it was "the right one." What was the real reason you avoided it?',
    coaching_note: 'Look for strategic avoidance patterns, fear masquerading as caution, and lack of documented decision criteria.',
  },
  {
    id: 'rp_sd_02',
    dimension_id: 'strategic_direction',
    week_pattern: 6,
    framework: 'Blackbelt OS — Strategy & Direction domain',
    prompt:
      'What is the one thing that, if it became clear this week, would change how you lead your organisation? What is stopping that clarity from arriving?',
    coaching_note: 'Probe for avoidance of strategic choices, comfort with ambiguity that masks drift.',
  },

  // ── PEOPLE CLARITY ────────────────────────────────────────────────────────
  {
    id: 'rp_pc_01',
    dimension_id: 'people_clarity',
    week_pattern: 2,
    framework: 'People · Systems · Structure — People pillar',
    prompt:
      'Think of one person on your team whose role is genuinely unclear to them. What is the cost of that unclarity per week — in time, energy, and missed output?',
    coaching_note: 'Watch for rationalisation of known mismatches, tolerance of low accountability, delegation gaps.',
  },
  {
    id: 'rp_pc_02',
    dimension_id: 'people_clarity',
    week_pattern: 7,
    framework: 'Blackbelt OS — People & Culture domain',
    prompt:
      'Where did you give feedback to a team member this week? If you did not, what got in the way — and what does that cost the person and the organisation?',
    coaching_note: 'Surface avoidance of uncomfortable conversations, unclear accountability culture.',
  },

  // ── SYSTEMS & PROCESSES ────────────────────────────────────────────────────
  {
    id: 'rp_sp_01',
    dimension_id: 'systems_processes',
    week_pattern: 3,
    framework: 'People · Systems · Structure — Systems pillar',
    prompt:
      'What is the one process in your organisation that depends most on you personally? What would happen if you were unavailable for two weeks?',
    coaching_note: 'Identify founder dependence, systems that exist only in the leader\'s head, bottlenecks.',
  },
  {
    id: 'rp_sp_02',
    dimension_id: 'systems_processes',
    week_pattern: 8,
    framework: 'Blackbelt Delivery Framework — Systems & Processes',
    prompt:
      'What recurring problem surfaced in your organisation this week? Has it happened before? If yes, what does that tell you about your systems?',
    coaching_note: 'Look for repeated failure patterns, absence of root-cause thinking, fire-fighting culture.',
  },

  // ── STRUCTURAL CLARITY ────────────────────────────────────────────────────
  {
    id: 'rp_sc_01',
    dimension_id: 'structural_clarity',
    week_pattern: 4,
    framework: 'People · Systems · Structure — Structure pillar',
    prompt:
      'What is the one structural change your organisation most needs that you have been putting off? What is the real reason it has not happened?',
    coaching_note: 'Surface fear of disruption, comfort with known dysfunction, avoidance of difficult restructuring conversations.',
  },
  {
    id: 'rp_sc_02',
    dimension_id: 'structural_clarity',
    week_pattern: 9,
    framework: 'Blackbelt OS — Structure & Organisation domain',
    prompt:
      'Look at your revenue this week. How much of it came from a deliberate system versus a relationship or a one-off effort? What does that ratio tell you?',
    coaching_note: 'Test for structural revenue vs relational revenue. Surface scale-readiness gaps.',
  },

  // ── LEADERSHIP MASTERY ────────────────────────────────────────────────────
  {
    id: 'rp_lm_01',
    dimension_id: 'leadership_mastery',
    week_pattern: 5,
    framework: 'The Clarity Mandate — Leadership & Governance domain',
    prompt:
      'Where did you act like the leader you aspire to be this week? Where did you fall short? What was the difference between those two moments?',
    coaching_note: 'Watch for self-awareness, the gap between leadership identity and behaviour, triggers for regression.',
  },
  {
    id: 'rp_lm_02',
    dimension_id: 'leadership_mastery',
    week_pattern: 10,
    framework: 'The Clarity Mandate — Self-Mastery',
    prompt:
      'How did you manage your energy and clarity this week? Name one moment where your state of mind directly affected a decision or interaction.',
    coaching_note: 'Surface self-management patterns, depletion leading to reactive decisions, leadership under pressure.',
  },

  // ── CROSS-DIMENSION (weeks 11–12) ─────────────────────────────────────────
  {
    id: 'rp_cross_01',
    dimension_id: 'strategic_direction',
    week_pattern: 11,
    framework: 'Blackbelt Delivery Framework — Discover → Define',
    prompt:
      'You are approaching the end of your first programme cycle. Looking back 10 weeks: what changed in how you lead? What stayed the same that should have changed?',
    coaching_note: 'Assess depth of learning, resistance to change, areas of genuine growth vs surface compliance.',
  },
  {
    id: 'rp_cross_02',
    dimension_id: 'leadership_mastery',
    week_pattern: 12,
    framework: 'Blackbelt OS — Full Diagnostic',
    prompt:
      'If you described the organisation you are building to your best self from five years ago, what would surprise them most — and what would disappoint them?',
    coaching_note: 'Deep aspirational alignment check. Surface the gap between vision and current reality. Strong emotional resonance expected.',
  },
];

/**
 * Returns the prompt for a given learner's week number and primary gap dimension.
 * Falls back to leadership_mastery if no dimension-specific prompt found for the week.
 */
export function getPromptForWeek(
  weekNumber: number,
  primaryGap: DimensionId
): ReflectionPrompt {
  const cycleWeek = ((weekNumber - 1) % 12) + 1;

  // Find dimension-specific prompt first
  const dimensionPrompt = REFLECTION_PROMPTS.find(
    (p) => p.week_pattern === cycleWeek && p.dimension_id === primaryGap
  );
  if (dimensionPrompt) return dimensionPrompt;

  // Fall back to any prompt for this week
  const weekPrompt = REFLECTION_PROMPTS.find((p) => p.week_pattern === cycleWeek);
  if (weekPrompt) return weekPrompt;

  // Final fallback
  return REFLECTION_PROMPTS[REFLECTION_PROMPTS.length - 1];
}
