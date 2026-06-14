"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  CheckCircle2, Loader2, Zap, Crown, Shield,
  Smartphone, CreditCard, Banknote, Building2,
} from "lucide-react";
import { SUBSCRIPTION_PLANS, planPrice, providerCurrency } from "@/constants/subscription-plans";
import type { PaymentProvider } from "@/constants/subscription-plans";
import { cn } from "@/lib/utils";
import type { SubscriptionTier } from "@/types/platform";

const PLAN_ICONS = {
  free: Shield, individual: Zap, professional: Crown,
  beta_90: Zap, enterprise: Crown,
};

const PROVIDERS: { id: PaymentProvider; label: string; icon: React.ElementType; note: string }[] = [
  { id: "paystack",    label: "Paystack",     icon: CreditCard, note: "Cards · Bank · USSD" },
  { id: "flutterwave", label: "Flutterwave",  icon: Banknote,   note: "Cards · Mobile Money" },
  { id: "mpesa",       label: "M-Pesa",       icon: Smartphone, note: "Kenya · KES only" },
];

// ── M-Pesa waiting modal ──────────────────────────────────────────────────────
function MPesaWaiting({
  checkoutId,
  planId,
  onCancel,
}: {
  checkoutId: string;
  planId: SubscriptionTier;
  onCancel: () => void;
}) {
  const [polling, setPolling] = useState(false);
  const [done, setDone] = useState(false);

  const poll = async () => {
    setPolling(true);
    let attempts = 0;
    const max = 12; // ~60 seconds

    const check = async (): Promise<void> => {
      if (attempts >= max) {
        toast.error("Payment timed out. Please try again.");
        setPolling(false);
        onCancel();
        return;
      }
      attempts++;

      const res = await fetch(`/api/mpesa/status?id=${encodeURIComponent(checkoutId)}`);
      const data = await res.json();

      if (data.status === "success") {
        setDone(true);
        toast.success(`Payment successful — welcome to your new plan!`);
        setTimeout(() => (window.location.href = `/dashboard?payment=success&plan=${planId}`), 1500);
        return;
      }
      if (data.status === "failed" || data.status === "cancelled") {
        toast.error(data.message ?? "Payment failed.");
        setPolling(false);
        onCancel();
        return;
      }
      // Still pending — wait 5s and retry
      await new Promise((r) => setTimeout(r, 5000));
      return check();
    };

    await check();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-card border border-border/50 rounded-2xl p-8 max-w-sm w-full text-center space-y-5 shadow-2xl">
        <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto">
          <Smartphone className="h-8 w-8 text-emerald-400" />
        </div>

        {done ? (
          <>
            <CheckCircle2 className="h-10 w-10 text-emerald-400 mx-auto" />
            <p className="font-semibold text-foreground">Payment confirmed!</p>
            <p className="text-sm text-muted-foreground">Redirecting to your dashboard…</p>
          </>
        ) : (
          <>
            <h3 className="font-display font-bold text-lg text-foreground">
              Check Your Phone
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              An M-Pesa payment request has been sent to your phone. Enter your
              M-Pesa PIN to complete the payment.
            </p>

            {!polling ? (
              <button
                type="button"
                onClick={poll}
                className="w-full py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-500 transition-colors"
              >
                I&apos;ve paid — confirm
              </button>
            ) : (
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Checking payment status…
              </div>
            )}

            <button
              type="button"
              onClick={onCancel}
              className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2"
            >
              Cancel
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ── M-Pesa phone input modal ──────────────────────────────────────────────────
function MPesaPhoneModal({
  plan,
  interval,
  onSubmit,
  onClose,
}: {
  plan: (typeof SUBSCRIPTION_PLANS)[number];
  interval: "monthly" | "annual";
  onSubmit: (phone: string) => Promise<void>;
  onClose: () => void;
}) {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  const displayPrice = planPrice(plan, "KES", interval).display;

  const handleSubmit = async () => {
    if (!phone.trim()) {
      toast.error("Enter your M-Pesa phone number.");
      return;
    }
    setLoading(true);
    await onSubmit(phone.trim());
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-card border border-border/50 rounded-2xl p-8 max-w-sm w-full space-y-5 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
            <Smartphone className="h-5 w-5 text-emerald-400" />
          </div>
          <div>
            <h3 className="font-display font-bold text-foreground">Pay via M-Pesa</h3>
            <p className="text-xs text-muted-foreground">{plan.name} · {displayPrice}</p>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Safaricom phone number
          </label>
          <input
            type="tel"
            placeholder="0712 345 678 or +254712345678"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-background border border-border/50 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
          />
          <p className="text-xs text-muted-foreground">
            You&apos;ll receive a PIN prompt on this number.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-border/40 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-500 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Send Request
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export function UpgradePlans({
  currentTier,
}: {
  currentTier: SubscriptionTier;
  userEmail: string;
}) {
  const [interval, setBillingInterval] = useState<"monthly" | "annual">("monthly");
  const [provider, setProvider] = useState<PaymentProvider>("paystack");
  const [loading, setLoading] = useState<string | null>(null);

  // M-Pesa flow state
  const [mpesaModalPlan, setMpesaModalPlan] = useState<(typeof SUBSCRIPTION_PLANS)[number] | null>(null);
  const [mpesaCheckoutId, setMpesaCheckoutId] = useState<string | null>(null);
  const [mpesaActivePlanId, setMpesaActivePlanId] = useState<SubscriptionTier | null>(null);

  const annualSavingsPct = 17; // 2 months free on annual billing

  const handleUpgrade = async (planId: SubscriptionTier) => {
    if (planId === "free" || planId === currentTier) return;

    const plan = SUBSCRIPTION_PLANS.find((p) => p.id === planId)!;

    // M-Pesa: open phone input modal
    if (provider === "mpesa") {
      setMpesaModalPlan(plan);
      return;
    }

    // Paystack / Flutterwave: server redirect flow
    setLoading(planId);
    try {
      const endpoint =
        provider === "flutterwave"
          ? "/api/flutterwave/initialize"
          : "/api/paystack/initialize";

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan_id: planId, interval }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "Could not start payment. Try again.");
        setLoading(null);
        return;
      }

      const url = data.authorization_url ?? data.payment_link;
      window.location.href = url;
    } catch {
      toast.error("Network error. Please check your connection.");
      setLoading(null);
    }
  };

  const handleMpesaSubmit = async (phone: string) => {
    if (!mpesaModalPlan) return;
    try {
      const res = await fetch("/api/mpesa/stkpush", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan_id: mpesaModalPlan.id,
          interval,
          phone,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.CheckoutRequestID) {
        toast.error(data.error ?? "M-Pesa request failed. Try again.");
        return;
      }
      setMpesaCheckoutId(data.CheckoutRequestID);
      setMpesaActivePlanId(mpesaModalPlan.id as SubscriptionTier);
      setMpesaModalPlan(null);
    } catch {
      toast.error("Network error. Please check your connection.");
    }
  };

  return (
    <div className="space-y-8">
      {/* ── M-Pesa Modals ── */}
      {mpesaModalPlan && (
        <MPesaPhoneModal
          plan={mpesaModalPlan}
          interval={interval}
          onSubmit={handleMpesaSubmit}
          onClose={() => setMpesaModalPlan(null)}
        />
      )}
      {mpesaCheckoutId && mpesaActivePlanId && (
        <MPesaWaiting
          checkoutId={mpesaCheckoutId}
          planId={mpesaActivePlanId}
          onCancel={() => { setMpesaCheckoutId(null); setMpesaActivePlanId(null); }}
        />
      )}

      {/* ── Interval Toggle ── */}
      <div className="flex items-center justify-center">
        <div className="inline-flex items-center bg-card border border-border/40 rounded-xl p-1 gap-1">
          {(["monthly", "annual"] as const).map((iv) => (
            <button
              key={iv}
              type="button"
              onClick={() => setBillingInterval(iv)}
              className={cn(
                "px-5 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
                interval === iv
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {iv.charAt(0).toUpperCase() + iv.slice(1)}
              {iv === "annual" && (
                <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded-full">
                  SAVE {annualSavingsPct}%
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Payment Provider Selector ── */}
      <div className="space-y-2">
        <p className="text-center text-xs text-muted-foreground font-medium uppercase tracking-wider">
          Pay with
        </p>
        <div className="flex items-center justify-center gap-3">
          {PROVIDERS.map(({ id, label, icon: Icon, note }) => (
            <button
              key={id}
              type="button"
              onClick={() => setProvider(id)}
              className={cn(
                "flex flex-col items-center gap-1.5 px-5 py-3 rounded-xl border text-sm font-medium transition-all",
                provider === id
                  ? "border-primary bg-primary/10 text-foreground"
                  : "border-border/40 bg-card text-muted-foreground hover:border-border hover:text-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{label}</span>
              <span className="text-[10px] text-muted-foreground">{note}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Plan Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {SUBSCRIPTION_PLANS.filter((p) =>
          ["free", "individual", "professional"].includes(p.id)
        ).map((plan) => {
          const Icon = PLAN_ICONS[plan.id as keyof typeof PLAN_ICONS] ?? Shield;
          const isCurrent = plan.id === currentTier;
          const isLoading = loading === plan.id;

          // Price shown follows the selected processor's currency
          // (Paystack→₦, Flutterwave→$, M-Pesa→KES).
          const displayPrice = planPrice(plan, providerCurrency(provider), interval).display;

          const perPeriod =
            plan.id === "free" ? "forever" : interval === "annual" ? "/year" : "/month";

          return (
            <div
              key={plan.id}
              className={cn(
                "relative flex flex-col rounded-2xl border p-6 transition-all",
                plan.highlighted
                  ? "border-primary/60 bg-primary/5 shadow-lg shadow-primary/10"
                  : "border-border/40 bg-card",
                isCurrent && "ring-2 ring-emerald-500/40"
              )}
            >
              {plan.highlighted && !isCurrent && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-primary text-primary-foreground text-[10px] font-bold px-3 py-1 rounded-full tracking-wider uppercase">
                    Most Popular
                  </span>
                </div>
              )}
              {isCurrent && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-emerald-600 text-white text-[10px] font-bold px-3 py-1 rounded-full tracking-wider uppercase">
                    Current Plan
                  </span>
                </div>
              )}

              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-foreground text-base">{plan.name}</h3>
                  <p className="text-xs text-muted-foreground">{plan.subtitle}</p>
                </div>
              </div>

              <div className="mb-5">
                <div className="flex items-baseline gap-1">
                  <span className="font-display font-black text-3xl text-foreground">
                    {displayPrice}
                  </span>
                  <span className="text-sm text-muted-foreground">{perPeriod}</span>
                </div>
                {plan.id !== "free" && interval === "annual" && (
                  <p className="text-xs text-emerald-400 mt-0.5">
                    Billed annually · {annualSavingsPct}% off monthly price
                  </p>
                )}
              </div>

              <ul className="space-y-2.5 mb-6 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{f}</span>
                  </li>
                ))}
              </ul>

              <button
                type="button"
                onClick={() => handleUpgrade(plan.id as SubscriptionTier)}
                disabled={isCurrent || plan.id === "free" || isLoading}
                className={cn(
                  "w-full py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2",
                  isCurrent || plan.id === "free"
                    ? "bg-border/30 text-muted-foreground cursor-default"
                    : plan.highlighted
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "border border-primary/40 text-primary hover:bg-primary/10",
                  isLoading && "opacity-70 cursor-wait"
                )}
              >
                {isLoading ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Redirecting…</>
                ) : isCurrent ? "Current Plan"
                  : plan.id === "free" ? "Free Forever"
                  : plan.cta}
              </button>
            </div>
          );
        })}
      </div>

      {/* ── Enterprise — contact-only ── */}
      <div className="rounded-2xl border border-primary/30 bg-primary/5 p-6 md:p-7">
        <div className="flex flex-col md:flex-row md:items-center gap-5 md:gap-8">
          <div className="flex items-start gap-3 md:w-1/3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-display font-bold text-foreground text-base">Enterprise</h3>
              <p className="text-xs text-muted-foreground">For institutions & teams at scale</p>
              <p className="font-display font-black text-2xl text-foreground mt-2">
                Custom<span className="text-sm font-normal text-muted-foreground"> pricing</span>
              </p>
            </div>
          </div>

          <ul className="grid sm:grid-cols-2 gap-x-5 gap-y-2 flex-1">
            {[
              "Bulk seats for your whole team",
              "One invite link — no individual applications",
              "Organisation clarity dashboard",
              "Centralised invoice billing",
            ].map((f) => (
              <li key={f} className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span className="text-muted-foreground">{f}</span>
              </li>
            ))}
          </ul>

          <a
            href="/institutions"
            className="md:w-auto w-full text-center py-2.5 px-6 rounded-xl text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors whitespace-nowrap"
          >
            Contact sales
          </a>
        </div>
      </div>

      <p className="text-center text-xs text-muted-foreground">
        Secure payment · Cancel any time · Questions?{" "}
        <a href="mailto:support@clarityos.ai" className="underline underline-offset-2 hover:text-foreground">
          support@clarityos.ai
        </a>
      </p>
    </div>
  );
}
