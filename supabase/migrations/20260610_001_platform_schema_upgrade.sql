-- ─────────────────────────────────────────────────────────────────────────────
-- AscendMentor AI — Migration 001: Platform Schema Upgrade
-- Upgrades existing tables + creates 6 new tables for the full platform
-- Supabase project: BlackbeltCEO-Forms (stsivuxfndxnkkgbwuzs)
-- ─────────────────────────────────────────────────────────────────────────────

-- ── PART 1: Upgrade existing learners table ──────────────────────────────────
-- Existing cols: id, application_id, first_name, last_name, email, business_stage, status, created_at
-- Adding: user_id (auth link), full profile fields, subscription, onboarding flags

ALTER TABLE public.learners
  ADD COLUMN IF NOT EXISTS user_id           UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS full_name         TEXT,
  ADD COLUMN IF NOT EXISTS organisation_name TEXT,
  ADD COLUMN IF NOT EXISTS role_title        TEXT,
  ADD COLUMN IF NOT EXISTS organisation_size TEXT,
  ADD COLUMN IF NOT EXISTS years_running     TEXT,
  ADD COLUMN IF NOT EXISTS phone_number      TEXT,
  ADD COLUMN IF NOT EXISTS initial_challenge TEXT,
  ADD COLUMN IF NOT EXISTS past_coaching     BOOLEAN    NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS past_coaching_outcome TEXT,
  ADD COLUMN IF NOT EXISTS success_criteria  TEXT,
  ADD COLUMN IF NOT EXISTS onboarding_complete BOOLEAN  NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS assessment_complete BOOLEAN  NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS subscription_tier TEXT       NOT NULL DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS subscription_status TEXT     NOT NULL DEFAULT 'inactive',
  ADD COLUMN IF NOT EXISTS avatar_url        TEXT,
  ADD COLUMN IF NOT EXISTS beta_tier         TEXT;
  -- beta_tier: '1_bgc_orbit' | '2_network_referral' | '3_linkedin_cold' | '4_diaspora'

-- Back-fill full_name from first_name + last_name where missing
UPDATE public.learners
   SET full_name = TRIM(COALESCE(first_name, '') || ' ' || COALESCE(last_name, ''))
 WHERE full_name IS NULL AND (first_name IS NOT NULL OR last_name IS NOT NULL);

-- ── PART 2: Upgrade existing coaching_sessions table ─────────────────────────
-- Existing cols: id, learner_id, focus, started_at, ended_at
-- Adding: user_id, session_type, title, message_count, quality_score, dimension_focus, bdf_phase, summary

