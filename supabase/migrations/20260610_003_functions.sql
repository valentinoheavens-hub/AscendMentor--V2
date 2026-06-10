-- ─────────────────────────────────────────────────────────────────────────────
-- AscendMentor AI — Migration 003: Database Functions & Triggers
-- ─────────────────────────────────────────────────────────────────────────────

-- ── 1. compute_mastery_score() ────────────────────────────────────────────────
-- Implements the full Mastery Score™ formula:
--   MS = (CA×0.30) + (BE×0.25) + (LP×0.20) + (AI×0.15) + (PS×0.10)
-- Returns a JSONB snapshot AND upserts a row into mastery_scores.
-- Called server-side (service role) at Day 30, 60, 90 during beta, then quarterly.

CREATE OR REPLACE FUNCTION public.compute_mastery_score(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_learner_id           UUID;
  v_learner_created_at   TIMESTAMPTZ;
  v_weeks_active         INTEGER;

  -- Component scores (0-100)
  v_ca_score  NUMERIC := 0;
  v_be_score  NUMERIC := 0;
  v_lp_score  NUMERIC := 0;
  v_ai_score  NUMERIC := 0;
  v_ps_score  NUMERIC := 0;

  -- Computation helpers
  v_be_quality_count  INTEGER := 0;
  v_lp_total          INTEGER := 0;
  v_lp_done           INTEGER := 0;
  v_prev_total        NUMERIC := 0;

  v_total_score        NUMERIC := 0;
  v_belt_tier          TEXT;
  v_streak             INTEGER := 0;
  v_velocity           NUMERIC := 0;
  v_result             JSONB;
BEGIN
  -- ── Resolve learner ──────────────────────────────────────────────────────
  SELECT id, created_at
    INTO v_learner_id, v_learner_created_at
    FROM public.learners
   WHERE user_id = p_user_id
   LIMIT 1;

  IF v_learner_id IS NULL THEN
    RETURN jsonb_build_object('error', 'learner_not_found', 'user_id', p_user_id);
  END IF;

  -- Weeks active (minimum 1)
  v_weeks_active := GREATEST(
    EXTRACT(EPOCH FROM (NOW() - v_learner_created_at)) / 604800,
    1
  )::INTEGER;

  -- ── CA: Clarity Assessment (30%) ────────────────────────────────────────
  -- Use the latest completed assessment's overall_pct.
  -- Growth bonus: if score improved vs previous round, extra 10% of improvement.
  DECLARE
    v_current_ca  NUMERIC := 0;
    v_prev_ca     NUMERIC := 0;
    v_ca_round    INTEGER := 0;
  BEGIN
    SELECT overall_pct, assessment_round
      INTO v_current_ca, v_ca_round
      FROM public.clarity_assessments
     WHERE user_id = p_user_id
     ORDER BY completed_at DESC
     LIMIT 1;

    IF v_ca_round > 1 THEN
      -- Get previous round score for growth bonus
      SELECT overall_pct
        INTO v_prev_ca
        FROM public.clarity_assessments
       WHERE user_id = p_user_id
         AND assessment_round = v_ca_round - 1
       LIMIT 1;

      -- Growth bonus: improvement counts double for the delta
      v_ca_score := LEAST(
        v_current_ca + GREATEST(v_current_ca - v_prev_ca, 0) * 0.10,
        100
      );
    ELSE
      v_ca_score := COALESCE(v_current_ca, 0);
    END IF;
  END;

  -- ── BE: Behavioural Evidence (25%) ──────────────────────────────────────
  -- Quality submissions (ai_quality_score >= 50) / weeks_active × 100
  SELECT COUNT(*)
    INTO v_be_quality_count
    FROM public.behavioural_evidence
   WHERE user_id = p_user_id
     AND COALESCE(ai_quality_score, 0) >= 50;

  v_be_score := LEAST(
    (v_be_quality_count::NUMERIC / v_weeks_active::NUMERIC) * 100,
    100
  );

  -- ── LP: Learning Path Completion (20%) ──────────────────────────────────
  -- Completed modules / total modules in user's active path
  SELECT COUNT(DISTINCT mc.module_id)
    INTO v_lp_done
    FROM public.module_completions mc
   WHERE mc.learner_id = v_learner_id;

  SELECT COUNT(pm.id)
    INTO v_lp_total
    FROM public.path_modules pm
    JOIN public.learning_paths lp ON lp.id = pm.path_id
   WHERE lp.learner_id = v_learner_id
     AND lp.status = 'active';

  IF v_lp_total > 0 THEN
    v_lp_score := (v_lp_done::NUMERIC / v_lp_total::NUMERIC) * 100;
  END IF;

  -- ── AI: Session Engagement Quality (15%) ────────────────────────────────
  -- Average quality_score across coaching sessions in last 90 days (where scored)
  SELECT COALESCE(AVG(quality_score), 0)
    INTO v_ai_score
    FROM public.coaching_sessions
   WHERE user_id = p_user_id
     AND quality_score IS NOT NULL
     AND started_at >= NOW() - INTERVAL '90 days';

  -- ── PS: Peer/Stakeholder Validation (10%) ───────────────────────────────
  -- Average of all dimension scores across completed peer validations.
  -- Raw scores are 0-4 per dimension, scaled to 0-100 (multiply by 25).
  SELECT COALESCE(
    AVG(
      (
        SELECT AVG(val::NUMERIC) * 25
          FROM jsonb_each_text(pv.dimension_scores) AS kv(key, val)
         WHERE val ~ '^[0-9]+(\.[0-9]+)?$'
      )
    ),
    0
  )
    INTO v_ps_score
    FROM public.peer_validations pv
   WHERE pv.learner_id = v_learner_id
     AND pv.completed_at IS NOT NULL;

  -- ── Compute total ────────────────────────────────────────────────────────
  v_total_score :=
    (v_ca_score * 0.30) +
    (v_be_score * 0.25) +
    (v_lp_score * 0.20) +
    (v_ai_score * 0.15) +
    (v_ps_score * 0.10);

  -- ── Belt tier ────────────────────────────────────────────────────────────
  v_belt_tier := CASE
    WHEN v_total_score >= 80 THEN 'black_belt'
    WHEN v_total_score >= 60 THEN 'blue_belt'
    WHEN v_total_score >= 40 THEN 'green_belt'
    WHEN v_total_score >= 20 THEN 'yellow_belt'
    ELSE 'seeker'
  END;

  -- ── Current streak (consecutive completed weeks, last 12 weeks) ──────────
  SELECT COUNT(DISTINCT date_trunc('week', ws.created_at))
    INTO v_streak
    FROM public.weekly_streaks ws
   WHERE ws.user_id = p_user_id
     AND ws.completed = TRUE
     AND ws.created_at >= NOW() - INTERVAL '84 days';

  -- ── Score velocity vs previous snapshot ──────────────────────────────────
  SELECT COALESCE(total_score, 0)
    INTO v_prev_total
    FROM public.mastery_scores
   WHERE user_id = p_user_id
   ORDER BY snapshot_date DESC
   LIMIT 1;

  v_velocity := ROUND((v_total_score - v_prev_total)::NUMERIC, 1);

  -- ── Upsert mastery score snapshot ────────────────────────────────────────
  INSERT INTO public.mastery_scores (
    user_id, learner_id,
    ca_score, be_score, lp_score, ai_score, ps_score,
    total_score, belt_tier, current_streak_weeks, score_velocity,
    snapshot_date
  ) VALUES (
    p_user_id, v_learner_id,
    ROUND(v_ca_score, 2),
    ROUND(v_be_score, 2),
    ROUND(v_lp_score, 2),
    ROUND(v_ai_score, 2),
    ROUND(v_ps_score, 2),
    ROUND(v_total_score, 2),
    v_belt_tier,
    v_streak,
    v_velocity,
    CURRENT_DATE
  );

  -- ── Build and return result JSON ─────────────────────────────────────────
  v_result := jsonb_build_object(
    'total_score',           ROUND(v_total_score, 1),
    'belt_tier',             v_belt_tier,
    'ca_score',              ROUND(v_ca_score, 1),
    'be_score',              ROUND(v_be_score, 1),
    'lp_score',              ROUND(v_lp_score, 1),
    'ai_score',              ROUND(v_ai_score, 1),
    'ps_score',              ROUND(v_ps_score, 1),
    'current_streak_weeks',  v_streak,
    'score_velocity',        v_velocity,
    'weeks_active',          v_weeks_active,
    'snapshot_date',         CURRENT_DATE::TEXT,
    'computed_at',           NOW()::TEXT
  );

  RETURN v_result;

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'error',   SQLERRM,
    'detail',  SQLSTATE,
    'user_id', p_user_id
  );
