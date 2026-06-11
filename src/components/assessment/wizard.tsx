"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, CheckCircle2, Loader2, Target, Users, Zap, Layers, TrendingUp } from "lucide-react";
import { ASSESSMENT_QUESTIONS, type AssessmentQuestion } from "@/constants/assessment-questions";
import { BGC_DIMENSIONS } from "@/constants/bgc-frameworks";
import { cn } from "@/lib/utils";
import type { AssessmentAnswer } from "@/types/platform";

// ── Dimension order + icons ───────────────────────────────────────────────────
const DIMENSION_ORDER = [
  "strategic_direction",
  "people_clarity",
  "systems_processes",
  "structural_clarity",
  "leadership_mastery",
] as const;

const DIMENSION_ICONS = {
  strategic_direction: Target,
  people_clarity: Users,
  systems_processes: Zap,
  structural_clarity: Layers,
  leadership_mastery: TrendingUp,
};

// Group questions by dimension in the canonical order
const STEPS: AssessmentQuestion[][] = DIMENSION_ORDER.map((dimId) =>
  ASSESSMENT_QUESTIONS.filter((q) => q.dimension_id === dimId)
);

const TOTAL_STEPS = STEPS.length; // 5
const TOTAL_QUESTIONS = ASSESSMENT_QUESTIONS.length; // 30

// ── Option Card ───────────────────────────────────────────────────────────────
function OptionCard({
  text,
  score,
  selected,
  dimColor,
  onClick,
}: {
  text: string;
  score: number;
  selected: boolean;
  dimColor: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full text-left px-4 py-3.5 rounded-xl border text-sm transition-all duration-150",
        "hover:border-white/20 hover:bg-white/5",
        selected
          ? "border-current bg-current/10 font-medium text-foreground"
          : "border-border/40 bg-card/60 text-muted-foreground"
      )}
      style={selected ? { borderColor: dimColor, backgroundColor: `${dimColor}14` } : undefined}
    >
      <div className="flex items-start gap-3">
        <span
          className={cn(
            "mt-0.5 flex-shrink-0 w-4 h-4 rounded-full border-2 transition-colors",
            selected ? "border-current" : "border-border/60"
          )}
          style={selected ? { borderColor: dimColor, backgroundColor: dimColor } : undefined}
        />
        <span>{text}</span>
      </div>
    </button>
  );
}

// ── Main Wizard ───────────────────────────────────────────────────────────────
export function AssessmentWizard({ assessmentRound }: { assessmentRound: number }) {
  const router = useRouter();
  const [step, setStep] = useState(0); // 0-4
  const [answers, setAnswers] = useState<Record<string, { score: number; text: string }>>({});
  const [submitting, setSubmitting] = useState(false);

  const currentQuestions = STEPS[step];
  const dimId = DIMENSION_ORDER[step];
  const dim = BGC_DIMENSIONS.find((d) => d.id === dimId)!;
  const Icon = DIMENSION_ICONS[dimId];

  // Total answered so far
  const totalAnswered = Object.keys(answers).length;
  const progressPct = Math.round((totalAnswered / TOTAL_QUESTIONS) * 100);

  // Questions answered in current step
  const stepAnswered = currentQuestions.filter((q) => answers[q.id]).length;
  const stepComplete = stepAnswered === currentQuestions.length;

  const setAnswer = useCallback(
    (questionId: string, score: number, text: string) => {
      setAnswers((prev) => ({ ...prev, [questionId]: { score, text } }));
    },
    []
  );

  const handleNext = () => {
    if (step < TOTAL_STEPS - 1) setStep((s) => s + 1);
  };

  const handleBack = () => {
    if (step > 0) setStep((s) => s - 1);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const payload: AssessmentAnswer[] = Object.entries(answers).map(
        ([question_id, { score, text }]) => ({
          question_id,
          score,
          option_text: text,
        })
      );

      const res = await fetch("/api/assessment/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: payload }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "Submission failed. Please try again.");
        setSubmitting(false);
        return;
      }

      const belt = data.clarity_profile?.belt_tier?.replace("_", " ") ?? "Seeker";
      const overallPct = data.clarity_profile?.overall_pct ?? 0;
      toast.success(`Assessment complete! ${overallPct}% overall — ${belt} tier`);
      router.push("/dashboard");
      router.refresh();
    } catch {
      toast.error("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  };

  const isLastStep = step === TOTAL_STEPS - 1;

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-up">

      {/* ── Overall Progress ── */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{totalAnswered} of {TOTAL_QUESTIONS} questions answered</span>
          <span>{progressPct}%</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-border/40 overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* ── Step pills ── */}
      <div className="flex items-center gap-2">
        {DIMENSION_ORDER.map((dId, i) => {
          const d = BGC_DIMENSIONS.find((x) => x.id === dId)!;
          const done = STEPS[i].every((q) => answers[q.id]);
          const active = i === step;
          return (
            <button
              key={dId}
              type="button"
              onClick={() => setStep(i)}
              className={cn(
                "flex-1 h-1.5 rounded-full transition-all duration-200",
                active ? "opacity-100" : done ? "opacity-70" : "opacity-25"
              )}
              style={{ backgroundColor: done || active ? d.color : undefined }}
              title={d.name}
            />
          );
        })}
      </div>

      {/* ── Dimension Header ── */}
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `${dim.color}18` }}
        >
          <Icon className="h-5 w-5" style={{ color: dim.color }} />
        </div>
        <div>
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
            Dimension {step + 1} of {TOTAL_STEPS}
          </p>
          <h2 className="font-display font-bold text-lg text-foreground leading-tight">
            {dim.name}
          </h2>
        </div>
        {assessmentRound > 1 && (
          <span className="ml-auto text-xs text-muted-foreground border border-border/40 rounded-full px-2 py-0.5">
            Round {assessmentRound}
          </span>
        )}
      </div>

      {/* ── Questions ── */}
      <div className="space-y-8">
        {currentQuestions.map((question, qi) => {
          const answered = answers[question.id];
          return (
            <div key={question.id} className="space-y-3">
              <p className="text-sm font-medium text-foreground leading-relaxed">
                <span className="text-muted-foreground mr-2">Q{qi + 1}.</span>
                {question.question}
              </p>
              <div className="space-y-2">
                {question.options.map((opt) => (
                  <OptionCard
                    key={opt.score}
                    text={opt.text}
                    score={opt.score}
                    selected={answered?.score === opt.score && answered?.text === opt.text}
                    dimColor={dim.color}
                    onClick={() => setAnswer(question.id, opt.score, opt.text)}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Navigation ── */}
      <div className="flex items-center justify-between pt-4 border-t border-border/30">
        <button
          type="button"
          onClick={handleBack}
          disabled={step === 0}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </button>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {stepAnswered === currentQuestions.length ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          ) : (
            <span>{stepAnswered}/{currentQuestions.length} answered</span>
          )}
        </div>

        {isLastStep ? (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!stepComplete || submitting}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Submitting…
              </>
            ) : (
              <>
                Submit Assessment
                <CheckCircle2 className="h-4 w-4" />
              </>
            )}
          </button>
        ) : (
          <button
            type="button"
            onClick={handleNext}
            disabled={!stepComplete}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