ALTER TABLE public.coaching_sessions
  ADD COLUMN IF NOT EXISTS user_id         UUID      REFERENCES auth.users(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS session_type    TEXT      NOT NULL DEFAULT 'coaching',
  ADD COLUMN IF NOT EXISTS title           TEXT,
  ADD COLUMN IF NOT EXISTS message_count   INTEGER   NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS quality_score   NUMERIC(5,2),
  ADD COLUMN IF NOT EXISTS dimension_focus TEXT,
  ADD COLUMN IF NOT EXISTS bdf_phase       TEXT,
  ADD COLUMN IF NOT EXISTS summary         TEXT;

-- ── PART 3: Upgrade existing session_messages table ──────────────────────────
-- Existing cols: id, session_id, role, content, created_at
-- Adding: framework_citations[]

ALTER TABLE public.session_messages
  ADD COLUMN IF NOT EXISTS framework_citations TEXT[] NOT NULL DEFAULT '{}';

-- ── PART 4: Create clarity_assessments table ─────────────────────────────────
-- Stores the complete Clarity Assessment™ result for each user
-- 5 dimensions: SD (max 24), PC (max 20), SP (max 20), SC (max 20), LM (max 20) = 104 raw max

CREATE TABLE IF NOT EXISTS public.clarity_assessments (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  learner_id   UUID        REFERENCES public.learners(id) ON DELETE SET NULL,

  -- Raw dimension scores
  strategic_direction_score  INTEGER NOT NULL DEFAULT 0 CHECK (strategic_direction_score  BETWEEN 0 AND 24),
  people_clarity_score       INTEGER NOT NULL DEFAULT 0 CHECK (people_clarity_score       BETWEEN 0 AND 20),
  systems_processes_score    INTEGER NOT NULL DEFAULT 0 CHECK (systems_processes_score    BETWEEN 0 AND 20),
  structural_clarity_score   INTEGER NOT NULL DEFAULT 0 CHECK (structural_clarity_score   BETWEEN 0 AND 20),
  leadership_mastery_score   INTEGER NOT NULL DEFAULT 0 CHECK (leadership_mastery_score   BETWEEN 0 AND 20),

  -- Dimension percentage scores (0-100, 2dp)
  strategic_direction_pct  NUMERIC(5,2) NOT NULL DEFAULT 0,
  people_clarity_pct       NUMERIC(5,2) NOT NULL DEFAULT 0,
  systems_processes_pct    NUMERIC(5,2) NOT NULL DEFAULT 0,
  structural_clarity_pct   NUMERIC(5,2) NOT NULL DEFAULT 0,
  leadership_mastery_pct   NUMERIC(5,2) NOT NULL DEFAULT 0,
  overall_pct              NUMERIC(5,2) NOT NULL DEFAULT 0,

  -- Belt tier and metadata
  belt_tier        TEXT      NOT NULL DEFAULT 'seeker',
  raw_answers      JSONB     NOT NULL DEFAULT '[]',
  assessment_round INTEGER   NOT NULL DEFAULT 1,

  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.clarity_assessments IS
  'BGC Clarity Assessment™ — 30Q, 5 dimensions, scored 0-4 each. '
  'SD: 6Q/24pts, PC/SP/SC/LM: 5Q/20pts each. Total raw max: 104.';

-- ── PART 5: Create mastery_scores table ──────────────────────────────────────
-- Full Mastery Score™ breakdown per the formula:
-- MS = (CA×0.30) + (BE×0.25) + (LP×0.20) + (AI×0.15) + (PS×0.10)

CREATE TABLE IF NOT EXISTS public.mastery_scores (
  id           UUID  PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID  NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  learner_id   UUID  REFERENCES public.learners(id) ON DELETE SET NULL,

  -- Component scores, each 0-100
  ca_score  NUMERIC(5,2) NOT NULL DEFAULT 0,   -- Clarity Assessment  (30%)
  be_score  NUMERIC(5,2) NOT NULL DEFAULT 0,   -- Behavioural Evidence (25%)
  lp_score  NUMERIC(5,2) NOT NULL DEFAULT 0,   -- Learning Path        (20%)
  ai_score  NUMERIC(5,2) NOT NULL DEFAULT 0,   -- AI Session Quality   (15%)
  ps_score  NUMERIC(5,2) NOT NULL DEFAULT 0,   -- Peer Validation      (10%)

  total_score           NUMERIC(5,2) NOT NULL DEFAULT 0,
  belt_tier             TEXT         NOT NULL DEFAULT 'seeker',
  current_streak_weeks  INTEGER      NOT NULL DEFAULT 0,
  score_velocity        NUMERIC(5,2) NOT NULL DEFAULT 0,  -- change vs prior snapshot

  snapshot_date DATE        NOT NULL DEFAULT CURRENT_DATE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.mastery_scores IS
  'Mastery Score™ snapshots. Computed at Day 30/60/90 during beta, then quarterly. '
  'Formula: (CA×0.30) + (BE×0.25) + (LP×0.20) + (AI×0.15) + (PS×0.10).';

-- ── PART 6: Create behavioural_evidence table ─────────────────────────────────
-- Weekly BGC framework application logs — the BE component of Mastery Score

CREATE TABLE IF NOT EXISTS public.behavioural_evidence (
  id           UUID  PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID  NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  learner_id   UUID  REFERENCES public.learners(id) ON DELETE SET NULL,

  week_number          INTEGER NOT NULL,  -- sequential week in programme (1-based)
  framework_applied    TEXT    NOT NULL,  -- which BGC framework was applied
  dimension_id         TEXT    NOT NULL,  -- which of the 5 dimensions
  situation_described  TEXT    NOT NULL,  -- STAR: Situation
  action_taken         TEXT    NOT NULL,  -- STAR: Action (framework applied)
  outcome              TEXT,             -- STAR: Result (optional at submission)

  -- AI-scored after submission
  ai_quality_score  NUMERIC(5,2),  -- 0-100, scored by Claude
  ai_feedback       TEXT,           -- Claude's coaching feedback on the submission

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.behavioural_evidence IS
  'Weekly "Apply a BGC framework to a real decision" logs. '
  'Scored by Claude AI. Powers the BE (25%) component of Mastery Score.';

-- ── PART 7: Create peer_validations table ─────────────────────────────────────
-- 360-style peer inputs — the PS component (10%) of Mastery Score

CREATE TABLE IF NOT EXISTS public.peer_validations (
  id           UUID  PRIMARY KEY DEFAULT gen_random_uuid(),
  learner_id   UUID  NOT NULL REFERENCES public.learners(id) ON DELETE CASCADE,

  validator_name          TEXT    NOT NULL,
  validator_relationship  TEXT    NOT NULL,  -- team_member | direct_report | peer | manager
  dimension_scores        JSONB   NOT NULL DEFAULT '{}',  -- {dimension_id: score (0-4)}
  overall_observation     TEXT,

  -- Token-authenticated completion link (sent to validator)
  token        TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  completed_at TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.peer_validations IS
  'Peer/stakeholder 360 inputs. Validators receive a token link to submit scores. '
  'Powers the PS (10%) component of Mastery Score when completed.';

-- ── PART 8: Create weekly_streaks table ───────────────────────────────────────
-- Tracks weekly engagement for streak mechanics and BE score denominator

CREATE TABLE IF NOT EXISTS public.weekly_streaks (
  id           UUID  PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID  NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  learner_id   UUID  REFERENCES public.learners(id) ON DELETE SET NULL,

  week_start     DATE    NOT NULL,
  activity_type  TEXT    NOT NULL DEFAULT 'reflection',
  -- types: reflection | coaching_session | assessment
  completed      BOOLEAN NOT NULL DEFAULT FALSE,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (user_id, week_start, activity_type)
);

COMMENT ON TABLE public.weekly_streaks IS
  'One row per user per week per activity type. '
  'Streak = consecutive weeks with completed=true. 4+ week streak unlocks score multiplier.';

-- ── PART 9: Create wa_sessions table ─────────────────────────────────────────
-- WhatsApp session state machine — full state for each WhatsApp user

CREATE TABLE IF NOT EXISTS public.wa_sessions (
  id               UUID  PRIMARY KEY DEFAULT gen_random_uuid(),
  wa_phone_number  TEXT  NOT NULL UNIQUE,
  user_id          UUID  REFERENCES auth.users(id) ON DELETE SET NULL,
  learner_id       UUID  REFERENCES public.learners(id) ON DELETE SET NULL,

  -- State machine
  session_state  TEXT  NOT NULL DEFAULT 'onboarding',
  -- states: onboarding | assessment | coaching | reflection | completed

  -- Conversation & assessment state
  conversation_history      JSONB    NOT NULL DEFAULT '[]',
  clarity_scores            JSONB    NOT NULL DEFAULT '{}',
  mastery_score             NUMERIC(5,2) NOT NULL DEFAULT 0,
  current_dimension         TEXT,
  assessment_answers        JSONB    NOT NULL DEFAULT '[]',
  assessment_question_index INTEGER  NOT NULL DEFAULT 0,

  -- Engagement
  streak_count    INTEGER  NOT NULL DEFAULT 0,
  last_menu_open  BOOLEAN  NOT NULL DEFAULT FALSE,

  last_active_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.wa_sessions IS
  'WhatsApp Business API session state. One row per WA phone number. '
  'Managed exclusively by the webhook handler via service role. No user auth required.';

-- ── PART 10: Indexes ─────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_learners_user_id
  ON public.learners(user_id);

CREATE UNIQUE INDEX IF NOT EXISTS idx_learners_user_id_unique
  ON public.learners(user_id)
  WHERE user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_clarity_assessments_user_id
  ON public.clarity_assessments(user_id);

CREATE INDEX IF NOT EXISTS idx_clarity_assessments_completed_at
  ON public.clarity_assessments(user_id, completed_at DESC);

CREATE INDEX IF NOT EXISTS idx_mastery_scores_user_id
  ON public.mastery_scores(user_id);

CREATE INDEX IF NOT EXISTS idx_mastery_scores_snapshot_date
  ON public.mastery_scores(user_id, snapshot_date DESC);

CREATE INDEX IF NOT EXISTS idx_coaching_sessions_user_id
  ON public.coaching_sessions(user_id);

CREATE INDEX IF NOT EXISTS idx_behavioural_evidence_user_id
  ON public.behavioural_evidence(user_id);

CREATE INDEX IF NOT EXISTS idx_behavioural_evidence_week
  ON public.behavioural_evidence(user_id, week_number);

CREATE INDEX IF NOT EXISTS idx_peer_validations_learner
  ON public.peer_validations(learner_id);

CREATE INDEX IF NOT EXISTS idx_peer_validations_token
  ON public.peer_validations(token);

CREATE INDEX IF NOT EXISTS idx_weekly_streaks_user
  ON public.weekly_streaks(user_id, week_start);

CREATE INDEX IF NOT EXISTS idx_wa_sessions_phone
  ON public.wa_sessions(wa_phone_number);

CREATE INDEX IF NOT EXISTS idx_wa_sessions_active
  ON public.wa_sessions(session_state, last_active_at DESC);
