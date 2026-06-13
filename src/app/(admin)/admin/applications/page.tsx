// ─────────────────────────────────────────────────────────────────────────────
// Admin — Applications review queue.
// Pending learners with their full application (onboarding answers) and
// one-click approve / decline. Also lists recently declined for undo.
// ─────────────────────────────────────────────────────────────────────────────

import { createAdminClient } from "@/lib/supabase/admin";
import { approveLearner, declineLearner } from "@/lib/actions/admin";

export const metadata = { title: "Applications — AscendMentor Admin" };
export const dynamic = "force-dynamic";

export default async function ApplicationsPage() {
  const admin = createAdminClient();

  const [{ data: pending }, { data: declined }] = await Promise.all([
    admin
      .from("learners")
      .select(
        "id, full_name, first_name, email, organisation_name, organisation_size, role_title, years_running, country, phone_number, initial_challenge, success_criteria, past_coaching, past_coaching_outcome, onboarding_complete, created_at"
      )
      .eq("status", "pending")
      .order("created_at", { ascending: true }),
    admin
      .from("learners")
      .select("id, full_name, email, created_at")
      .eq("status", "declined")
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  const applications = (pending ?? []).filter((l) => l.onboarding_complete);
  const incomplete = (pending ?? []).filter((l) => !l.onboarding_complete);

  return (
    <div className="p-8 max-w-4xl">
      <h1 className="text-2xl font-bold text-white mb-1">Applications</h1>
      <p className="text-sm text-white/40 mb-8">
        {applications.length} awaiting review
        {incomplete.length > 0 && ` · ${incomplete.length} signed up but haven't completed their application`}
      </p>

      {applications.length === 0 && (
        <div className="rounded-xl border border-white/10 p-12 text-center text-white/30 text-sm">
          No applications waiting. New ones appear here as soon as an applicant
          completes onboarding.
        </div>
      )}

      <div className="space-y-5">
        {applications.map((a) => (
          <div key={a.id} className="rounded-xl border border-white/10 bg-white/[0.02] p-6">
            {/* Header row */}
            <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
              <div>
                <p className="font-semibold text-white text-lg">
                  {a.full_name ?? `${a.first_name}`}
                </p>
                <p className="text-sm text-white/40">{a.email}</p>
                <p className="text-xs text-white/30 mt-1">
                  Applied{" "}
                  {a.created_at
                    ? new Date(a.created_at).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })
                    : "—"}
                </p>
              </div>

              <div className="flex gap-2">
                <form
                  action={async () => {
                    "use server";
                    await approveLearner(a.id);
                  }}
                >
                  <button
                    type="submit"
                    className="bg-green-600 hover:bg-green-500 text-white font-semibold text-sm px-5 py-2 rounded-lg transition-colors"
                  >
                    Approve
                  </button>
                </form>
                <form
                  action={async () => {
                    "use server";
                    await declineLearner(a.id);
                  }}
                >
                  <button
                    type="submit"
                    className="border border-red-500/40 text-red-400 hover:bg-red-500/10 font-semibold text-sm px-5 py-2 rounded-lg transition-colors"
                  >
                    Decline
                  </button>
                </form>
              </div>
            </div>

            {/* Application facts */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
              <Fact label="Organisation" value={a.organisation_name} />
              <Fact label="Role" value={a.role_title} />
              <Fact label="Org size" value={a.organisation_size} />
              <Fact label="Years running" value={a.years_running} />
              <Fact label="Country" value={a.country} />
              <Fact label="Phone" value={a.phone_number} />
              <Fact label="Past coaching" value={a.past_coaching ? "Yes" : "No"} />
              {a.past_coaching && (
                <Fact label="Coaching outcome" value={a.past_coaching_outcome} />
              )}
            </div>

            {/* Free-text answers — the real vetting signal */}
            <Answer label="Biggest leadership challenge" text={a.initial_challenge} />
            <Answer label="What success looks like" text={a.success_criteria} />
          </div>
        ))}
      </div>

      {/* Incomplete signups */}
      {incomplete.length > 0 && (
        <div className="mt-12">
          <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-4">
            Signed up, application incomplete
          </h2>
          <div className="rounded-xl border border-white/10 divide-y divide-white/5">
            {incomplete.map((l) => (
              <div key={l.id} className="px-5 py-3 flex items-center justify-between">
                <span className="text-sm text-white/60">{l.email}</span>
                <span className="text-xs text-white/30">
                  {l.created_at ? new Date(l.created_at).toLocaleDateString("en-GB") : "—"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recently declined */}
      {(declined ?? []).length > 0 && (
        <div className="mt-12">
          <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-4">
            Recently declined
          </h2>
          <div className="rounded-xl border border-white/10 divide-y divide-white/5">
            {(declined ?? []).map((l) => (
              <div key={l.id} className="px-5 py-3 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm text-white/60 truncate">
                    {l.full_name ?? "—"} <span className="text-white/30">· {l.email}</span>
                  </p>
                </div>
                <form
                  action={async () => {
                    "use server";
                    await approveLearner(l.id);
                  }}
                >
                  <button
                    type="submit"
                    className="text-xs text-white/40 hover:text-green-400 border border-white/10 hover:border-green-500/40 rounded-lg px-3 py-1.5 transition-colors whitespace-nowrap"
                  >
                    Approve instead
                  </button>
                </form>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="bg-white/[0.03] rounded-lg px-3 py-2">
      <p className="text-[10px] text-white/30 uppercase tracking-wider">{label}</p>
      <p className="text-sm text-white/80 truncate">{value || "—"}</p>
    </div>
  );
}

function Answer({ label, text }: { label: string; text: string | null | undefined }) {
  if (!text) return null;
  return (
    <div className="mt-3">
      <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-sm text-white/70 leading-relaxed border-l-2 border-[#c9a84c]/40 pl-3">
        {text}
      </p>
    </div>
  );
}
