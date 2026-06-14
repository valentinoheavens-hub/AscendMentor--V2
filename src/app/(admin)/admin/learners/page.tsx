import { createClient as createAdminClient } from "@supabase/supabase-js";
import Link from "next/link";
import type { Database } from "@/types/supabase";

type Learner = Database["public"]["Tables"]["learners"]["Row"];

const BELT_COLORS: Record<string, string> = {
  seeker: "#6b7280",
  yellow_belt: "#eab308",
  green_belt: "#22c55e",
  blue_belt: "#3b82f6",
  black_belt: "#8b5cf6",
};

export default async function LearnersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; belt?: string; status?: string; page?: string }>;
}) {
  const { q, belt, status, page } = await searchParams;
  const currentPage = Math.max(1, parseInt(page ?? "1", 10));
  const PAGE_SIZE = 25;
  const offset = (currentPage - 1) * PAGE_SIZE;

  const adminClient = createAdminClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Fetch mastery scores for belt data (latest per learner)
  const { data: masteryRows } = await adminClient
    .from("mastery_scores")
    .select("learner_id, belt_tier, total_score")
    .order("created_at", { ascending: false });

  // Build latest belt/score per learner
  const beltByLearner: Record<string, { belt: string; score: number }> = {};
  for (const row of masteryRows ?? []) {
    if (row.learner_id && !beltByLearner[row.learner_id]) {
      beltByLearner[row.learner_id] = {
        belt: row.belt_tier,
        score: row.total_score,
      };
    }
  }

  // Build learner query
  let query = adminClient
    .from("learners")
    .select(
      "id, first_name, last_name, email, country, role_title, organisation_name, created_at, status, beta_tier, onboarding_complete, assessment_complete, subscription_tier",
      { count: "exact" }
    )
    .order("created_at", { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1);

  if (q) {
    query = query.or(
      `first_name.ilike.%${q}%,last_name.ilike.%${q}%,email.ilike.%${q}%,organisation_name.ilike.%${q}%`
    );
  }
  if (status) {
    query = query.eq("status", status);
  }

  const { data: learners, count: totalCount } = await query;

  // Filter by belt (client-side since belt is in mastery_scores)
  let filteredLearners = learners ?? [];
  if (belt) {
    filteredLearners = filteredLearners.filter(
      (l) => beltByLearner[l.id]?.belt === belt
    );
  }

  const totalPages = Math.ceil((totalCount ?? 0) / PAGE_SIZE);

  return (
    <div className="p-8 max-w-7xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Learners</h1>
          <p className="text-sm text-white/40 mt-0.5">
            {totalCount?.toLocaleString()} total
          </p>
        </div>
      </div>

      {/* Filters */}
      <form method="GET" className="flex flex-wrap gap-3 mb-6">
        <input
          name="q"
          defaultValue={q ?? ""}
          placeholder="Search name, email, org…"
          className="flex-1 min-w-52 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#1B6FF3]/50 focus:ring-1 focus:ring-[#1B6FF3]/20"
        />
        <select
          name="belt"
          defaultValue={belt ?? ""}
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#1B6FF3]/50"
        >
          <option value="">All Belts</option>
          <option value="seeker">Seeker</option>
          <option value="yellow_belt">Yellow Belt</option>
          <option value="green_belt">Green Belt</option>
          <option value="blue_belt">Blue Belt</option>
          <option value="black_belt">Black Belt</option>
        </select>
        <select
          name="status"
          defaultValue={status ?? ""}
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#1B6FF3]/50"
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="pending">Pending</option>
          <option value="declined">Declined</option>
          <option value="inactive">Inactive</option>
          <option value="trial">Trial</option>
        </select>
        <button
          type="submit"
          className="bg-[#1B6FF3] hover:bg-[#2E90FA] text-black font-semibold text-sm px-5 py-2 rounded-lg transition-colors"
        >
          Filter
        </button>
        {(q || belt || status) && (
          <Link
            href="/admin/learners"
            className="text-white/40 hover:text-white text-sm px-3 py-2 rounded-lg border border-white/10 transition-colors"
          >
            Clear
          </Link>
        )}
      </form>

      {/* Table */}
      <div className="rounded-xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/3">
                {[
                  "Name",
                  "Email",
                  "Organisation",
                  "Country",
                  "Belt",
                  "Score",
                  "Status",
                  "Onboarded",
                  "Assessed",
                  "Joined",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-[11px] font-semibold text-white/40 uppercase tracking-wider whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredLearners.map((learner, i) => {
                const mastery = beltByLearner[learner.id];
                return (
                  <tr
                    key={learner.id}
                    className={`border-b border-white/5 ${i % 2 === 0 ? "" : "bg-white/2"} hover:bg-white/5 transition-colors`}
                  >
                    <td className="px-4 py-3 font-medium text-white whitespace-nowrap">
                      {learner.first_name} {learner.last_name ?? ""}
                    </td>
                    <td className="px-4 py-3 text-white/50 max-w-48 truncate">
                      {learner.email}
                    </td>
                    <td className="px-4 py-3 text-white/50 max-w-40 truncate">
                      {learner.organisation_name ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-white/50">{learner.country ?? "—"}</td>
                    <td className="px-4 py-3">
                      {mastery ? (
                        <span
                          className="text-[11px] font-semibold uppercase tracking-wider"
                          style={{ color: BELT_COLORS[mastery.belt] ?? "#6b7280" }}
                        >
                          {mastery.belt.replace(/_/g, " ")}
                        </span>
                      ) : (
                        <span className="text-white/20">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-white/60 font-mono">
                      {mastery ? mastery.score : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={learner.status ?? "pending"} />
                    </td>
                    <td className="px-4 py-3 text-center">
                      {learner.onboarding_complete ? (
                        <span className="text-green-400">✓</span>
                      ) : (
                        <span className="text-white/20">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {learner.assessment_complete ? (
                        <span className="text-green-400">✓</span>
                      ) : (
                        <span className="text-white/20">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-white/30 text-xs whitespace-nowrap">
                      {learner.created_at
                        ? new Date(learner.created_at).toLocaleDateString("en-GB")
                        : "—"}
                    </td>
                  </tr>
                );
              })}
              {filteredLearners.length === 0 && (
                <tr>
                  <td
                    colSpan={10}
                    className="px-4 py-12 text-center text-white/30 text-sm"
                  >
                    No learners match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <p className="text-sm text-white/40">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex gap-2">
            {currentPage > 1 && (
              <PaginationLink
                href={buildHref({ q, belt, status, page: currentPage - 1 })}
              >
                ← Previous
              </PaginationLink>
            )}
            {currentPage < totalPages && (
              <PaginationLink
                href={buildHref({ q, belt, status, page: currentPage + 1 })}
              >
                Next →
              </PaginationLink>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function buildHref(params: {
  q?: string;
  belt?: string;
  status?: string;
  page: number;
}) {
  const sp = new URLSearchParams();
  if (params.q) sp.set("q", params.q);
  if (params.belt) sp.set("belt", params.belt);
  if (params.status) sp.set("status", params.status);
  sp.set("page", String(params.page));
  return `/admin/learners?${sp.toString()}`;
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    active: "bg-green-500/15 text-green-400",
    inactive: "bg-white/10 text-white/40",
    pending: "bg-yellow-500/15 text-yellow-400",
    declined: "bg-red-500/15 text-red-400",
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

function PaginationLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="text-sm text-white/60 hover:text-white border border-white/10 hover:border-white/20 rounded-lg px-4 py-2 transition-colors"
    >
      {children}
    </Link>
  );
}
