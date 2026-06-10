// ─────────────────────────────────────────────────────────────────────────────
// AscendMentor AI — Route Protection Middleware
// Supabase SSR session check on every request.
// Auth routes → redirect to /dashboard if already signed in.
// Protected routes → redirect to /login if not signed in.
// Public API routes (WhatsApp webhook, cron) → always pass through.
// ─────────────────────────────────────────────────────────────────────────────

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // request.cookies.set only accepts (name, value) — no options
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: Do not run any code between createServerClient and
  // supabase.auth.getUser(). See Supabase SSR docs.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // ── Always allow: public APIs, auth callbacks, static ───────────────────
  const alwaysAllow = [
    "/api/whatsapp",
    "/api/cron",
    "/auth/",
    "/_next",
    "/favicon",
    "/public",
  ];
  if (alwaysAllow.some((p) => pathname.startsWith(p))) {
    return supabaseResponse;
  }

  // ── Protected routes — require authentication ────────────────────────────
  const protectedPrefixes = [
    "/dashboard",
    "/onboarding",
    "/assessment",
    "/coaching",
    "/progress",
    "/settings",
    "/validate",
    "/admin",
  ];
  const isProtected = protectedPrefixes.some((p) => pathname.startsWith(p));

  // ── Guest-only routes — redirect to /dashboard if already signed in ──────
  const guestOnlyPrefixes = [
    "/login",
    "/signup",
    "/reset-password",
    "/update-password",
  ];
  const isGuestOnly = guestOnlyPrefixes.some((p) => pathname.startsWith(p));

  if (!user && isProtected) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    if (pathname !== "/") url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (user && isGuestOnly) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