END;
$$;

COMMENT ON FUNCTION public.compute_mastery_score IS
  'Computes and stores the full Mastery Score™ for a user. '
  'Call from server-side API routes only. Returns JSONB breakdown.';

-- ── 2. get_learner_clarity_profile() ─────────────────────────────────────────
-- Returns the latest clarity profile for a user — used by dashboard and WhatsApp.

CREATE OR REPLACE FUNCTION public.get_learner_clarity_profile(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'assessment_id',           ca.id,
    'strategic_direction_pct', ca.strategic_direction_pct,
    'people_clarity_pct',      ca.people_clarity_pct,
    'systems_processes_pct',   ca.systems_processes_pct,
    'structural_clarity_pct',  ca.structural_clarity_pct,
    'leadership_mastery_pct',  ca.leadership_mastery_pct,
    'overall_pct',             ca.overall_pct,
    'belt_tier',               ca.belt_tier,
    'assessment_round',        ca.assessment_round,
    'completed_at',            ca.completed_at::TEXT,
    'primary_gap', (
      SELECT dim_id FROM (
        VALUES
          ('strategic_direction', ca.strategic_direction_pct),
          ('people_clarity',      ca.people_clarity_pct),
          ('systems_processes',   ca.systems_processes_pct),
          ('structural_clarity',  ca.structural_clarity_pct),
          ('leadership_mastery',  ca.leadership_mastery_pct)
      ) AS dims(dim_id, pct)
      ORDER BY pct ASC LIMIT 1
    ),
    'primary_strength', (
      SELECT dim_id FROM (
        VALUES
          ('strategic_direction', ca.strategic_direction_pct),
          ('people_clarity',      ca.people_clarity_pct),
          ('systems_processes',   ca.systems_processes_pct),
          ('structural_clarity',  ca.structural_clarity_pct),
          ('leadership_mastery',  ca.leadership_mastery_pct)
      ) AS dims(dim_id, pct)
      ORDER BY pct DESC LIMIT 1
    )
  )
  INTO v_result
  FROM public.clarity_assessments ca
  WHERE ca.user_id = p_user_id
  ORDER BY ca.completed_at DESC
  LIMIT 1;

  IF v_result IS NULL THEN
    RETURN jsonb_build_object('has_assessment', FALSE);
  END IF;

  RETURN v_result || jsonb_build_object('has_assessment', TRUE);

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('error', SQLERRM, 'user_id', p_user_id);
END;
$$;

