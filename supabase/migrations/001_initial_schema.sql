-- ─────────────────────────────────────────────────────────────────────────────
-- AscendMentor AI — Full Schema Migration
-- Project: jlfwhlnxnwvwjaekdisx
-- Run this in: Supabase Dashboard → SQL Editor
-- ─────────────────────────────────────────────────────────────────────────────

-- ── Extensions ───────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── Standalone tables ─────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.admins (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.coaching_applications (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name      TEXT NOT NULL,
  last_name       TEXT NOT NULL,
  email           TEXT NOT NULL,
  phone           TEXT,
  designation     TEXT,
  company_name    TEXT,
  country         TEXT,
  business_stage  TEXT,
  main_challenge  TEXT,
  coaching_goal   TEXT,
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.clinic_signups (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name  TEXT NOT NULL,
  last_name   TEXT NOT NULL,
  email       TEXT NOT NULL,
  phone       TEXT,
  designation TEXT,
  country     TEXT,
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.contact_messages (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name  TEXT NOT NULL,
  last_name   TEXT NOT NULL,
  email       TEXT NOT NULL,
  phone       TEXT,
  designation TEXT,
  country     TEXT,
  subject     TEXT,
  message     TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.membership_applications (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name          TEXT NOT NULL,
  last_name           TEXT NOT NULL,
  email               TEXT NOT NULL,
  phone               TEXT,
  designation         TEXT,
  role                TEXT,
  organisation        TEXT,
  country             TEXT,
  membership_type     TEXT NOT NULL,
  reason_for_joining  TEXT,
  short_bio           TEXT,
  linkedin_url        TEXT,
  payment_ref         TEXT,
  status              TEXT DEFAULT 'pending',
  created_at          TIMESTAMPTZ DEFAULT now()
);

-- ── Learners (core profile) ───────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.learners (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  application_id        UUID REFERENCES public.coaching_applications(id) ON DELETE SET NULL,
  email                 TEXT NOT NULL,
  first_name            TEXT NOT NULL,
  last_name             TEXT,
  full_name             TEXT,
  avatar_url            TEXT,
  phone_number          TEXT,
  role_title            TEXT,
  organisation_name     TEXT,
  organisation_size     TEXT,
  business_stage        TEXT,
  country               TEXT,
  years_running         TEXT,
  initial_challenge     TEXT,
  success_criteria      TEXT,
  past_coaching         BOOLEAN NOT NULL DEFAULT false,
  past_coaching_outcome TEXT,
  onboarding_complete   BOOLEAN NOT NULL DEFAULT false,
  assessment_complete   BOOLEAN NOT NULL DEFAULT false,
  subscription_tier     TEXT NOT NULL DEFAULT 'free',
  subscription_status   TEXT NOT NULL DEFAULT 'inactive',
  beta_tier             TEXT,
  status                TEXT DEFAULT 'active',
  created_at            TIMESTAMPTZ DEFAULT now()
);

-- ── Clarity Assessment ────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.clarity_assessments (
  id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  learner_id                  UUID REFERENCES public.learners(id) ON DELETE SET NULL,
  assessment_round            INT NOT NULL DEFAULT 1,
  leadership_mastery_score    NUMERIC NOT NULL DEFAULT 0,
  leadership_mastery_pct      NUMERIC NOT NULL DEFAULT 0,
  people_clarity_score        NUMERIC NOT NULL DEFAULT 0,
  people_clarity_pct          NUMERIC NOT NULL DEFAULT 0,
  strategic_direction_score   NUMERIC NOT NULL DEFAULT 0,
  strategic_direction_pct     NUMERIC NOT NULL DEFAULT 0,
  structural_clarity_score    NUMERIC NOT NULL DEFAULT 0,
  structural_clarity_pct      NUMERIC NOT NULL DEFAULT 0,
  systems_processes_score     NUMERIC NOT NULL DEFAULT 0,
  systems_processes_pct       NUMERIC NOT NULL DEFAULT 0,
  overall_pct                 NUMERIC NOT NULL DEFAULT 0,
  belt_tier                   TEXT NOT NULL DEFAULT 'seeker',
  raw_answers                 JSONB NOT NULL DEFAULT '{}',
  completed_at                TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at                  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Behavioural Evidence ──────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.behavioural_evidence (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  learner_id           UUID REFERENCES public.learners(id) ON DELETE SET NULL,
  dimension_id         TEXT NOT NULL,
  week_number          INT NOT NULL,
  situation_described  TEXT NOT NULL,
  action_taken         TEXT NOT NULL,
  framework_applied    TEXT NOT NULL,
  outcome              TEXT,
  ai_feedback          TEXT,
  ai_quality_score     NUMERIC,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Coaching Sessions ─────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.coaching_sessions (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  learner_id       UUID NOT NULL REFERENCES public.learners(id) ON DELETE CASCADE,
  session_type     TEXT NOT NULL DEFAULT 'bgc_coach',
  title            TEXT,
  focus            TEXT,
  dimension_focus  TEXT,
  bdf_phase        TEXT,
  message_count    INT NOT NULL DEFAULT 0,
  quality_score    NUMERIC,
  summary          TEXT,
  started_at       TIMESTAMPTZ DEFAULT now(),
  ended_at         TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.session_messages (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id          UUID NOT NULL REFERENCES public.coaching_sessions(id) ON DELETE CASCADE,
  role                TEXT NOT NULL,
  content             TEXT NOT NULL,
  framework_citations TEXT[] NOT NULL DEFAULT '{}',
  created_at          TIMESTAMPTZ DEFAULT now()
);

-- ── Learning Paths ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.learning_paths (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  learner_id  UUID NOT NULL REFERENCES public.learners(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  os_domain   TEXT,
  status      TEXT DEFAULT 'active',
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.path_modules (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  path_id     UUID NOT NULL REFERENCES public.learning_paths(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  pillar      TEXT,
  sequence    INT,
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.module_completions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  learner_id   UUID NOT NULL REFERENCES public.learners(id) ON DELETE CASCADE,
  module_id    UUID NOT NULL REFERENCES public.path_modules(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ DEFAULT now()
);

-- ── Mastery Scores ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.mastery_scores (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  learner_id            UUID REFERENCES public.learners(id) ON DELETE SET NULL,
  ca_score              NUMERIC NOT NULL DEFAULT 0,
  be_score              NUMERIC NOT NULL DEFAULT 0,
  lp_score              NUMERIC NOT NULL DEFAULT 0,
  ps_score              NUMERIC NOT NULL DEFAULT 0,
  ai_score              NUMERIC NOT NULL DEFAULT 0,
  total_score           NUMERIC NOT NULL DEFAULT 0,
  belt_tier             TEXT NOT NULL DEFAULT 'seeker',
  score_velocity        NUMERIC NOT NULL DEFAULT 0,
  current_streak_weeks  INT NOT NULL DEFAULT 0,
  snapshot_date         DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Peer Validations ──────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.peer_validations (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  learner_id             UUID NOT NULL REFERENCES public.learners(id) ON DELETE CASCADE,
  token                  TEXT NOT NULL DEFAULT encode(gen_random_bytes(16), 'hex'),
  validator_name         TEXT NOT NULL,
  validator_relationship TEXT NOT NULL,
  dimension_scores       JSONB NOT NULL DEFAULT '{}',
  overall_observation    TEXT,
  completed_at           TIMESTAMPTZ,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Progress Snapshots ────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.progress_snapshots (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  learner_id       UUID NOT NULL REFERENCES public.learners(id) ON DELETE CASCADE,
  people_score     NUMERIC,
  structure_score  NUMERIC,
  systems_score    NUMERIC,
  note             TEXT,
  created_at       TIMESTAMPTZ DEFAULT now()
);

-- ── Weekly Streaks ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.weekly_streaks (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  learner_id     UUID REFERENCES public.learners(id) ON DELETE SET NULL,
  week_start     DATE NOT NULL,
  activity_type  TEXT NOT NULL DEFAULT 'coaching',
  completed      BOOLEAN NOT NULL DEFAULT false,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── WhatsApp Sessions ─────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.wa_sessions (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                  UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  learner_id               UUID REFERENCES public.learners(id) ON DELETE SET NULL,
  wa_phone_number          TEXT NOT NULL UNIQUE,
  session_state            TEXT NOT NULL DEFAULT 'menu',
  mastery_score            NUMERIC NOT NULL DEFAULT 0,
  streak_count             INT NOT NULL DEFAULT 0,
  current_dimension        TEXT,
  assessment_question_index INT NOT NULL DEFAULT 0,
  assessment_answers       JSONB NOT NULL DEFAULT '{}',
  clarity_scores           JSONB NOT NULL DEFAULT '{}',
  conversation_history     JSONB NOT NULL DEFAULT '[]',
  last_menu_open           BOOLEAN NOT NULL DEFAULT false,
  last_active_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at               TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── is_admin() function ───────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admins
    WHERE user_id = auth.uid()
  );
END;
$$;

-- ── score_clarity_assessment() ────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.score_clarity_assessment(
  p_leadership_mastery_score  NUMERIC,
  p_people_clarity_score      NUMERIC,
  p_strategic_direction_score NUMERIC,
  p_structural_clarity_score  NUMERIC,
  p_systems_processes_score   NUMERIC
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_max_per_dim  NUMERIC := 30;
  v_max_total    NUMERIC := 150;
  v_total        NUMERIC;
  v_overall_pct  NUMERIC;
  v_belt_tier    TEXT;
BEGIN
  v_total := p_leadership_mastery_score + p_people_clarity_score +
             p_strategic_direction_score + p_structural_clarity_score +
             p_systems_processes_score;
  v_overall_pct := ROUND((v_total / v_max_total) * 100, 1);

  v_belt_tier := CASE
    WHEN v_overall_pct >= 85 THEN 'black'
    WHEN v_overall_pct >= 70 THEN 'blue'
    WHEN v_overall_pct >= 55 THEN 'green'
    WHEN v_overall_pct >= 40 THEN 'yellow'
    ELSE 'seeker'
  END;

  RETURN jsonb_build_object(
    'total_score',                v_total,
    'overall_pct',                v_overall_pct,
    'belt_tier',                  v_belt_tier,
    'leadership_mastery_pct',     ROUND((p_leadership_mastery_score / v_max_per_dim) * 100, 1),
    'people_clarity_pct',         ROUND((p_people_clarity_score / v_max_per_dim) * 100, 1),
    'strategic_direction_pct',    ROUND((p_strategic_direction_score / v_max_per_dim) * 100, 1),
    'structural_clarity_pct',     ROUND((p_structural_clarity_score / v_max_per_dim) * 100, 1),
    'systems_processes_pct',      ROUND((p_systems_processes_score / v_max_per_dim) * 100, 1)
  );
END;
$$;

-- ── compute_mastery_score() ───────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.compute_mastery_score(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_learner_id     UUID;
  v_ca_score       NUMERIC := 0;
  v_be_score       NUMERIC := 0;
  v_lp_score       NUMERIC := 0;
  v_ps_score       NUMERIC := 0;
  v_ai_score       NUMERIC := 0;
  v_total          NUMERIC := 0;
  v_belt_tier      TEXT := 'seeker';
BEGIN
  SELECT id INTO v_learner_id FROM public.learners WHERE user_id = p_user_id LIMIT 1;
  IF v_learner_id IS NULL THEN
    RETURN jsonb_build_object('total_score', 0, 'belt_tier', 'seeker');
  END IF;

  -- Clarity Assessment component (40% weight)
  SELECT COALESCE(MAX(overall_pct) * 0.4, 0) INTO v_ca_score
  FROM public.clarity_assessments WHERE user_id = p_user_id;

  -- Behavioural Evidence component (25% weight)
  SELECT LEAST(COUNT(*) * 2, 25) INTO v_be_score
  FROM public.behavioural_evidence WHERE user_id = p_user_id;

  -- Learning Progress component (15% weight)
  SELECT LEAST(COUNT(*) * 1.5, 15) INTO v_lp_score
  FROM public.module_completions WHERE learner_id = v_learner_id;

  -- Peer / Session component (20% weight)
  SELECT LEAST(COUNT(*) * 4, 20) INTO v_ps_score
  FROM public.coaching_sessions WHERE learner_id = v_learner_id;

  v_total := ROUND(v_ca_score + v_be_score + v_lp_score + v_ps_score + v_ai_score, 1);

  v_belt_tier := CASE
    WHEN v_total >= 85 THEN 'black'
    WHEN v_total >= 70 THEN 'blue'
    WHEN v_total >= 55 THEN 'green'
    WHEN v_total >= 40 THEN 'yellow'
    ELSE 'seeker'
  END;

  RETURN jsonb_build_object(
    'total_score',  v_total,
    'ca_score',     v_ca_score,
    'be_score',     v_be_score,
    'lp_score',     v_lp_score,
    'ps_score',     v_ps_score,
    'ai_score',     v_ai_score,
    'belt_tier',    v_belt_tier
  );
END;
$$;

-- ── get_learner_clarity_profile() ────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.get_learner_clarity_profile(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'latest_assessment', row_to_json(ca.*),
    'assessment_count',  COUNT(*) OVER ()
  )
  INTO v_result
  FROM public.clarity_assessments ca
  WHERE ca.user_id = p_user_id
  ORDER BY ca.completed_at DESC
  LIMIT 1;

  RETURN COALESCE(v_result, '{}'::JSONB);
END;
$$;

-- ── get_wa_session_context() ──────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.get_wa_session_context(p_phone TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result JSONB;
BEGIN
  SELECT row_to_json(ws.*) INTO v_result
  FROM public.wa_sessions ws
  WHERE ws.wa_phone_number = p_phone
  LIMIT 1;

  RETURN COALESCE(v_result, '{}'::JSONB);
END;
$$;

-- ── Enable Row Level Security ─────────────────────────────────────────────────

ALTER TABLE public.admins               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learners             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clarity_assessments  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.behavioural_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coaching_sessions    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_messages     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_paths       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.path_modules         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.module_completions   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mastery_scores       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.peer_validations     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress_snapshots   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_streaks       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wa_sessions          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coaching_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinic_signups       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.membership_applications ENABLE ROW LEVEL SECURITY;

-- ── RLS Policies: admins table ────────────────────────────────────────────────

CREATE POLICY "Admins can read admin list"
  ON public.admins FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Service role full access to admins"
  ON public.admins FOR ALL
  USING (auth.role() = 'service_role');

-- ── RLS Policies: learners ────────────────────────────────────────────────────

CREATE POLICY "Users can read own learner record"
  ON public.learners FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own learner record"
  ON public.learners FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Admins can read all learners"
  ON public.learners FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admins can update all learners"
  ON public.learners FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "Service role full access to learners"
  ON public.learners FOR ALL
  USING (auth.role() = 'service_role');

-- ── RLS Policies: clarity_assessments ────────────────────────────────────────

CREATE POLICY "Users own assessments"
  ON public.clarity_assessments FOR ALL
  USING (user_id = auth.uid());

CREATE POLICY "Admins read all assessments"
  ON public.clarity_assessments FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Service role full access to clarity_assessments"
  ON public.clarity_assessments FOR ALL
  USING (auth.role() = 'service_role');

-- ── RLS Policies: coaching_sessions ──────────────────────────────────────────

CREATE POLICY "Users own sessions"
  ON public.coaching_sessions FOR ALL
  USING (user_id = auth.uid());

CREATE POLICY "Admins read all sessions"
  ON public.coaching_sessions FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Service role full access to coaching_sessions"
  ON public.coaching_sessions FOR ALL
  USING (auth.role() = 'service_role');

-- ── RLS Policies: session_messages ───────────────────────────────────────────

CREATE POLICY "Users read own session messages"
  ON public.session_messages FOR SELECT
  USING (
    session_id IN (
      SELECT id FROM public.coaching_sessions WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users insert session messages"
  ON public.session_messages FOR INSERT
  WITH CHECK (
    session_id IN (
      SELECT id FROM public.coaching_sessions WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Service role full access to session_messages"
  ON public.session_messages FOR ALL
  USING (auth.role() = 'service_role');

-- ── RLS Policies: mastery_scores ─────────────────────────────────────────────

CREATE POLICY "Users own mastery scores"
  ON public.mastery_scores FOR ALL
  USING (user_id = auth.uid());

CREATE POLICY "Admins read all mastery scores"
  ON public.mastery_scores FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Service role full access to mastery_scores"
  ON public.mastery_scores FOR ALL
  USING (auth.role() = 'service_role');

-- ── RLS Policies: behavioural_evidence ───────────────────────────────────────

CREATE POLICY "Users own behavioural evidence"
  ON public.behavioural_evidence FOR ALL
  USING (user_id = auth.uid());

CREATE POLICY "Admins read all evidence"
  ON public.behavioural_evidence FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Service role full access to behavioural_evidence"
  ON public.behavioural_evidence FOR ALL
  USING (auth.role() = 'service_role');

-- ── RLS Policies: learning_paths / modules ────────────────────────────────────

CREATE POLICY "Users own learning paths"
  ON public.learning_paths FOR ALL
  USING (learner_id IN (SELECT id FROM public.learners WHERE user_id = auth.uid()));

CREATE POLICY "Service role full access to learning_paths"
  ON public.learning_paths FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Users read own path modules"
  ON public.path_modules FOR SELECT
  USING (
    path_id IN (
      SELECT id FROM public.learning_paths
      WHERE learner_id IN (SELECT id FROM public.learners WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Service role full access to path_modules"
  ON public.path_modules FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Users own module completions"
  ON public.module_completions FOR ALL
  USING (learner_id IN (SELECT id FROM public.learners WHERE user_id = auth.uid()));

CREATE POLICY "Service role full access to module_completions"
  ON public.module_completions FOR ALL
  USING (auth.role() = 'service_role');

-- ── RLS Policies: peer_validations ───────────────────────────────────────────

CREATE POLICY "Users own peer validations"
  ON public.peer_validations FOR ALL
  USING (learner_id IN (SELECT id FROM public.learners WHERE user_id = auth.uid()));

CREATE POLICY "Service role full access to peer_validations"
  ON public.peer_validations FOR ALL
  USING (auth.role() = 'service_role');

-- ── RLS Policies: progress_snapshots / streaks ───────────────────────────────

CREATE POLICY "Users own progress snapshots"
  ON public.progress_snapshots FOR ALL
  USING (learner_id IN (SELECT id FROM public.learners WHERE user_id = auth.uid()));

CREATE POLICY "Service role full access to progress_snapshots"
  ON public.progress_snapshots FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Users own weekly streaks"
  ON public.weekly_streaks FOR ALL
  USING (user_id = auth.uid());

CREATE POLICY "Service role full access to weekly_streaks"
  ON public.weekly_streaks FOR ALL
  USING (auth.role() = 'service_role');

-- ── RLS Policies: wa_sessions ─────────────────────────────────────────────────

CREATE POLICY "Service role full access to wa_sessions"
  ON public.wa_sessions FOR ALL
  USING (auth.role() = 'service_role');

-- ── RLS Policies: form tables (insert-only for anon) ─────────────────────────

CREATE POLICY "Anyone can submit coaching application"
  ON public.coaching_applications FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins read coaching applications"
  ON public.coaching_applications FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Service role full access to coaching_applications"
  ON public.coaching_applications FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Anyone can submit clinic signup"
  ON public.clinic_signups FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins read clinic signups"
  ON public.clinic_signups FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Service role full access to clinic_signups"
  ON public.clinic_signups FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Anyone can submit contact message"
  ON public.contact_messages FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins read contact messages"
  ON public.contact_messages FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Service role full access to contact_messages"
  ON public.contact_messages FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Anyone can submit membership application"
  ON public.membership_applications FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins read membership applications"
  ON public.membership_applications FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Service role full access to membership_applications"
  ON public.membership_applications FOR ALL
  USING (auth.role() = 'service_role');

-- ── Seed: admin user ──────────────────────────────────────────────────────────
-- admin@ascendmentor.ai was created via the Auth API with UUID:
-- d908c2f0-6266-4ea5-bd38-122e722a9c11

INSERT INTO public.admins (user_id)
VALUES ('d908c2f0-6266-4ea5-bd38-122e722a9c11')
ON CONFLICT (user_id) DO NOTHING;

-- Also add a learner record so admin can use the platform
INSERT INTO public.learners (
  user_id, email, first_name, last_name, full_name,
  onboarding_complete, assessment_complete,
  subscription_tier, subscription_status, status
)
VALUES (
  'd908c2f0-6266-4ea5-bd38-122e722a9c11',
  'admin@ascendmentor.ai',
  'Admin', 'AscendMentor', 'Admin AscendMentor',
  true, false,
  'beta', 'active', 'active'
)
ON CONFLICT DO NOTHING;
