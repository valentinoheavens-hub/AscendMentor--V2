"use client";

// ─────────────────────────────────────────────────────────────────────────────
// ClarityOS — 5-Step Onboarding Wizard
// Directly derived from BGC Beta Screening Questions (doc 03).
// Each step saves immediately so back-navigation preserves data.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { Loader2, ArrowLeft, ArrowRight, Building2, MapPin, MessageSquareText, History, Target } from "lucide-react";

import { StepIndicator } from "@/components/onboarding/step-indicator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  step1Schema,
  step2Schema,
  step3Schema,
  step4Schema,
  step5Schema,
  type Step1Input,
  type Step2Input,
  type Step3Input,
  type Step4Input,
  type Step5Input,
} from "@/lib/validations/onboarding";
import {
  saveOnboardingStep1,
  saveOnboardingStep2,
  saveOnboardingStep3,
  saveOnboardingStep4,
  completeOnboarding,
} from "@/lib/actions/onboarding";

// ── Step metadata ────────────────────────────────────────────────────────────
const STEPS = [
  { label: "Profile", icon: Building2 },
  { label: "Organisation", icon: MapPin },
  { label: "Challenge", icon: MessageSquareText },
  { label: "History", icon: History },
  { label: "Success", icon: Target },
];

const STEP_LABELS = STEPS.map((s) => s.label);