COMMENT ON FUNCTION public.get_learner_clarity_profile IS
  'Returns the latest Clarity Assessment profile for a user. '
  'Includes primary_gap and primary_strength dimension IDs. '
  'Used by dashboard widgets and WhatsApp score report.';

-- ── 3. score_clarity_assessment() ────────────────────────────────────────────
-- Computes percentage scores from raw answers and returns the full profile.
-- Used by the /api/assessment/submit route to avoid frontend math.

CREATE OR REPLACE FUNCTION public.score_clarity_assessment(
  p_strategic_direction_score INTEGER,
  p_people_clarity_score      INTEGER,
  p_systems_processes_score   INTEGER,
  p_structural_clarity_score  INTEGER,
  p_leadership_mastery_score  INTEGER
)
RETURNS JSONB
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  v_sd_pct   NUMERIC;
  v_pc_pct   NUMERIC;
  v_sp_pct   NUMERIC;
  v_sc_pct   NUMERIC;
  v_lm_pct   NUMERIC;
  v_overall  NUMERIC;
  v_belt     TEXT;
BEGIN
  -- Convert raw scores to percentages
  -- SD max=24, PC/SP/SC/LM max=20 each
  v_sd_pct := ROUND((p_strategic_direction_score::NUMERIC / 24) * 100, 2);
  v_pc_pct := ROUND((p_people_clarity_score::NUMERIC       / 20) * 100, 2);
  v_sp_pct := ROUND((p_systems_processes_score::NUMERIC    / 20) * 100, 2);
  v_sc_pct := ROUND((p_structural_clarity_score::NUMERIC   / 20) * 100, 2);
  v_lm_pct := ROUND((p_leadership_mastery_score::NUMERIC   / 20) * 100, 2);

  -- Overall = simple average of 5 dimension percentages (equal weight by dimension)
  v_overall := ROUND((v_sd_pct + v_pc_pct + v_sp_pct + v_sc_pct + v_lm_pct) / 5, 2);

  -- Belt tier
  v_belt := CASE
    WHEN v_overall >= 80 THEN 'black_belt'
    WHEN v_overall >= 60 THEN 'blue_belt'
    WHEN v_overall >= 40 THEN 'green_belt'
    WHEN v_overall >= 20 THEN 'yellow_belt'
    ELSE 'seeker'
  END;

  RETURN jsonb_build_object(
    'strategic_direction_pct', v_sd_pct,
    'people_clarity_pct',      v_pc_pct,
    'systems_processes_pct',   v_sp_pct,
    'structural_clarity_pct',  v_sc_pct,
    'leadership_mastery_pct',  v_lm_pct,
    'overall_pct',             v_overall,
    'belt_tier',               v_belt
  );
