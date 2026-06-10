import { createClient as createAdminClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";

export default async function AdminSessionsPage() {
  const adminClient = createAdminClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: sessions } = await adminClient
    .from("coaching_sessions")
    .select(
      `id, session_type, message_count, quality_score, started_at, ended_at,
       learner_id, learners(first_name, last_name, email)`
    )
    .order("started_at", { ascending: false })
    .limit(50);

  return (
    <div className="p-8 max-w-6xl">
      <h1 className="text-2xl font-bold text-white mb-1">Coaching Sessions</h1>
      <p className="text-sm text-white/40 mb-8">Latest 50 sessions</p>

      <div className="rounded-xl border border-white/10 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-white/3">
              {["Learner", "Type", "Messages", "Quality", "Started", "Duration"].map(
                (h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-[11px] font-semibold text-white/40 uppercase tracking-wider"
                  >
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {(sessions ?? []).map((s, i) => {
              const learner = Array.isArray(s.learners) ? s.learners[0] : s.learners;
              const duration =
                s.started_at && s.ended_at
                  ? Math.round(
                      (new Date(s.ended_at).getTime() -
                        new Date(s.started_at).getTime()) /
                        60000
                    )
                  : null;
              return (
                <tr
                  key={s.id}
                  className={`border-b border-white/5 ${i % 2 === 0 ? "" : "bg-white/2"}`}
                >
                  <td className="px-4 py-3 text-white font-medium">
                    {learner
                      ? `${learner.first_name} ${learner.last_name ?? ""}`
                      : <span className="text-white/30">Unknown</span>}
                  </td>
                  <td className="px-4 py-3 text-white/50 capitalize">
                    {s.session_type.replace(/_/g, " ")}
                  </td>
                  <td className="px-4 py-3 text-white/60 font-mono">{s.message_count}</td>
                  <td className="px-4 py-3 text-white/60 font-mono">
                    {s.quality_score != null ? `${s.quality_score}/10` : "—"}
                  </td>
                  <td className="px-4 py-3 text-white/40 text-xs">
                    {s.started_at
                      ? new Date(s.started_at).toLocaleString("en-GB", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-white/40 text-xs">
                    {duration != null ? `${duration}m` : "—"}
                  </td>
                </tr>
              );
            })}
            {!sessions?.length && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-white/30">
                  No sessions yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