// ── Slide animation variants ─────────────────────────────────────────────────
const slideVariants = {
  enter: (dir: number) => ({
    x: dir > 0 ? 60 : -60,
    opacity: 0,
  }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({
    x: dir > 0 ? -60 : 60,
    opacity: 0,
  }),
};

// ── Country list (Africa-focused) ─────────────────────────────────────────────
const AFRICAN_COUNTRIES = [
  "Nigeria", "South Africa", "Kenya", "Ghana", "Ethiopia", "Tanzania",
  "Uganda", "Rwanda", "Zambia", "Zimbabwe", "Senegal", "Ivory Coast",
  "Cameroon", "Angola", "Mozambique", "Namibia", "Botswana", "Malawi",
  "Egypt", "Morocco", "Tunisia", "Algeria", "Sudan", "Somalia",
  "Democratic Republic of Congo", "Republic of Congo", "Gabon",
  "Sierra Leone", "Liberia", "Togo", "Benin", "Niger", "Mali",
  "Burkina Faso", "Guinea", "Mauritius", "Seychelles", "Eswatini",
  "Lesotho", "Gambia", "Guinea-Bissau", "Cape Verde", "Eritrea",
  "Djibouti", "Comoros", "Madagascar", "Other",
];

// ─────────────────────────────────────────────────────────────────────────────
// Sub-forms
// ─────────────────────────────────────────────────────────────────────────────

function Step1Form({
  onNext,
  isPending,
}: {
  onNext: (data: Step1Input) => void;
  isPending: boolean;
}) {
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<Step1Input>({
    resolver: zodResolver(step1Schema),
  });

  return (
    <form id="step-form" onSubmit={handleSubmit(onNext)} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="full_name">Your full name</Label>
        <Input id="full_name" placeholder="Dr. Valentino Heavens" {...register("full_name")} />
        {errors.full_name && <p className="text-destructive text-sm">{errors.full_name.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="role_title">Your role / title</Label>
        <Input id="role_title" placeholder="Founder & CEO" {...register("role_title")} />
        {errors.role_title && <p className="text-destructive text-sm">{errors.role_title.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="organisation_name">Organisation name</Label>
        <Input id="organisation_name" placeholder="Blackbelt Global Consulting" {...register("organisation_name")} />
        {errors.organisation_name && <p className="text-destructive text-sm">{errors.organisation_name.message}</p>}
      </div>

      <div className="space-y-2">
        <Label>Organisation size</Label>
        <Select onValueChange={(v) => setValue("organisation_size", v as Step1Input["organisation_size"])}>
          <SelectTrigger>
            <SelectValue placeholder="How many people?" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1-5">1–5 people (solopreneur / micro)</SelectItem>
            <SelectItem value="6-20">6–20 people (small team)</SelectItem>
            <SelectItem value="21-100">21–100 people (growing)</SelectItem>
            <SelectItem value="100+">100+ people (established)</SelectItem>
          </SelectContent>
        </Select>
        {errors.organisation_size && <p className="text-destructive text-sm">{errors.organisation_size.message}</p>}
      </div>
    </form>
  );
}

function Step2Form({
  onNext,
  isPending,
}: {
  onNext: (data: Step2Input) => void;
  isPending: boolean;
}) {
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<Step2Input>({
    resolver: zodResolver(step2Schema),
  });

  return (
    <form id="step-form" onSubmit={handleSubmit(onNext)} className="space-y-5">
      <div className="space-y-2">
        <Label>How long have you been running this organisation?</Label>
        <Select onValueChange={(v) => setValue("years_running", v as Step2Input["years_running"])}>
          <SelectTrigger>
            <SelectValue placeholder="Select a range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Less than 1 year">Less than 1 year</SelectItem>
            <SelectItem value="1–3 years">1–3 years</SelectItem>
            <SelectItem value="3–7 years">3–7 years</SelectItem>
            <SelectItem value="7+ years">7+ years</SelectItem>
          </SelectContent>
        </Select>
        {errors.years_running && <p className="text-destructive text-sm">{errors.years_running.message}</p>}
      </div>

      <div className="space-y-2">
        <Label>Country</Label>
        <Select onValueChange={(v) => setValue("country", v as string)}>
          <SelectTrigger>
            <SelectValue placeholder="Select your country" />
          </SelectTrigger>
          <SelectContent className="max-h-60">
            {AFRICAN_COUNTRIES.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.country && <p className="text-destructive text-sm">{errors.country.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone_number">WhatsApp number</Label>
        <p className="text-xs text-muted-foreground">
          Your BGC AI coach will send you weekly prompts via WhatsApp. Include country code (e.g. +234…).
        </p>
        <Input
          id="phone_number"
          type="tel"
          placeholder="+234 801 234 5678"
          {...register("phone_number")}
        />
        {errors.phone_number && <p className="text-destructive text-sm">{errors.phone_number.message}</p>}
      </div>
    </form>
  );
}

function Step3Form({
  onNext,
  isPending,
}: {
  onNext: (data: Step3Input) => void;
  isPending: boolean;
}) {
  const { register, watch, handleSubmit, formState: { errors } } = useForm<Step3Input>({
    resolver: zodResolver(step3Schema),
  });
  const value = watch("initial_challenge") ?? "";

  return (
    <form id="step-form" onSubmit={handleSubmit(onNext)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="initial_challenge">
          What is the single biggest challenge limiting your business performance right now?
        </Label>
        <p className="text-sm text-muted-foreground">
          Be as specific as possible. This shapes your personalised BGC coaching plan.
        </p>
        <Textarea
          id="initial_challenge"
          rows={6}
          placeholder="e.g. I struggle to hold my team accountable without micromanaging. Deadlines slip, quality varies, and I end up doing things myself to ensure they're done right…"
          className="resize-none"
          {...register("initial_challenge")}
        />
        <div className="flex justify-between items-center">
          {errors.initial_challenge
            ? <p className="text-destructive text-sm">{errors.initial_challenge.message}</p>
            : <span />
          }
          <span className={`text-xs ${value.length > 1800 ? "text-destructive" : "text-muted-foreground"}`}>
            {value.length} / 2000
          </span>
        </div>
      </div>
    </form>
  );
}

function Step4Form({
  onNext,
  isPending,
}: {
  onNext: (data: Step4Input) => void;
  isPending: boolean;
}) {
  const { register, watch, setValue, handleSubmit, formState: { errors } } = useForm<Step4Input>({
    resolver: zodResolver(step4Schema),
    defaultValues: { past_coaching: false },
  });
  const pastCoaching = watch("past_coaching");

  return (
    <form id="step-form" onSubmit={handleSubmit(onNext)} className="space-y-5">
      <div className="space-y-3">
        <Label>Have you worked with a business coach or mentor before?</Label>
        <div className="grid grid-cols-2 gap-3">
          {([
            { value: true as const, label: "Yes, I have" },
            { value: false as const, label: "No, first time" },
          ] as const).map((opt) => (
            <button
              key={String(opt.value)}
              type="button"
              onClick={() => setValue("past_coaching", opt.value)}
              className={`rounded-lg border-2 px-4 py-3 text-sm font-medium text-left transition-all duration-200 ${
                pastCoaching === opt.value
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:border-primary/50"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        {errors.past_coaching && <p className="text-destructive text-sm">{errors.past_coaching.message}</p>}
      </div>

      {pastCoaching && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
          className="space-y-2 overflow-hidden"
        >
          <Label htmlFor="past_coaching_outcome">
            What was the outcome? What worked — and what didn&apos;t?
          </Label>
          <Textarea
            id="past_coaching_outcome"
            rows={4}
            placeholder="e.g. We made progress on accountability systems but the coach didn't understand the African business context…"
            className="resize-none"
            {...register("past_coaching_outcome")}
          />
          {errors.past_coaching_outcome && (
            <p className="text-destructive text-sm">{errors.past_coaching_outcome.message}</p>
          )}
        </motion.div>
      )}
    </form>
  );
}

function Step5Form({
  onFinish,
  isPending,
}: {
  onFinish: (data: Step5Input) => void;
  isPending: boolean;
}) {
  const { register, watch, handleSubmit, formState: { errors } } = useForm<Step5Input>({
    resolver: zodResolver(step5Schema),
  });
  const value = watch("success_criteria") ?? "";

  return (
    <form id="step-form" onSubmit={handleSubmit(onFinish)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="success_criteria">
          90 days from now, what would success look like for you and your business?
        </Label>
        <p className="text-sm text-muted-foreground">
          Paint the picture clearly. This becomes your Day 90 north star inside ClarityOS.
        </p>
        <Textarea
          id="success_criteria"
          rows={7}
          placeholder="e.g. My team is running key operations without daily input from me. Revenue has grown 30%. I have clear systems for hiring and I'm spending more time on strategy than firefighting…"
          className="resize-none"
          {...register("success_criteria")}
        />
        <div className="flex justify-between items-center">
          {errors.success_criteria
            ? <p className="text-destructive text-sm">{errors.success_criteria.message}</p>
            : <span />
          }
          <span className={`text-xs ${value.length > 1800 ? "text-destructive" : "text-muted-foreground"}`}>
            {value.length} / 2000
          </span>
        </div>
      </div>
    </form>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Wizard shell
// ─────────────────────────────────────────────────────────────────────────────

const STEP_HEADINGS = [
  {
    title: "Let's start with you",
    description: "Tell us about yourself and your organisation.",
  },
  {
    title: "Your organisation",
    description: "Help us understand your context — we speak African business.",
  },
  {
    title: "Your biggest challenge",
    description: "Clarity on the problem is the first act of leadership.",
  },
  {
    title: "Your coaching history",
    description: "Understanding your past helps us calibrate your journey.",
  },
  {
    title: "Your definition of success",
    description: "What does transformation look like for you in 90 days?",
  },
];

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [isPending, startTransition] = useTransition();

  const goNext = () => {
    setDirection(1);
    setStep((s) => s + 1);
  };

  const goBack = () => {
    setDirection(-1);
    setStep((s) => s - 1);
  };

  const handleStep1 = (data: Step1Input) => {
    startTransition(async () => {
      const result = await saveOnboardingStep1(data);
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      goNext();
    });
  };

  const handleStep2 = (data: Step2Input) => {
    startTransition(async () => {
      const result = await saveOnboardingStep2(data);
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      goNext();
    });
  };

  const handleStep3 = (data: Step3Input) => {
    startTransition(async () => {
      const result = await saveOnboardingStep3(data);
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      goNext();
    });
  };

  const handleStep4 = (data: Step4Input) => {
    startTransition(async () => {
      const result = await saveOnboardingStep4(data);
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      goNext();
    });
  };

  const handleStep5 = (data: Step5Input) => {
    startTransition(async () => {
      // completeOnboarding redirects to /assessment on success
      const result = await completeOnboarding(data);
      if (result?.error) {
        toast.error(result.error);
      }
    });
  };

  const heading = STEP_HEADINGS[step - 1];
  const StepIcon = STEPS[step - 1].icon;

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Step indicator */}
      <StepIndicator steps={STEP_LABELS} currentStep={step} className="px-2" />

      {/* Card */}
      <Card className="border-border/50 bg-card shadow-xl overflow-hidden">
        <CardHeader className="pb-4 border-b border-border/40">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <StepIcon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="font-display text-xl">{heading.title}</CardTitle>
            </div>
          </div>
          <CardDescription className="ml-12">{heading.description}</CardDescription>
        </CardHeader>

        <CardContent className="pt-6 pb-6">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25, ease: "easeInOut" }}
            >
              {step === 1 && <Step1Form onNext={handleStep1} isPending={isPending} />}
              {step === 2 && <Step2Form onNext={handleStep2} isPending={isPending} />}
              {step === 3 && <Step3Form onNext={handleStep3} isPending={isPending} />}
              {step === 4 && <Step4Form onNext={handleStep4} isPending={isPending} />}
              {step === 5 && <Step5Form onFinish={handleStep5} isPending={isPending} />}
            </motion.div>
          </AnimatePresence>
        </CardContent>

        {/* Footer nav */}
        <div className="px-6 pb-6 flex items-center justify-between border-t border-border/40 pt-4">
          <Button
            type="button"
            variant="ghost"
            onClick={goBack}
            disabled={step === 1 || isPending}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>

          <div className="flex gap-1.5">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                  i + 1 === step
                    ? "bg-primary w-4"
                    : i + 1 < step
                    ? "bg-primary"
                    : "bg-border"
                }`}
              />
            ))}
          </div>

          <Button
            type="submit"
            form="step-form"
            disabled={isPending}
            className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving…
              </>
            ) : step === 5 ? (
              <>
                Complete
                <ArrowRight className="h-4 w-4" />
              </>
            ) : (
              <>
                Continue
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* Step counter */}
      <p className="text-center text-xs text-muted-foreground">
        Step {step} of {STEPS.length} — your answers are saved automatically
      </p>
    </div>
  );
}
