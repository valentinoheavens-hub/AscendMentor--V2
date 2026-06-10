// ─────────────────────────────────────────────────────────────────────────────
// Auth Callback Handler
// Called by Supabase after email confirmation or OAuth.
// 1. Exchanges code for session
// 2. Ensures learner record exists (creates if not)
// 3. Routes to correct next step based on learner state
// ─────────────────────────────────────────────────────────────────────────────

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/types/supabase";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";
  const errorParam = searchParams.get("error");

  // Handle Supabase auth errors (e.g. expired link)
  if (errorParam) {
    const errorDescription = searchParams.get("error_description") ?? "Auth error";
    const url = new URL(`${origin}/login`);
    url.searchParams.set("error", errorDescription);
    return NextResponse.redirect(url.toString());
  }

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=missing_code`);
  }

  const cookieStore = await cookies();

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    }
  );

  const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !session) {
    console.error("[auth/callback] Code exchange failed:", error?.message);
    return NextResponse.redirect(`${origin}/login?error=auth_failed`);
  }

  // ── Ensure learner profile exists ────────────────────────────────────────
  const { data: learner, error: learnerError } = await supabase
    .from("learners")
    .select("id, onboarding_complete, assessment_complete")
    .eq("user_id", session.user.id)
    .maybeSingle();

  if (learnerError) {
    console.error("[auth/callback] Learner fetch error:", learnerError.message);
  }

  if (!learner) {
    // First login — create minimal learner record
    const userMeta = session.user.user_metadata;
    const fullName = userMeta?.full_name as string | undefined;

    const { error: insertError } = await supabase.from("learners").insert({
      user_id: session.user.id,
      email: session.user.email!,
      first_name: fullName?.split(" ")[0] ?? "",
      last_name: fullName?.split(" ").slice(1).join(" ") ?? null,
      full_name: fullName ?? null,
      subscription_tier: "free",
      subscription_status: "inactive",
    });

    if (insertError) {
      console.error("[auth/callback] Learner insert error:", insertError.message);
    }

    return NextResponse.redirect(`${origin}/onboarding`);
  }

  // ── Route based on completion state ──────────────────────────────────────
  if (!learner.onboarding_complete) {
    return NextResponse.redirect(`${origin}/onboarding`);
  }

  if (!learner.assessment_complete) {
    return NextResponse.redirect(`${origin}/assessment`);
  }

  // Honour ?next= param for post-login deep links
  const safeNext = next.startsWith("/") ? next : "/dashboard";
  return NextResponse.redirect(`${origin}${safeNext}`);
}
