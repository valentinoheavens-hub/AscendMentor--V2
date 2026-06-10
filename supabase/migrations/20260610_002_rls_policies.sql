-- ─────────────────────────────────────────────────────────────────────────────
-- AscendMentor AI — Migration 002: Row Level Security Policies
-- Secures all 17 tables. Public forms: anon INSERT only.
-- Learner data: authenticated users see only their own rows.
-- WA sessions: service role only (no policies = blocked for all client roles).
-- ─────────────────────────────────────────────────────────────────────────────

-- ── Enable RLS on ALL tables (existing + new) ─────────────────────────────────

ALTER TABLE public.contact_messages        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.membership_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinic_signups          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coaching_applications   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learners                ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_paths          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.path_modules            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coaching_sessions       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_messages        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress_snapshots      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.module_completions      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clarity_assessments     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mastery_scores          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.behavioural_evidence    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.peer_validations        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_streaks          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wa_sessions             ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────────────────────────────────────
-- PUBLIC FORM SUBMISSION TABLES
-- Anyone (anon) can submit. No client-side reads — admin uses service role.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE POLICY "contact_messages_anon_insert"
  ON public.contact_messages FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "membership_applications_anon_insert"
  ON public.membership_applications FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "clinic_signups_anon_insert"
  ON public.clinic_signups FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "coaching_applications_anon_insert"
  ON public.coaching_applications FOR INSERT TO anon
  WITH CHECK (true);

-- ─────────────────────────────────────────────────────────────────────────────
-- LEARNERS
-- Users can read/update their own profile. Insert on first auth sign-up.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE POLICY "learners_select_own"
  ON public.learners FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "learners_insert_own"
  ON public.learners FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "learners_update_own"
  ON public.learners FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ─────────────────────────────────────────────────────────────────────────────
-- CLARITY ASSESSMENTS
-- Users can insert and read their own assessments. No deletes (audit trail).
-- ─────────────────────────────────────────────────────────────────────────────

CREATE POLICY "clarity_assessments_select_own"
  ON public.clarity_assessments FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "clarity_assessments_insert_own"
  ON public.clarity_assessments FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- ─────────────────────────────────────────────────────────────────────────────
-- MASTERY SCORES
-- Read-only for clients. Written by server-side compute_mastery_score().
-- ─────────────────────────────────────────────────────────────────────────────

CREATE POLICY "mastery_scores_select_own"
  ON public.mastery_scores FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- No INSERT/UPDATE policy for authenticated — only service_role inserts

-- ─────────────────────────────────────────────────────────────────────────────
-- COACHING SESSIONS
-- Users can create and read their own sessions. Quality scores set server-side.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE POLICY "coaching_sessions_select_own"
  ON public.coaching_sessions FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "coaching_sessions_insert_own"
  ON public.coaching_sessions FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "coaching_sessions_update_own"
  ON public.coaching_sessions FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ─────────────────────────────────────────────────────────────────────────────
-- SESSION MESSAGES
-- Accessible if the parent session belongs to the user.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE POLICY "session_messages_select_own"
  ON public.session_messages FOR SELECT TO authenticated
  USING (
    session_id IN (
      SELECT id FROM public.coaching_sessions WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "session_messages_insert_own"
  ON public.session_messages FOR INSERT TO authenticated
  WITH CHECK (
    session_id IN (
      SELECT id FROM public.coaching_sessions WHERE user_id = auth.uid()
    )
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- LEARNING PATHS
-- Accessible if the learner record belongs to the user.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE POLICY "learning_paths_select_own"
  ON public.learning_paths FOR SELECT TO authenticated
  USING (
    learner_id IN (
      SELECT id FROM public.learners WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "learning_paths_insert_own"
  ON public.learning_paths FOR INSERT TO authenticated
  WITH CHECK (
    learner_id IN (
      SELECT id FROM public.learners WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "learning_paths_update_own"
  ON public.learning_paths FOR UPDATE TO authenticated
  USING (
    learner_id IN (
      SELECT id FROM public.learners WHERE user_id = auth.uid()
    )
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- PATH MODULES
-- Readable by all authenticated users (shared content library).
-- ─────────────────────────────────────────────────────────────────────────────

CREATE POLICY "path_modules_select_authenticated"
  ON public.path_modules FOR SELECT TO authenticated
  USING (true);

-- ─────────────────────────────────────────────────────────────────────────────
-- MODULE COMPLETIONS
-- Users can insert and read their own completions.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE POLICY "module_completions_select_own"
  ON public.module_completions FOR SELECT TO authenticated
  USING (
    learner_id IN (
      SELECT id FROM public.learners WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "module_completions_insert_own"
  ON public.module_completions FOR INSERT TO authenticated
  WITH CHECK (
    learner_id IN (
      SELECT id FROM public.learners WHERE user_id = auth.uid()
    )
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- PROGRESS SNAPSHOTS (legacy — kept for backward compat, no new writes)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE POLICY "progress_snapshots_select_own"
  ON public.progress_snapshots FOR SELECT TO authenticated
  USING (
    learner_id IN (
      SELECT id FROM public.learners WHERE user_id = auth.uid()
    )
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- BEHAVIOURAL EVIDENCE
-- Users submit and read their own weekly framework application logs.
-- AI quality scores are updated server-side.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE POLICY "behavioural_evidence_select_own"
  ON public.behavioural_evidence FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "behavioural_evidence_insert_own"
  ON public.behavioural_evidence FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "behavioural_evidence_update_own"
  ON public.behavioural_evidence FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ─────────────────────────────────────────────────────────────────────────────
-- PEER VALIDATIONS
-- Learners can create and view their own validation requests.
-- Token-based completion is handled server-side (service role).
-- ─────────────────────────────────────────────────────────────────────────────

CREATE POLICY "peer_validations_select_own"
  ON public.peer_validations FOR SELECT TO authenticated
  USING (
    learner_id IN (
      SELECT id FROM public.learners WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "peer_validations_insert_own"
  ON public.peer_validations FOR INSERT TO authenticated
  WITH CHECK (
    learner_id IN (
      SELECT id FROM public.learners WHERE user_id = auth.uid()
    )
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- WEEKLY STREAKS
-- Users read their own streaks. Streaks created server-side when activities complete.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE POLICY "weekly_streaks_select_own"
  ON public.weekly_streaks FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "weekly_streaks_insert_own"
  ON public.weekly_streaks FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- ─────────────────────────────────────────────────────────────────────────────
-- WA SESSIONS — NO CLIENT POLICIES
-- RLS enabled but NO policies for anon or authenticated.
-- Only the service_role (webhook handler) can read/write.
-- This is intentional — WA sessions contain full conversation history.
-- ─────────────────────────────────────────────────────────────────────────────
-- (No CREATE POLICY statements here — that is the policy: deny all client access)
