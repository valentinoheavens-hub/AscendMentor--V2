"use client";

import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface StepIndicatorProps {
  steps: string[];
  currentStep: number; // 1-indexed
  className?: string;
}

export function StepIndicator({ steps, currentStep, className }: StepIndicatorProps) {
  return (
    <nav className={cn("w-full", className)} aria-label="Onboarding progress">
      <ol className="flex items-center justify-between relative">
        {/* Connecting line behind the dots */}
        <div
          className="absolute top-4 left-0 right-0 h-px bg-border -z-10"
          aria-hidden="true"
        />
        {/* Progress fill */}
        <div
          className="absolute top-4 left-0 h-px bg-primary transition-all duration-500 -z-10"
          style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
          aria-hidden="true"
        />

        {steps.map((label, index) => {
          const stepNumber = index + 1;
          const isDone = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;

          return (
            <li
              key={label}
              className="flex flex-col items-center gap-2"
              aria-current={isCurrent ? "step" : undefined}
            >
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-semibold transition-all duration-300 bg-background",
                  {
                    "border-primary bg-primary text-primary-foreground": isDone,
                    "border-primary text-primary ring-4 ring-primary/20": isCurrent,
                    "border-border text-muted-foreground": !isDone && !isCurrent,
                  }
                )}
              >
                {isDone ? (
                  <Check className="h-4 w-4" strokeWidth={3} />
                ) : (
                  stepNumber
                )}
              </div>
              <span
                className={cn(
                  "hidden sm:block text-xs font-medium text-center max-w-[80px] leading-tight",
                  {
                    "text-primary": isCurrent || isDone,
                    "text-muted-foreground": !isDone && !isCurrent,
                  }
                )}
              >
                {label}
              </span>
            </li>
          );
        })}
      </ol>

      {/* Mobile: current step label */}
      <p className="sm:hidden mt-3 text-center text-sm font-medium text-primary">
        Step {currentStep} of {steps.length}: {steps[currentStep - 1]}
      </p>
    </nav>
  );
}
