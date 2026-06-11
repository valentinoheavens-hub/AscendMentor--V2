"use client";

interface ScoreComponent {
  label: string;
  abbr: string;
  score: number;
  max: number;
  color: string;
}

interface ScoreBreakdownProps {
  components: ScoreComponent[];
}

export function ScoreBreakdown({ components }: ScoreBreakdownProps) {
  return (
    <div className="space-y-3">
      {components.map((c) => {
        const pct = Math.min((c.score / c.max) * 100, 100);
        return (
          <div key={c.abbr} className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span
                  className="inline-block w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: c.color }}
                />
                <span className="text-muted-foreground">{c.label}</span>
              </div>
              <span className="font-medium text-foreground tabular-nums">
                {c.score.toFixed(1)}<span className="text-muted-foreground">/{c.max}</span>
              </span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-border/50 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${pct}%`, backgroundColor: c.color }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
