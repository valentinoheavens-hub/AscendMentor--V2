// ─────────────────────────────────────────────────────────────────────────────
// Pending Approval — holding page for applicants awaiting review.
// Reached via the dashboard layout gate when learner.status is not active/trial.
// ─────────────────────────────────────────────────────────────────────────────

import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Clock, XCircle, PauseCircle, LogOut, Mail } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Application Under Review — AscendMentor AI",
};

const COPY = {
  pending: {
    icon: Clock,
    iconClass: "text-yellow-400 bg-yellow-500/10",
    title: "Your application is under review",
    body: "Thank you for applying to AscendMentor AI. Our team personally reviews every application to keep the community focused on serious founders and executives. You'll hear from us within 48 hours.",
    footer: "We review applications daily, Monday to Saturday.",
  },
  declined: {
    icon: XCircle,
    iconClass: "text-red-400 bg-red-500/10",
    title: "Your application wasn't approved",
    body: "AscendMentor AI is currently focused on founders and senior executives leading active organisations. Based on your application we weren't able to offer access at this time — but circumstances change, and you're welcome to get in touch.",
    footer: "Think this was a mistake? Email us and tell us more about your role.",
  },
  inactive: {
    icon: PauseCircle,
    iconClass: "text-muted-foreground bg-white/5",
    title: "Your access is paused",
    body: "Your account is currently inactive. This usually means a subscription or programme cycle has ended. Contact us to reactivate your access.",
    footer: "We can usually reactivate accounts within one business day.",
  },
} as const;

export default async function PendingApprovalPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: learner } = await supabase
    .from("learners")
    .select("first_name, status, onboarding_complete")
    .eq("user_id", user.id)
    .maybeSingle();

  // Active users don't belong here; incomplete applications go back to onboarding
  if (!learner?.onboarding_complete) redirect("/onboarding");
  if (learner.status === "active" || learner.status === "trial") redirect("/dashboard");

  const state =
    learner.status === "declined"
      ? COPY.declined
      : learner.status === "inactive"
        ? COPY.inactive
        : COPY.pending;

  const Icon = state.icon;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-5">
      {/* Brand */}
      <div className="flex items-center gap-3 mb-10">
        <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
          <span className="text-primary-foreground font-bold text-sm font-display">A</span>
        </div>
        <div>
          <p className="font-display font-bold text-sm leading-none">AscendMentor</p>
          <p className="text-[9px] text-muted-foreground tracking-[0.2em] uppercase mt-0.5">AI by BGC</p>
        </div>
      </div>

      <div className="w-full max-w-md bg-card border border-border/50 rounded-3xl p-8 text-center">
        <div className={`w-14 h-14 rounded-2xl ${state.iconClass} flex items-center justify-center mx-auto mb-6`}>
          <Icon className="h-7 w-7" />
        </div>

        <h1 className="font-display text-xl font-bold text-foreground">
          {state.title}
        </h1>
        <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
          {learner.first_name ? `${learner.first_name} — ` : ""}
          {state.body}
        </p>

        <div className="mt-6 pt-6 border-t border-border/40">
          <p className="text-xs text-muted-foreground">{state.footer}</p>
          <a
            href="mailto:support@ascendmentor.ai"
            className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-yellow-400 hover:text-yellow-300 transition-colors"
          >
            <Mail className="h-4 w-4" />
            support@ascendmentor.ai
          </a>
        </div>
      </div>

      <form action="/auth/signout" method="POST" className="mt-8">
        <button
          type="submit"
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </form>
    </div>
  );
}
