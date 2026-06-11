// ─────────────────────────────────────────────────────────────────────────────
// AscendMentor AI — Subscription Plan Definitions
// Amounts in cents/kobo (Paystack lowest denomination)
// Update display prices and amounts to match your Paystack dashboard plans.
// ─────────────────────────────────────────────────────────────────────────────

import type { SubscriptionTier } from "@/types/platform";

export type PaymentProvider = "paystack" | "flutterwave" | "mpesa";

export interface SubscriptionPlan {
  id: SubscriptionTier;
  name: string;
  subtitle: string;
  display_monthly: string;
  display_annual: string;
  amount_monthly: number;   // USD cents (Paystack / Flutterwave)
  amount_annual: number;
  amount_monthly_kes: number; // whole KES (M-Pesa)
  amount_annual_kes: number;
  display_monthly_kes: string;
  display_annual_kes: string;
  currency: string;
  highlighted: boolean;
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

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: "free",
    name: "Clarity Seeker",
    subtitle: "Begin your mastery journey",
    display_monthly: "Free",
    display_annual: "Free",
    amount_monthly: 0,
    amount_annual: 0,
    amount_monthly_kes: 0,
    amount_annual_kes: 0,
    display_monthly_kes: "Free",
    display_annual_kes: "Free",
    currency: "USD",
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
    display_monthly: "$49",
    display_annual: "$399",
    amount_monthly: 4900,
    amount_annual: 39900,
    amount_monthly_kes: 6500,
    amount_annual_kes: 52000,
    display_monthly_kes: "KES 6,500",
    display_annual_kes: "KES 52,000",
    currency: "USD",
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
    display_monthly: "$99",
    display_annual: "$799",
    amount_monthly: 9900,
    amount_annual: 79900,
    amount_monthly_kes: 13000,
    amount_annual_kes: 105000,
    display_monthly_kes: "KES 13,000",
    display_annual_kes: "KES 105,000",
    currency: "USD",
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
];

export function getPlanById(id: SubscriptionTier): SubscriptionPlan {
  return SUBSCRIPTION_PLANS.find((p) => p.id === id) ?? SUBSCRIPTION_PLANS[0];
}