END;
$$;

COMMENT ON FUNCTION public.score_clarity_assessment IS
  'Pure scoring function — no DB writes. Returns dimension percentages and belt tier. '
  'Input: raw dimension scores. SD max=24, PC/SP/SC/LM max=20.';

-- ── 4. Trigger: mark assessment_complete on learners after first assessment ───

CREATE OR REPLACE FUNCTION public.trigger_mark_assessment_complete()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- When a clarity_assessment is inserted, mark the learner's assessment_complete flag
  UPDATE public.learners
     SET assessment_complete = TRUE
   WHERE user_id = NEW.user_id
     AND assessment_complete = FALSE;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_clarity_assessment_inserted ON public.clarity_assessments;

CREATE TRIGGER on_clarity_assessment_inserted
  AFTER INSERT ON public.clarity_assessments
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_mark_assessment_complete();

-- ── 5. Trigger: auto-update wa_sessions last_active_at ───────────────────────

CREATE OR REPLACE FUNCTION public.trigger_wa_session_touch()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.last_active_at := NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_wa_session_updated ON public.wa_sessions;

CREATE TRIGGER on_wa_session_updated
  BEFORE UPDATE ON public.wa_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_wa_session_touch();

-- ── 6. Helper: get wa_session with user context ───────────────────────────────
-- Used by the WhatsApp webhook handler to get full session + clarity profile.

CREATE OR REPLACE FUNCTION public.get_wa_session_context(p_phone TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_session  JSONB;
  v_profile  JSONB;
  v_result   JSONB;
BEGIN
  -- Get session
  SELECT to_jsonb(ws)
    INTO v_session
    FROM public.wa_sessions ws
   WHERE wa_phone_number = p_phone
   LIMIT 1;

  IF v_session IS NULL THEN
    RETURN jsonb_build_object('found', FALSE, 'phone', p_phone);
  END IF;

  -- Get clarity profile if user exists
  IF (v_session->>'user_id') IS NOT NULL THEN
    v_profile := public.get_learner_clarity_profile(
      (v_session->>'user_id')::UUID
    );
  ELSE
    v_profile := jsonb_build_object('has_assessment', FALSE);
  END IF;

  v_result := jsonb_build_object(
    'found',   TRUE,
    'session', v_session,
    'profile', v_profile
  );

  RETURN v_result;

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('error', SQLERRM, 'phone', p_phone);
END;
$$;

COMMENT ON FUNCTION public.get_wa_session_context IS
  'WhatsApp webhook helper. Returns session state + clarity profile in one call. '
  'Service role only (called from webhook route handler).';
