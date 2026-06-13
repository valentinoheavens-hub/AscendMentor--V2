-- ─────────────────────────────────────────────────────────────────────────────
-- Access control + enterprise organisations
-- Run this in the Supabase SQL editor (project jlfwhlnxnwvwjaekdisx).
--
-- 1. organisations table (seat-based enterprise licensing, invite codes)
-- 2. learners.organisation_id
-- 3. enterprise_inquiries table (public "For institutions" form)
-- 4. RLS policies
-- 5. Backfill: grandfather existing learners to active
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.organisations (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  contact_name  TEXT,
  contact_email TEXT,
  seat_count    INTEGER NOT NULL DEFAULT 10,
  invite_code   TEXT NOT NULL UNIQUE
                DEFAULT substr(md5(random()::text || clock_timestamp()::text), 1, 10),
  status        TEXT NOT NULL DEFAULT 'active', -- active | suspended
  notes         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.learners
  ADD COLUMN IF NOT EXISTS organisation_id UUID REFERENCES public.organisations(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_learners_organisation ON public.learners(organisation_id);
CREATE INDEX IF NOT EXISTS idx_learners_status       ON public.learners(status);
CREATE INDEX IF NOT EXISTS idx_organisations_invite  ON public.organisations(invite_code);

CREATE TABLE IF NOT EXISTS public.enterprise_inquiries (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_name TEXT NOT NULL,
  contact_name      TEXT NOT NULL,
  contact_email     TEXT NOT NULL,
  phone             TEXT,
  country           TEXT,
  team_size         TEXT,
  message           TEXT,
  status            TEXT NOT NULL DEFAULT 'new', -- new | contacted | closed
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.organisations        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enterprise_inquiries ENABLE ROW LEVEL SECURITY;

-- Organisations: admins read, members read their own org, service role full
DROP POLICY IF EXISTS "Admins read organisations" ON public.organisations;
CREATE POLICY "Admins read organisations"
  ON public.organisations FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "Members read own organisation" ON public.organisations;
CREATE POLICY "Members read own organisation"
  ON public.organisations FOR SELECT
  USING (id IN (SELECT organisation_id FROM public.learners WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Service role full access to organisations" ON public.organisations;
CREATE POLICY "Service role full access to organisations"
  ON public.organisations FOR ALL
  USING (auth.role() = 'service_role');

-- Inquiries: admins read, service role full (public form posts via server route)
DROP POLICY IF EXISTS "Admins read inquiries" ON public.enterprise_inquiries;
CREATE POLICY "Admins read inquiries"
  ON public.enterprise_inquiries FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "Service role full access to inquiries" ON public.enterprise_inquiries;
CREATE POLICY "Service role full access to inquiries"
  ON public.enterprise_inquiries FOR ALL
  USING (auth.role() = 'service_role');

-- Grandfather all existing learners so nobody is locked out by the new gate.
-- New signups still default to 'pending'.
UPDATE public.learners SET status = 'active' WHERE status IS NULL OR status = 'pending';
