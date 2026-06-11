"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface MasteryRingProps {
  score: number;         // 0–100
  beltName: string;
  beltSubtitle: string;
  beltColor: string;
  size?: number;
}

export function MasteryRing({
  score,
  beltName,
  beltSubtitle,
  beltColor,
  size = 200,
}: MasteryRingProps) {
  const circleRef = useRef<SVGCircleElement>(null);

  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  useEffect(() => {
    const el = circleRef.current;
    if (!el) return;
    // Start at full offset (empty), animate to target
    el.style.strokeDashoffset = `${circumference}`;
    requestAnimationFrame(() => {
      el.style.transition = "stroke-dashoffset 1.4s cubic-bezier(0.4,0,0.2,1)";
      el.style.strokeDashoffset = `${offset}`;
    });
  }, [circumference, offset]);

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          {/* Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="hsl(var(--border))"
            strokeWidth={strokeWidth}
          />
          {/* Progress */}
          <circle
            ref={circleRef}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={beltColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference}
          />
        </svg>
        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-4xl font-bold text-foreground leading-none">
            {score.toFixed(0)}
          </span>
          <span className="text-xs text-muted-foreground mt-1 tracking-wide uppercase font-medium">
            /100
          </span>
        </div>
      </div>
      <div className="text-center">
        <p className="font-display font-bold text-lg leading-tight" style={{ color: beltColor }}>
          {beltName}
        </p>
        <p className="text-xs text-muted-foreground">{beltSubtitle}</p>
      </div>
    </div>
  );
}
