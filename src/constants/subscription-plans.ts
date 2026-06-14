// ─────────────────────────────────────────────────────────────────────────────
// ClarityOS — Subscription Plan Definitions
//
// Naira (₦) is the PRIMARY currency — ClarityOS's core market is Nigeria, billed
// via Paystack. USD serves the diaspora (Flutterwave); KES serves Kenya (M-Pesa).
//
// Amounts are in each processor's smallest unit:
//   NGN → kobo (₦1 = 100)   USD → cents ($1 = 100)   KES → whole shillings
// ─────────────────────────────────────────────────────────────────────────────

import type { SubscriptionTier } from "@/types/platform";

export type PaymentProvider = "paystack" | "flutterwave" | "mpesa";
export type Currency = "NGN" | "USD" | "KES";

export interface PriceSet {
  monthly: number;
  annual: number;
  display_monthly: string;
  display_annual: string;
}

export interface SubscriptionPlan {
  id: SubscriptionTier;
  name: string;
  subtitle: string;
  /** Primary currency surfaced by default (NGN). */
  primary_currency: Currency;
  prices: { ngn: PriceSet; usd: PriceSet; kes: PriceSet };
  highlighted: boolean;
  /** Contact-sales tier — no self-serve checkout; pricing is custom. */
  contact_only?: boolean;
  cta: string;
  features: string[];
  limits: {
    coach_messages_per_month: number | null;
    assessments_per_year: number | null;
    peer_validators: number;
    whatsapp_access: boolean;
    learning_paths: boolean;
    export_reports: boolean;
  };
}

const FREE_PRICES: SubscriptionPlan["prices"] = {
  ngn: { monthly: 0, annual: 0, display_monthly: "Free", display_annual: "Free" },
  usd: { monthly: 0, annual: 0, display_monthly: "Free", display_annual: "Free" },
  kes: { monthly: 0, annual: 0, display_monthly: "Free", display_annual: "Free" },
};

const CUSTOM_PRICES: SubscriptionPlan["prices"] = {
  ngn: { monthly: 0, annual: 0, display_monthly: "Custom", display_annual: "Custom" },
  usd: { monthly: 0, annual: 0, display_monthly: "Custom", display_annual: "Custom" },
  kes: { monthly: 0, annual: 0, display_monthly: "Custom", display_annual: "Custom" },
};

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: "free",
    name: "Clarity Seeker",
    subtitle: "Begin your mastery journey",
    primary_currency: "NGN",
    prices: FREE_PRICES,
    highlighted: false,
    cta: "Current Plan",
    features: [
      "BGC Clarity Assessment™ (1×/year)",
      "5 BGC Coach messages/month",
      "Dashboard & Mastery Score ring",
      "Belt tier tracking",
    ],
    limits: {
      coach_messages_per_month: 5,
      assessments_per_year: 1,
      peer_validators: 0,
      whatsapp_access: false,
      learning_paths: false,
      export_reports: false,
    },
  },
  {
    id: "individual",
    name: "Clarity Builder",
    subtitle: "For the intentional leader",
    primary_currency: "NGN",
    prices: {
      // ₦75,000/mo · 2 months free annually
      ngn: { monthly: 7_500_000, annual: 75_000_000, display_monthly: "₦75,000", display_annual: "₦750,000" },
      usd: { monthly: 5000, annual: 50000, display_monthly: "$50", display_annual: "$500" },
      kes: { monthly: 6500, annual: 65000, display_monthly: "KES 6,500", display_annual: "KES 65,000" },
    },
    highlighted: true,
    cta: "Upgrade to Builder",
    features: [
      "Unlimited BGC Coach sessions",
      "Quarterly Clarity Assessments™",
      "Full 5-dimension Clarity Radar",
      "Weekly progress tracking & streaks",
      "2 peer validators",
      "Downloadable progress reports",
    ],
    limits: {
      coach_messages_per_month: null,
      assessments_per_year: 4,
      peer_validators: 2,
      whatsapp_access: false,
      learning_paths: true,
      export_reports: true,
    },
  },
  {
    id: "professional",
    name: "Black Belt Pro",
    subtitle: "For executives & teams",
    primary_currency: "NGN",
    prices: {
      // ₦180,000/mo · 2 months free annually
      ngn: { monthly: 18_000_000, annual: 180_000_000, display_monthly: "₦180,000", display_annual: "₦1,800,000" },
      usd: { monthly: 12000, annual: 120000, display_monthly: "$120", display_annual: "$1,200" },
      kes: { monthly: 15000, annual: 150000, display_monthly: "KES 15,000", display_annual: "KES 150,000" },
    },
    highlighted: false,
    cta: "Go Professional",
    features: [
      "Everything in Clarity Builder",
      "WhatsApp BGC Coach access",
      "Monthly 1:1 strategy session",
      "Up to 5 peer validators",
      "Team dashboard (up to 5 seats)",
      "Priority onboarding by Dr. Heavens",
    ],
    limits: {
      coach_messages_per_month: null,
      assessments_per_year: null,
      peer_validators: 5,
      whatsapp_access: true,
      learning_paths: true,
      export_reports: true,
    },
  },
  {
    id: "enterprise",
    name: "Enterprise",
    subtitle: "For institutions & teams at scale",
    primary_currency: "NGN",
    prices: CUSTOM_PRICES,
    highlighted: false,
    contact_only: true,
    cta: "Contact sales",
    features: [
      "Everything in Black Belt Pro",
      "Bulk seats for your whole leadership team (from ₦1.2M / 5+ seats)",
      "One invite link — members join instantly, no application",
      "Organisation clarity dashboard & team analytics",
      "Centralised invoice / bank-transfer billing",
      "Dedicated onboarding & priority support",
    ],
    limits: {
      coach_messages_per_month: null,
      assessments_per_year: null,
      peer_validators: 5,
      whatsapp_access: true,
      learning_paths: true,
      export_reports: true,
    },
  },
];

/** Which currency a given payment processor charges in. */
export function providerCurrency(provider: PaymentProvider): Currency {
  if (provider === "flutterwave") return "USD";
  if (provider === "mpesa") return "KES";
  return "NGN"; // paystack
}

/** Resolve the amount (smallest unit) + display string for a plan/currency/interval. */
export function planPrice(
  plan: SubscriptionPlan,
  currency: Currency,
  interval: "monthly" | "annual"
): { amount: number; display: string } {
  const set = plan.prices[currency.toLowerCase() as "ngn" | "usd" | "kes"];
  return interval === "annual"
    ? { amount: set.annual, display: set.display_annual }
    : { amount: set.monthly, display: set.display_monthly };
}

export function getPlanById(id: SubscriptionTier): SubscriptionPlan {
  return SUBSCRIPTION_PLANS.find((p) => p.id === id) ?? SUBSCRIPTION_PLANS[0];
}
