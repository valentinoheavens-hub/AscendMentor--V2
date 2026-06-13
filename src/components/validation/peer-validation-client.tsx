"use client";

import { useState } from "react";
import { UserPlus, CheckCircle, Clock, XCircle, Mail, Copy, Check } from "lucide-react";

interface Validator {
  id: string;
  email: string;
  relationship: string;
  status: string;
  created_at: string;
}

interface Props {
  validators: Validator[];
  learnerId: string;
  userId: string;
}

const RELATIONSHIPS = [
  { value: "team_member", label: "Team Member" },
  { value: "direct_report", label: "Direct Report" },
  { value: "peer", label: "Peer / Colleague" },
  { value: "manager", label: "Manager / Supervisor" },
];

const STATUS_ICONS: Record<string, React.ReactNode> = {
  pending: <Clock className="h-4 w-4 text-yellow-500" />,
  completed: <CheckCircle className="h-4 w-4 text-green-500" />,
  declined: <XCircle className="h-4 w-4 text-red-400" />,
};

export function PeerValidationClient({ validators: initial, learnerId, userId }: Props) {
  const [validators, setValidators] = useState(initial);
  const [email, setEmail] = useState("");
  const [relationship, setRelationship] = useState("peer");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/validate/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), relationship }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to send invite");
      setSuccess(`Invitation sent to ${email.trim()}`);
      setEmail("");
      setValidators((prev) => [
        { id: json.id, email: email.trim(), relationship, status: "pending", created_at: new Date().toISOString() },
        ...prev,
      ]);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to send invite");
    } finally {
      setLoading(false);
    }
  };

  const completedCount = validators.filter(v => v.status === "completed").length;

  return (
    <div className="space-y-6">
      {/* Score contribution */}
      <div className="bg-card border border-border/40 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Validation Score
          </p>
          <span className="text-lg font-bold text-foreground">
            {Math.min(completedCount * 2, 10)}<span className="text-muted-foreground text-sm font-normal">/10</span>
          </span>
        </div>
        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all"
            style={{ width: `${Math.min(completedCount * 20, 100)}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          {completedCount} of 5 validators completed · Each adds 2 points to your Mastery Score
        </p>
      </div>

      {/* Invite form */}
      <div className="bg-card border border-border/40 rounded-2xl p-5">
        <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
          <UserPlus className="h-4 w-4 text-primary" />
          Invite a Validator
        </h2>
        <form onSubmit={handleInvite} className="space-y-3">
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Email address</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="colleague@company.com"
              required
              className="w-full px-3 py-2 rounded-lg bg-background border border-border/60 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Relationship</label>
            <select
              value={relationship}
              onChange={e => setRelationship(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-background border border-border/60 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors"
            >
              {RELATIONSHIPS.map(r => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>
          {error && <p className="text-xs text-red-400">{error}</p>}
          {success && <p className="text-xs text-green-500">{success}</p>}
          <button
            type="submit"
            disabled={loading || !email.trim()}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            <Mail className="h-4 w-4" />
            {loading ? "Sending…" : "Send Invitation"}
          </button>
        </form>
      </div>

      {/* Validators list */}
      {validators.length > 0 && (
        <div className="bg-card border border-border/40 rounded-2xl p-5">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
            Invited Validators ({validators.length})
          </h2>
          <div className="space-y-3">
            {validators.map(v => (
              <div key={v.id} className="py-2 border-b border-border/20 last:border-0">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">{v.email}</p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {RELATIONSHIPS.find(r => r.value === v.relationship)?.label ?? v.relationship}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {STATUS_ICONS[v.status] ?? STATUS_ICONS.pending}
                    <span className="text-xs text-muted-foreground capitalize">{v.status}</span>
                  </div>
                </div>
                {v.status !== "completed" && <ShareLink validatorId={v.id} />}
              </div>
            ))}
          </div>
        </div>
      )}

      {validators.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <UserPlus className="h-8 w-8 mx-auto mb-2 opacity-40" />
          <p className="text-sm">No validators invited yet.</p>
          <p className="text-xs mt-1">Invite up to 5 colleagues to validate your leadership behaviours.</p>
        </div>
      )}
    </div>
  );
}

function ShareLink({ validatorId }: { validatorId: string }) {
  const [copied, setCopied] = useState(false);
  const link =
    typeof window !== "undefined"
      ? `${window.location.origin}/peer/${validatorId}`
      : `/peer/${validatorId}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      className="mt-2 w-full flex items-center gap-2 px-3 py-1.5 rounded-lg bg-background border border-border/50 text-[11px] text-muted-foreground hover:border-primary/40 transition-colors"
      title="Copy the validation link to send to this person"
    >
      {copied ? <Check className="h-3 w-3 text-green-400 flex-shrink-0" /> : <Copy className="h-3 w-3 flex-shrink-0" />}
      <span className="truncate font-mono">{link}</span>
      <span className="ml-auto flex-shrink-0 font-sans font-medium text-foreground">
        {copied ? "Copied" : "Copy"}
      </span>
    </button>
  );
}
