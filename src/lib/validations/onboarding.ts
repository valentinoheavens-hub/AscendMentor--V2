import { z } from "zod";

// ── Step 1: Who are you? ─────────────────────────────────────────────────────
export const step1Schema = z.object({
  full_name: z.string().min(2, "Please enter your full name"),
  role_title: z.string().min(2, "Please enter your role or title"),
  organisation_name: z.string().min(2, "Please enter your organisation name"),
  organisation_size: z.enum(["1-5", "6-20", "21-100", "100+"], {
    message: "Please select your organisation size",
  }),
});

// ── Step 2: Your organisation ────────────────────────────────────────────────
export const step2Schema = z.object({
  years_running: z.enum(
    ["Less than 1 year", "1–3 years", "3–7 years", "7+ years"],
    { message: "Please select how long you have been running it" }
  ),
  country: z.string().min(2, "Please enter your country"),
  phone_number: z
    .string()
    .min(7, "Please enter a valid WhatsApp number")
    .regex(/^\+?[0-9\s\-()]{7,20}$/, "Please enter a valid phone number"),
});

// ── Step 3: Your biggest challenge ──────────────────────────────────────────
export const step3Schema = z.object({
  initial_challenge: z
    .string()
    .min(30, "Please describe your challenge in at least 30 characters")
    .max(2000, "Please keep it under 2000 characters"),
});

// ── Step 4: Coaching history ─────────────────────────────────────────────────
export const step4Schema = z.object({
  past_coaching: z.boolean(),
  past_coaching_outcome: z.string().max(1000).optional(),
});

// ── Step 5: Your definition of success ──────────────────────────────────────
export const step5Schema = z.object({
  success_criteria: z
    .string()
    .min(30, "Please describe what success looks like in at least 30 characters")
    .max(2000, "Please keep it under 2000 characters"),
});

export type Step1Input = z.infer<typeof step1Schema>;
export type Step2Input = z.infer<typeof step2Schema>;
export type Step3Input = z.infer<typeof step3Schema>;
export type Step4Input = z.infer<typeof step4Schema>;
export type Step5Input = z.infer<typeof step5Schema>;
