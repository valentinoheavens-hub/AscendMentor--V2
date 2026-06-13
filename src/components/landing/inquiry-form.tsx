"use client";

// Enterprise inquiry form — posts to /api/enterprise-inquiry.

import { useState } from "react";
import { Loader2, CheckCircle2, Send } from "lucide-react";

const TEAM_SIZES = ["5–10", "11–25", "26–50", "51–100", "100+"];

export function InquiryForm() {
  const [form, setForm] = useState({
    organisationName: "",
    contactName: "",
    contactEmail: "",
    phone: "",
    country: "",
    teamSize: "11–25",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const set =
    (field: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/enterprise-inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Could not submit inquiry");
      setDone(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not submit inquiry");
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="bg-card border border-border/50 rounded-3xl p-10 text-center">
        <CheckCircle2 className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
        <h3 className="font-display text-xl font-bold">Inquiry received</h3>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
          Thank you — our enterprise team will contact you within one business day
          to discuss seats, pricing, and rollout for your organisation.
        </p>
      </div>
    );
  }

  const inputCls =
    "w-full px-3.5 py-2.5 rounded-lg bg-background border border-border/60 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors";

  return (
    <form onSubmit={handleSubmit} className="bg-card border border-border/50 rounded-3xl p-7 space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-muted-foreground mb-1.5 block">Organisation *</label>
          <input required value={form.organisationName} onChange={set("organisationName")} placeholder="Acme Bank Ltd" className={inputCls} />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1.5 block">Contact person *</label>
          <input required value={form.contactName} onChange={set("contactName")} placeholder="Jane Okafor" className={inputCls} />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-muted-foreground mb-1.5 block">Work email *</label>
          <input required type="email" value={form.contactEmail} onChange={set("contactEmail")} placeholder="jane@acmebank.com" className={inputCls} />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1.5 block">Phone</label>
          <input value={form.phone} onChange={set("phone")} placeholder="+234 …" className={inputCls} />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-muted-foreground mb-1.5 block">Country</label>
          <input value={form.country} onChange={set("country")} placeholder="Nigeria" className={inputCls} />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1.5 block">Leadership team size</label>
          <select value={form.teamSize} onChange={set("teamSize")} className={inputCls}>
            {TEAM_SIZES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="text-xs text-muted-foreground mb-1.5 block">
          What are you hoping to achieve?
        </label>
        <textarea
          value={form.message}
          onChange={set("message")}
          rows={4}
          placeholder="e.g. We want to build leadership clarity across our 30-person management layer ahead of a regional expansion…"
          className={`${inputCls} resize-none`}
        />
      </div>

      {error && <p className="text-xs text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="btn-gold w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm transition-colors disabled:opacity-50"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        {loading ? "Sending…" : "Request enterprise access"}
      </button>
    </form>
  );
}
