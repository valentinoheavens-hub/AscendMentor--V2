// ─────────────────────────────────────────────────────────────────────────────
// Upgrade / Pricing Page — Step 7
// ─────────────────────────────────────────────────────────────────────────────

import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { UpgradePlans } from "@/components/payment/upgrade-plans";
import { getPlanById } from "@/constants/subscription-plans";
import type { SubscriptionTier } from "@/types/platform";

export const metadata: Metadata = {
  title: "Upgrade — AscendMentor AI",
};

export default async function UpgradePage({
  searchParams,
}: {
  searchParams: Promise<{ payment?: string; plan?: string; error?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: learner } = await supabase
    .from("learners")
    .select("full_name, subscription_tier, subscription_status")
    .eq("user_id", user.id)
    .single();

  const params = await searchParams;
  const paymentResult = params.payment;
  const errorCode = params.error;

  const currentTier = (learner?.subscription_tier ?? "free") as SubscriptionTier;
  const currentPlan = getPlanById(currentTier);

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-up">
      {/* ── Header ── */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Dashboard
        </Link>
      </div>

      {/* ── Payment success banner ── */}
      {paymentResult === "success" && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
          <CheckCircle2 className="h-5 w-5 text-emerald-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-emerald-300">
              Payment successful — welcome to {getPlanById(params.plan as SubscriptionTier ?? "free").name}!
            </p>
            <p className="text-xs text-emerald-400/80 mt-0.5">
              Your plan has been activated. All features are now unlocked.
            </p>
          </div>
        </div>
      )}

      {/* ── Error banner ── */}
      {errorCode && (
        <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/30 text-sm text-destructive">
          Payment could not be completed ({errorCode.replace(/_/g, " ")}). Please try again or contact support.
        </div>
      )}

      {/* ── Title ── */}
      <div className="text-center space-y-2">
        <h1 className="font-display text-3xl font-black text-foreground">
          Unlock Your Full Mastery Journey
        </h1>
        <p className="text-muted-foreground max-w-lg mx-auto">
          You&apos;re currently on the{" "}
          <span className="text-foreground font-semibold">{currentPlan.name}</span> plan.
          Upgrade to access unlimited coaching, quarterly assessments, and peer validation.
        </p>
      </div>

      {/* ── Plans ── */}
      <UpgradePlans currentTier={currentTier} userEmail={user.email ?? ""} />

      {/* ── Guarantee ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center text-sm text-muted-foreground">
        {[
          { label: "30-day money-back guarantee", icon: "🛡️" },
          { label: "Cancel any time, no questions asked", icon: "✋" },
          { label: "African founders pricing on request", icon: "🌍" },
        ].map(({ label, icon }) => (
          <div key={label} className="flex items-center justify-center gap-2">
            <span>{icon}</span>
            <span>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
