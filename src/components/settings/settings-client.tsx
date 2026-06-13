"use client";

import { useState } from "react";
import Link from "next/link";
import { Save, LogOut, Sparkles } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

interface Props {
  email: string;
  fullName: string;
  firstName: string;
  organisation: string;
  roleTitle: string;
  country: string;
  subscriptionTier: string;
  subscriptionStatus: string;
}

const TIER_LABELS: Record<string, string> = {
  free: "Free",
  beta_90: "Beta (90-day)",
  individual: "Individual",
  professional: "Professional",
  enterprise: "Enterprise",
};

export function SettingsClient({
  email,
  fullName,
  firstName,
  organisation,
  roleTitle,
  country,
  subscriptionTier,
  subscriptionStatus,
}: Props) {
  const [form, setForm] = useState({ fullName, firstName, organisation, roleTitle, country });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSaved(false);

    try {
      const res = await fetch("/api/settings/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to save");
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  const set = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }));

  const isPaid = subscriptionTier !== "free";

  return (
    <div className="space-y-6">
      {/* Subscription */}
      <div className="bg-card border border-border/40 rounded-2xl p-5">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Subscription
        </h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-foreground">
              {TIER_LABELS[subscriptionTier] ?? subscriptionTier}
            </p>
            <p className="text-xs text-muted-foreground capitalize">{subscriptionStatus}</p>
          </div>
          {!isPaid && (
            <Link
              href="/upgrade"
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Upgrade
            </Link>
          )}
        </div>
      </div>

      {/* Appearance */}
      <div className="bg-card border border-border/40 rounded-2xl p-5">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Appearance
        </h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-foreground">Theme</p>
            <p className="text-xs text-muted-foreground">Switch between light and dark mode</p>
          </div>
          <ThemeToggle className="border border-border/60" />
        </div>
      </div>

      {/* Profile form */}
      <div className="bg-card border border-border/40 rounded-2xl p-5">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
          Profile
        </h2>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Email</label>
            <input
              type="email"
              value={email}
              disabled
              className="w-full px-3 py-2 rounded-lg bg-background border border-border/40 text-sm text-muted-foreground cursor-not-allowed"
            />
            <p className="text-[11px] text-muted-foreground mt-1">Email cannot be changed here.</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">First name</label>
              <input
                type="text"
                value={form.firstName}
                onChange={set("firstName")}
                className="w-full px-3 py-2 rounded-lg bg-background border border-border/60 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Full name</label>
              <input
                type="text"
                value={form.fullName}
                onChange={set("fullName")}
                className="w-full px-3 py-2 rounded-lg bg-background border border-border/60 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Organisation</label>
            <input
              type="text"
              value={form.organisation}
              onChange={set("organisation")}
              className="w-full px-3 py-2 rounded-lg bg-background border border-border/60 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Role / Title</label>
              <input
                type="text"
                value={form.roleTitle}
                onChange={set("roleTitle")}
                className="w-full px-3 py-2 rounded-lg bg-background border border-border/60 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Country</label>
              <input
                type="text"
                value={form.country}
                onChange={set("country")}
                className="w-full px-3 py-2 rounded-lg bg-background border border-border/60 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors"
              />
            </div>
          </div>

          {error && <p className="text-xs text-red-400">{error}</p>}
          {saved && <p className="text-xs text-green-500">Changes saved.</p>}

          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </form>
      </div>

      {/* Danger zone */}
      <div className="bg-card border border-destructive/20 rounded-2xl p-5">
        <h2 className="text-xs font-semibold text-destructive/80 uppercase tracking-wider mb-3">
          Account
        </h2>
        <form action="/auth/signout" method="POST">
          <button
            type="submit"
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border/60 text-sm text-muted-foreground hover:text-destructive hover:border-destructive/40 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </form>
      </div>
    </div>
  );
}
