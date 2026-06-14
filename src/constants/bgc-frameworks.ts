// ─────────────────────────────────────────────────────────────────────────────
// BGC Framework Constants
// Blackbelt Global Consulting Limited — Dr. Valentino Heavens
// "The Art of mastering your world begins with the art of Self Mastery"
// ─────────────────────────────────────────────────────────────────────────────

export const BGC_DIMENSIONS = [
  {
    id: 'strategic_direction',
    name: 'Strategic Direction',
    framework: 'Blackbelt OS — Strategy & Direction domain',
    pillar: 'structure' as const,
    blackbelt_os_domain: 'strategy_direction',
    description: 'Clarity of purpose, goals, priorities, and where the organisation is headed',
    color: '#2563EB',
    weight: 0.20,
    question_count: 6,
    max_score: 24,
  },
  {
    id: 'people_clarity',
    name: 'People Clarity',
    framework: 'People · Systems · Structure — People pillar',
    pillar: 'people' as const,
    blackbelt_os_domain: 'people_culture',
    description: 'Role clarity, accountability, talent architecture, and leadership alignment',
    color: '#059669',
    weight: 0.20,
    question_count: 5,
    max_score: 20,
  },
  {
    id: 'systems_processes',
    name: 'Systems & Processes',
    framework: 'People · Systems · Structure — Systems pillar + Blackbelt OS',
    pillar: 'systems' as const,
    blackbelt_os_domain: 'systems_processes',
    description: 'Operational infrastructure, workflows, SOPs, and execution capacity',
    color: '#7C3AED',
    weight: 0.20,
    question_count: 5,
    max_score: 20,
  },
  {
    id: 'structural_clarity',
    name: 'Structural Clarity',
    framework: 'People · Systems · Structure — Structure pillar',
    pillar: 'structure' as const,
    blackbelt_os_domain: 'structure_organisation',
    description: 'Organisational design, reporting architecture, governance, and growth infrastructure',
    color: '#DC2626',
    weight: 0.20,
    question_count: 5,
    max_score: 20,
  },
  {
    id: 'leadership_mastery',
    name: 'Leadership Mastery',
    framework: 'The Clarity Mandate + Blackbelt OS — Leadership & Governance domain',
    pillar: 'leadership' as const,
    blackbelt_os_domain: 'leadership_governance',
    description: 'Personal leadership clarity, self-mastery, executive presence, and impact capacity',
    color: '#F59E0B',
    weight: 0.20,
    question_count: 5,
    max_score: 20,
  },
] as const;

export type DimensionId = typeof BGC_DIMENSIONS[number]['id'];

export const MASTERY_BELTS = [
  {
    min: 80,
    max: 100,
    id: 'black_belt' as const,
    name: 'Black Belt',
    subtitle: 'Mastery Engineered',
    color: '#B8960C',
    bg: 'bg-yellow-900/20',
    border: 'border-yellow-600/40',
    text: 'text-yellow-400',
  },
  {
    min: 60,
    max: 79,
    id: 'blue_belt' as const,
    name: 'Blue Belt',
    subtitle: 'Clarity Champion',
    color: '#1D4ED8',
    bg: 'bg-blue-900/20',
    border: 'border-blue-600/40',
    text: 'text-blue-400',
  },
  {
    min: 40,
    max: 59,
    id: 'green_belt' as const,
    name: 'Green Belt',
    subtitle: 'Clarity Practitioner',
    color: '#059669',
    bg: 'bg-emerald-900/20',
    border: 'border-emerald-600/40',
    text: 'text-emerald-400',
  },
  {
    min: 20,
    max: 39,
    id: 'yellow_belt' as const,
    name: 'Yellow Belt',
    subtitle: 'Clarity Builder',
    color: '#D97706',
    bg: 'bg-amber-900/20',
    border: 'border-amber-600/40',
    text: 'text-amber-400',
  },
  {
    min: 0,
    max: 19,
    id: 'seeker' as const,
    name: 'Clarity Seeker',
    subtitle: 'Journey Beginning',
    color: '#6B7280',
    bg: 'bg-gray-900/20',
    border: 'border-gray-600/40',
    text: 'text-gray-400',
  },
] as const;

export type BeltId = typeof MASTERY_BELTS[number]['id'];

export function getBeltForScore(score: number) {
  return MASTERY_BELTS.find((b) => score >= b.min && score <= b.max) ?? MASTERY_BELTS[4];
}

export const MASTERY_SCORE_WEIGHTS = {
  clarity_assessment: 0.30,   // CA — reassessed every 90 days
  behavioural_evidence: 0.25, // BE — weekly framework application logs
  learning_path: 0.20,        // LP — completion depth, not just count
  ai_session_quality: 0.15,   // AI — sophistication of coaching engagement
  peer_validation: 0.10,      // PS — optional 360-style peer inputs
} as const;

export const BLACKBELT_OS_DOMAINS = [
  { id: 'leadership_governance', name: 'Leadership & Governance' },
  { id: 'people_culture', name: 'People & Culture' },
  { id: 'strategy_direction', name: 'Strategy & Direction' },
  { id: 'systems_processes', name: 'Systems & Processes' },
  { id: 'structure_organisation', name: 'Structure & Organisation' },
  { id: 'growth_sustainability', name: 'Growth & Sustainability' },
] as const;

export const BDF_PHASES = [
  { id: 'discover', name: 'Discover', order: 1 },
  { id: 'define', name: 'Define', order: 2 },
  { id: 'design', name: 'Design', order: 3 },
  { id: 'deploy', name: 'Deploy', order: 4 },
  { id: 'deliver', name: 'Deliver', order: 5 },
] as const;

export const CLARITY_LABELS = [
  { min: 75, label: 'High Clarity', color: '#059669' },
  { min: 55, label: 'Emerging Clarity', color: '#B8960C' },
  { min: 35, label: 'Partial Clarity', color: '#DC6803' },
  { min: 0,  label: 'Critical Clarity Gap', color: '#DC2626' },
] as const;

export function getClarityLabel(pct: number) {
  return CLARITY_LABELS.find((l) => pct >= l.min) ?? CLARITY_LABELS[3];
}

export const GAP_INSIGHTS: Record<string, string> = {
  strategic_direction:
    'Your strategic direction lacks the clarity needed to align your team and make consistent decisions. This is the root cause of most execution challenges in your organisation.',
  people_clarity:
    'Your people clarity gaps are creating execution friction. Role ambiguity, accountability gaps, or talent mismatches are likely limiting your organisation\'s performance ceiling.',
  systems_processes:
    'Your operational systems are a bottleneck. Over-dependence on key individuals, inconsistent quality, or underdeveloped processes are constraining your ability to scale.',
  structural_clarity:
    'Your structural gaps are limiting growth. Governance, decision architecture, or revenue model design need deliberate attention to unlock the next level.',
  leadership_mastery:
    'Your personal leadership clarity is the most urgent development zone. Self-mastery and intentional leadership practice are foundational to everything else.',
};
