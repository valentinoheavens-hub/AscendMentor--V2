"use client";

// Behavioural Evidence capture — log how you applied a BGC framework to a real
// situation. The coach scores the rigour and your Mastery Score moves.

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Sparkles, TrendingUp } from "lucide-react";

const DIMENSIONS = [
  { id: "strategic_direction", name: "Strategic Direction" },
  { id: "people_clarity", name: "People Clarity" },
  { id: "systems_processes", name: "Systems & Processes" },
  { id: "structural_clarity", name: "Structural Clarity" },
  { id: "leadership_mastery", name: "Leadership Mastery" },
];

const FRAMEWORKS = [
  "The Clarity Mandate™",
  "Blackbelt OS™",
  "People · Systems · Structure™",
  "Blackbelt Delivery Framework™ (BDF)",
  "BANT+F™",
];

interface ScoredEvidence {
  ai_quality_score: number | null;
  ai_feedback: string | null;
}

export function EvidenceClient() {
  const router = useRouter();
  const [form, setForm] = useState({
    dimension_id: "leadership_mastery",
    framework_applied: FRAMEWORKS[0],
    situation_described: "",
    action_taken: "",
    outcome: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ evidence: ScoredEvidence; delta: number } | null>(null);

  const set =
    (field: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch("/api/evidence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Could not log evidence");
      setResult({ evidence: json.evidence, delta: json.mastery?.score_velocity ?? 0 });
      setForm((prev) => ({ ...prev, situation_described: "", action_taken: "", outcome: "" }));
      router.refresh(); // refresh the server-rendered list + score
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not log evidence");
    } finally {
      setLoading(false);
    }
  };

  const inputCls =
    "w-full px-3.5 py-2.5 rounded-lg bg-background border border-border/60 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors";

  return (
    <div className="bg-card border border-border/40 rounded-2xl p-6">
      <h2 className="text-sm font-semibold text-foreground mb-1 flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-primary" />
        Log behavioural evidence
      </h2>
      <p className="text-xs text-muted-foreground mb-5">
        Record one real situation where you applied a BGC framework this week. The coach
        scores the rigour — and your Mastery Score moves.
      </p>

      {result && (
        <div className="mb-5 rounded-xl border border-primary/30 bg-primary/10 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-yellow-400 uppercase tracking-wider">
              Coach score
            </span>
            <span className="text-lg font-bold text-foreground">
              {result.evidence.ai_quality_score ?? "—"}<span className="text-muted-foreground text-sm font-normal">/100</span>
            </span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">{result.evidence.ai_feedback}</p>
          {result.delta > 0 && (
            <p className="mt-2 text-xs text-green-400 flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5" />
              Mastery Score +{result.delta}
            </p>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Dimension</label>
            <select value={form.dimension_id} onChange={set("dimension_id")} className={inputCls}>
              {DIMENSIONS.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Framework applied</label>
            <select value={form.framework_applied} onChange={set("framework_applied")} className={inputCls}>
              {FRAMEWORKS.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="text-xs text-muted-foreground mb-1.5 block">The situation</label>
          <textarea
            required
            value={form.situation_described}
            onChange={set("situation_described")}
            rows={2}
            placeholder="What was happening? Be specific — the decision, the person, the moment."
            className={`${inputCls} resize-none`}
          />
        </div>

        <div>
          <label className="text-xs text-muted-foreground mb-1.5 block">What you did</label>
          <textarea
            required
            value={form.action_taken}
            onChange={set("action_taken")}
            rows={2}
            placeholder="How did you apply the framework? What was the deliberate action?"
            className={`${inputCls} resize-none`}
          />
        </div>

        <div>
          <label className="text-xs text-muted-foreground mb-1.5 block">The outcome <span className="text-muted-foreground/60">(optional)</span></label>
          <textarea
            value={form.outcome}
            onChange={set("outcome")}
            rows={2}
            placeholder="What changed as a result?"
            className={`${inputCls} resize-none`}
          />
        </div>

        {error && <p className="text-xs text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="btn-gold w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm transition-colors disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {loading ? "Coach is scoring…" : "Log & score evidence"}
        </button>
      </form>
    </div>
  );
}
