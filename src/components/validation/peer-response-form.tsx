"use client";

// Public 360 validation form — a colleague rates the learner across the 5 BGC
// dimensions. No login required.

import { useState } from "react";
import { Loader2, CheckCircle2 } from "lucide-react";

const DIMENSIONS: { id: string; label: string }[] = [
  { id: "strategic_direction", label: "Sets clear strategic direction" },
  { id: "people_clarity", label: "Creates role clarity and accountability" },
  { id: "systems_processes", label: "Builds systems and processes that work" },
  { id: "structural_clarity", label: "Designs sound organisational structure" },
  { id: "leadership_mastery", label: "Leads with self-mastery and presence" },
];

const RATINGS = [
  { v: 1, label: "Rarely" },
  { v: 2, label: "Sometimes" },
  { v: 3, label: "Often" },
  { v: 4, label: "Consistently" },
  { v: 5, label: "Exceptionally" },
];

export function PeerResponseForm({
  validatorId,
  learnerName,
}: {
  validatorId: string;
  learnerName: string;
}) {
  const [scores, setScores] = useState<Record<string, number>>({});
  const [observation, setObservation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const allRated = DIMENSIONS.every((d) => scores[d.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!allRated) {
      setError("Please rate all five dimensions.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/validate/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ validator_id: validatorId, dimension_scores: scores, observation }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Could not submit");
      setDone(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not submit");
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="bg-card border border-border/50 rounded-3xl p-8 text-center">
        <CheckCircle2 className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
        <h2 className="font-display text-xl font-bold">Thank you</h2>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
          Your validation of {learnerName} has been recorded. It contributes directly
          to their BGC Mastery Score™.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-card border border-border/50 rounded-3xl p-7 space-y-6">
      {DIMENSIONS.map((d) => (
        <div key={d.id}>
          <p className="text-sm font-medium text-foreground mb-2">{d.label}</p>
          <div className="grid grid-cols-5 gap-1.5">
            {RATINGS.map((r) => {
              const active = scores[d.id] === r.v;
              return (
                <button
                  key={r.v}
                  type="button"
                  onClick={() => setScores((p) => ({ ...p, [d.id]: r.v }))}
                  className={`py-2 rounded-lg text-[11px] font-medium border transition-colors ${
                    active
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background text-muted-foreground border-border/60 hover:border-primary/40"
                  }`}
                >
                  {r.label}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      <div>
        <label className="text-sm font-medium text-foreground mb-2 block">
          One observation about their leadership <span className="text-muted-foreground/60 font-normal">(optional)</span>
        </label>
        <textarea
          value={observation}
          onChange={(e) => setObservation(e.target.value)}
          rows={3}
          placeholder="What is one thing they do well, or one thing that would unlock their next level?"
          className="w-full px-3.5 py-2.5 rounded-lg bg-background border border-border/60 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors resize-none"
        />
      </div>

      {error && <p className="text-xs text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="btn-gold w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm transition-colors disabled:opacity-50"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        {loading ? "Submitting…" : "Submit validation"}
      </button>
    </form>
  );
}
