# AscendMentor AI

**The leadership operating system for African enterprises.** AI-powered leadership
mastery built on the proprietary frameworks of Blackbelt Global Consulting (BGC),
founded by Dr. Valentino Heavens — *The Clarity Merchant™*.

> "The art of mastering your world begins with the art of self-mastery."

---

## What it does

AscendMentor turns BGC's executive consulting methodology into a measurable,
self-serve leadership journey for African founders and executives.

1. **Clarity Assessment™** — a 26-question diagnostic across 5 leadership dimensions
   produces a clarity profile and identifies the learner's primary gap.
2. **BGC AI Coach** — a coach grounded in 5 proprietary frameworks, aware of the
   learner's scores and context, available on web and WhatsApp.
3. **BGC Mastery Score™** — a live 0–100 score that climbs as the learner does the
   work, gating belt progression from Clarity Seeker → Black Belt.
4. **Enterprise** — institutions license seats; members join via an invite link and
   leadership teams are tracked with org-level clarity analytics.

## The BGC Mastery Score™

The Mastery Score is the core mechanic — a single number that can't be faked,
recomputed from real signals whenever evidence lands ([`src/lib/mastery.ts`](src/lib/mastery.ts)):

| Component | Weight | Source |
|-----------|--------|--------|
| Clarity Assessment (CA) | 30% | Latest assessment overall % |
| Behavioural Evidence (BE) | 25% | Weekly framework-application logs, coach-scored |
| Learning Path (LP) | 20% | Module completion depth |
| AI Session Quality (AI) | 15% | Substantive coaching engagement |
| Peer Validation (PS) | 10% | Completed 360-style validations |

Belt tier is always derived from the full 0–100 total. Each recompute writes a fresh
snapshot to `mastery_scores`, so progress is longitudinal.

## The 5 BGC frameworks (the IP)

Encoded in [`src/lib/bgc-coach/system-prompt.ts`](src/lib/bgc-coach/system-prompt.ts)
and [`src/constants/bgc-frameworks.ts`](src/constants/bgc-frameworks.ts):

1. **The Clarity Mandate™** — performance is a function of leadership clarity
2. **Blackbelt OS™** — six diagnostic domains of a high-performing organisation
3. **People · Systems · Structure™** — the growth architecture
4. **Blackbelt Delivery Framework™ (BDF)** — the 5D execution methodology
5. **BANT+F™** — qualification model for coaching recommendations

## Architecture

- **Next.js 16 (App Router)** + React, TypeScript, Tailwind
- **Supabase** — Postgres, Auth (SSR cookies), RLS. Types in [`src/types/supabase.ts`](src/types/supabase.ts)
- **Coach inference** — Groq powers every channel (web, WhatsApp, evidence
  scoring) via one module [`src/lib/bgc-coach/provider.ts`](src/lib/bgc-coach/provider.ts) (model set by `BGC_COACH_MODEL`)
- **Payments** — Paystack, Flutterwave, M-Pesa (USD + KES)
- **WhatsApp** — coaching over the WhatsApp Business API

### Route groups

- `(auth)` — login, signup (with `?invite=` for institutions), password reset
- `(onboarding)` — 5-step application; completion routes to review or assessment
- `(dashboard)` — dashboard, assessment, coaching, **evidence**, progress, validate, upgrade, settings
- `(admin)` — overview, applications review, learners, organisations, inquiries, sessions
- Public — landing (`/`), institutions (`/institutions`), org join (`/join/[code]`), peer validation (`/peer/[id]`), pending approval

### Access model

New individual signups are **applications**: they complete onboarding, land at
`pending`, and the dashboard gate ([`src/app/(dashboard)/layout.tsx`](src/app/(dashboard)/layout.tsx))
holds them at `/pending-approval` until an admin approves. Institution members joining
via an org invite link are auto-approved against available seats.

## Getting started

```bash
npm install
npm run dev          # http://localhost:3000
npx tsc --noEmit     # type check
```

### Environment (`.env.local` — never commit)

Server-side only (no `NEXT_PUBLIC_` prefix): `SUPABASE_SERVICE_ROLE_KEY`,
`GROQ_API_KEY`, `RESEND_API_KEY`, `PAYSTACK_SECRET_KEY`,
`FLUTTERWAVE_SECRET_KEY`, `MPESA_*`, `WHATSAPP_TOKEN`, `CRON_SECRET`.
Public: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
`NEXT_PUBLIC_APP_URL`, payment public keys.

Optional: `BGC_COACH_MODEL` (default `llama-3.3-70b-versatile`), `EMAIL_FROM`,
`ADMIN_NOTIFY_EMAIL`.

All AI inference on this project runs on **Groq**.

### Database migrations

SQL lives in [`supabase/migrations`](supabase/migrations). Apply new migrations in the
Supabase SQL editor.

---

© Blackbelt Global Consulting Limited. BGC Mastery Score™, Clarity Assessment™,
Blackbelt OS™ and the framework names are trademarks of BGC.
