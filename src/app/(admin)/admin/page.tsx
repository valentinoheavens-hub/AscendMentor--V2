import { createClient as createAdminClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";

const BELT_LABELS: Record<string, string> = {
  seeker: "Seeker",
  yellow_belt: "Yellow Belt",
  green_belt: "Green Belt",
  blue_belt: "Blue Belt",
  black_belt: "Black Belt",
};

const BELT_COLORS: Record<string, string> = {
  seeker: "#6b7280",
  yellow_belt: "#eab308",
  green_belt: "#22c55e",
  blue_belt: "#3b82f6",
  black_belt: "#8b5cf6",
};

export default async function AdminDashboardPage() {
  const adminClient = createAdminClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const [
    { count: totalLearners },
    { data: learners },
    { data: recentLearners },
    { data: beltDistribution },
    { count: assessmentCount },
    { count: sessionCount },
  ] = await Promise.all([
    adminClient.from("learners").select("*", { count: "exact", head: true }),
    adminClient
      .from("learners")
      .select("status, onboarding_complete, assessment_complete, subscription_tier, beta_tier"),
    adminClient
      .from("learners")
      .select("id, first_name, last_name, email, country, created_at, status, beta_tier")
      .order("created_at", { ascending: false })
      .limit(8),
    adminClient
      .from("mastery_scores")
      .select("belt_tier, learner_id")
      .order("created_at", { ascending: false }),
    adminClient
      .from("clarity_assessments")
      .select("*", { count: "exact", head: true }),
    adminClient
      .from("coaching_sessions")
      .select("*", { count: "exact", head: true }),
  ]);

  // Aggregate stats
  const onboardingComplete = learners?.filter((l) => l.onboarding_complete).length ?? 0;
  const assessmentComplete = learners?.filter((l) => l.assessment_complete).length ?? 0;
  const betaLearners = learners?.filter((l) => l.beta_tier).length ?? 0;

  // Belt distribution — latest snapshot per learner
  const seenLearners = new Set<string>();
  const beltCounts: Record<string, number> = {};
  for (const row of beltDistribution ?? []) {
    if (!row.learner_id || seenLearners.has(row.learner_id)) continue;
    seenLearners.add(row.learner_id);
    beltCounts[row.belt_tier] = (beltCounts[row.belt_tier] ?? 0) + 1;
  }

  const total = totalLearners ?? 0;

  return (
    <div className="p-8 max-w-6xl">
      <h1 className="text-2xl font-bold text-white mb-1">Platform Overview</h1>
      <p className="text-sm text-white/40 mb-8">
        {new Date().toLocaleDateString("en-GB", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        })}
      </p>

      {/* Top stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Learners" value={total} />
        <StatCard label="Onboarded" value={onboardingComplete} sub={`${pct(onboardingComplete, total)}% of total`} />
        <StatCard label="Assessed" value={assessmentComplete} sub={`${pct(assessmentComplete, total)}% of total`} />
        <StatCard label="Beta Members" value={betaLearners} sub={`${pct(betaLearners, total)}% of total`} />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <StatCard label="Assessments" value={assessmentCount ?? 0} accent />
        <StatCard label="Coaching Sessions" value={sessionCount ?? 0} accent />
      </div>

      {/* Belt distribution */}
      <section className="mb-10">
        <h2 className="text-sm font-semibold text-white/60 uppercase tracking-widest mb-4">
          Belt Distribution
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {["seeker", "yellow_belt", "green_belt", "blue_belt", "black_belt"].map((belt) => {
            const count = beltCounts[belt] ?? 0;
            const barPct = total > 0 ? Math.round((count / total) * 100) : 0;
            return (
              <div
                key={belt}
                className="rounded-xl border border-white/10 bg-white/3 p-4 flex flex-col gap-3"
              >
                <div className="flex items-center justify-between">
                  <span
                    className="text-[11px] font-semibold uppercase tracking-wider"
                    style={{ color: BELT_COLORS[belt] }}
                  >
                    {BELT_LABELS[belt]}
                  </span>
                  <span className="text-lg font-bold text-white">{count}</span>
                </div>
                <div className="h-1 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${barPct}%`, backgroundColor: BELT_COLORS[belt] }}
                  />
                </div>
                <p className="text-[11px] text-white/30">{barPct}% of assessed</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Recent sign-ups */}
      <section>
        <h2 className="text-sm font-semibold text-white/60 uppercase tracking-widest mb-4">
          Recent Sign-ups
        </h2>
        <div className="rounded-xl border border-white/10 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/3">
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-white/40 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-white/40 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-white/40 uppercase tracking-wider">
                  Country
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-white/40 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-white/40 uppercase tracking-wider">
                  Joined
                </th>
              </tr>
            </thead>
            <tbody>
              {(recentLearners ?? []).map((l, i) => (
                <tr
                  key={l.id}
                  className={`border-b border-white/5 ${i % 2 === 0 ? "" : "bg-white/2"} hover:bg-white/5 transition-colors`}
                >
                  <td className="px-4 py-3 text-white font-medium">
                    {l.first_name} {l.last_name ?? ""}
                  </td>
                  <td className="px-4 py-3 text-white/50">{l.email}</td>
                  <td className="px-4 py-3 text-white/50">{l.country ?? "—"}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={l.status ?? "pending"} />
                  </td>
                  <td className="px-4 py-3 text-white/40 text-xs">
                    {l.created_at
                      ? new Date(l.created_at).toLocaleDateString("en-GB")
                      : "—"}
                  </td>
                </tr>
              ))}
              {!recentLearners?.length && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-white/30 text-sm">
                    No learners yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function pct(n: number, total: number) {
  if (total === 0) return 0;
  return Math.round((n / total) * 100);
}

function StatCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: number;
  sub?: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-5 flex flex-col gap-1 ${
        accent
          ? "border-[#c9a84c]/20 bg-[#c9a84c]/5"
          : "border-white/10 bg-white/3"
      }`}
    >
      <p className="text-[11px] text-white/40 uppercase tracking-wider font-semibold">
        {label}
      </p>
      <p className="text-3xl font-bold text-white">{value.toLocaleString()}</p>
      {sub && <p className="text-[11px] text-white/30">{sub}</p>}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    active: "bg-green-500/15 text-green-400",
    inactive: "bg-white/10 text-white/40",
    pending: "bg-yellow-500/15 text-yellow-400",
    trial: "bg-blue-500/15 text-blue-400",
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${styles[status] ?? styles.pending}`}
    >
      {status}
    </span>
  );
}
