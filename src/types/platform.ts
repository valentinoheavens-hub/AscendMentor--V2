// ─────────────────────────────────────────────────────────────────────────────
// ClarityOS — Platform TypeScript Types
// ─────────────────────────────────────────────────────────────────────────────

export type BeltTier =
  | 'seeker'
  | 'yellow_belt'
  | 'green_belt'
  | 'blue_belt'
  | 'black_belt';

export type DimensionId =
  | 'strategic_direction'
  | 'people_clarity'
  | 'systems_processes'
  | 'structural_clarity'
  | 'leadership_mastery';

export type SessionType = 'coaching' | 'reflection' | 'assessment_debrief';
export type SessionState = 'onboarding' | 'assessment' | 'coaching' | 'reflection' | 'completed';
export type Pillar = 'people' | 'systems' | 'structure' | 'leadership';
export type SubscriptionTier = 'free' | 'beta_90' | 'individual' | 'professional' | 'enterprise';
export type SubscriptionStatus = 'active' | 'inactive' | 'trial' | 'cancelled';
export type ValidatorRelationship = 'team_member' | 'direct_report' | 'peer' | 'manager';

// ── Clarity Assessment ───────────────────────────────────────────────────────

export interface AssessmentAnswer {
  question_id: string;
  score: number;
  option_text: string;
}

export interface ClarityProfile {
  strategic_direction_pct: number;
  people_clarity_pct: number;
  systems_processes_pct: number;
  structural_clarity_pct: number;
  leadership_mastery_pct: number;
  overall_pct: number;
  belt_tier: BeltTier;
  primary_gap: DimensionId;
  primary_strength: DimensionId;
  assessment_round: number;
  completed_at: string;
}

export interface ClarityAssessmentRecord {
  id: string;
  user_id: string;
  learner_id: string | null;
  strategic_direction_score: number;
  people_clarity_score: number;
  systems_processes_score: number;
  structural_clarity_score: number;
  leadership_mastery_score: number;
  strategic_direction_pct: number;
  people_clarity_pct: number;
  systems_processes_pct: number;
  structural_clarity_pct: number;
  leadership_mastery_pct: number;
  overall_pct: number;
  belt_tier: BeltTier;
  raw_answers: AssessmentAnswer[];
  assessment_round: number;
  completed_at: string;
  created_at: string;
}

// ── Mastery Score ────────────────────────────────────────────────────────────

export interface MasteryScoreBreakdown {
  total_score: number;
  belt_tier: BeltTier;
  ca_score: number;   // Clarity Assessment (30%)
  be_score: number;   // Behavioural Evidence (25%)
  lp_score: number;   // Learning Path (20%)
  ai_score: number;   // AI Session Quality (15%)
  ps_score: number;   // Peer Validation (10%)
  current_streak_weeks: number;
  score_velocity: number; // change vs previous snapshot
  snapshot_date: string;
}

// ── Learner ──────────────────────────────────────────────────────────────────

export interface LearnerProfile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  organisation_name: string;
  role_title: string;
  organisation_size: '1-5' | '6-20' | '21-100' | '100+';
  years_running: string;
  country: string;
  phone_number: string | null;
  initial_challenge: string | null;
  past_coaching: boolean | null;
  past_coaching_outcome: string | null;
  success_criteria: string | null;
  onboarding_complete: boolean;
  assessment_complete: boolean;
  subscription_tier: SubscriptionTier;
  subscription_status: SubscriptionStatus;
  avatar_url: string | null;
  created_at: string;
}

// ── Coaching Session ─────────────────────────────────────────────────────────

export interface SessionMessage {
  id: string;
  session_id: string;
  role: 'user' | 'assistant';
  content: string;
  framework_citations: string[];
  created_at: string;
}

export interface CoachingSession {
  id: string;
  user_id: string;
  learner_id: string;
  session_type: SessionType;
  title: string | null;
  message_count: number;
  quality_score: number | null;
  dimension_focus: DimensionId | null;
  bdf_phase: string | null;
  summary: string | null;
  started_at: string;
  ended_at: string | null;
  messages?: SessionMessage[];
}

// ── Behavioural Evidence ─────────────────────────────────────────────────────

export interface BehaviouralEvidence {
  id: string;
  user_id: string;
  learner_id: string;
  week_number: number;
  framework_applied: string;
  dimension_id: DimensionId;
  situation_described: string;
  action_taken: string;
  outcome: string | null;
  ai_quality_score: number | null;
  ai_feedback: string | null;
  created_at: string;
}

// ── Peer Validation ──────────────────────────────────────────────────────────

export interface PeerValidation {
  id: string;
  learner_id: string;
  validator_name: string;
  validator_relationship: ValidatorRelationship;
  dimension_scores: Record<DimensionId, number>;
  overall_observation: string | null;
  token: string;
  completed_at: string | null;
  created_at: string;
}

// ── WhatsApp Session ─────────────────────────────────────────────────────────

export interface WASession {
  id: string;
  wa_phone_number: string;
  user_id: string | null;
  learner_id: string | null;
  session_state: SessionState;
  conversation_history: WAMessage[];
  clarity_scores: Partial<Record<DimensionId, number>>;
  mastery_score: number;
  current_dimension: DimensionId | null;
  assessment_answers: AssessmentAnswer[];
  assessment_question_index: number;
  streak_count: number;
  last_menu_open: boolean;
  last_active_at: string;
  created_at: string;
}

export interface WAMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

// ── Weekly Streak ────────────────────────────────────────────────────────────

export interface WeeklyStreak {
  id: string;
  user_id: string;
  week_start: string;
  activity_type: 'reflection' | 'coaching_session' | 'assessment';
  completed: boolean;
  created_at: string;
}

// ── Onboarding ───────────────────────────────────────────────────────────────

export interface OnboardingData {
  full_name: string;
  organisation_name: string;
  role_title: string;
  organisation_size: '1-5' | '6-20' | '21-100' | '100+';
  years_running: string;
  country: string;
  phone_number: string;
  initial_challenge: string;
  past_coaching: boolean;
  past_coaching_outcome: string;
  success_criteria: string;
}

// ── API Responses ────────────────────────────────────────────────────────────

export interface AssessmentSubmitResponse {
  success: boolean;
  clarity_profile: ClarityProfile;
  mastery_score: MasteryScoreBreakdown;
  assessment_id: string;
}

export interface MasteryScoreResponse {
  success: boolean;
  data: MasteryScoreBreakdown;
}
