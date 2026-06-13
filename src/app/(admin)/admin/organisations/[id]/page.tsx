// ─────────────────────────────────────────────────────────────────────────────
// Admin — Organisation detail.
// Members, seat usage, team belt distribution, invite link, suspend/reactivate.
// ─────────────────────────────────────────────────────────────────────────────

import Link from "next/link";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { updateOrganisationStatus, updateOrganisationSeats } from "@/lib/actions/admin";

export const metadata = { title: "Organisation — AscendMentor Admin" };
export const dynamic = "force-dynamic";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

const BELT_COLORS: Record<string, string> = {
  seeker: "#6b7280",
  yellow_belt: "#eab308",
  green_belt: "#22c55e",
  blue_belt: "#3b82f6",
  black_belt: "#c9a84c",
};

export default async function OrganisationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const admin = createAdminClient();

  const [{ data: org }, { data: members }, { data: masteryRows }] = await Promise.all([
    admin
      .from("organisations")
      .select("id, name, contact_name, contact_email, seat_count, invite_code, status, notes, created_at")
      .eq("id", id)
      .maybeSingle(),
    admin
      .from("learners")
      .select("id, full_name, first_name, email, role_title, country, status, onboarding_complete, assessment_complete, created_at")
      .eq("organisation_id", id)
      .order("created_at", { ascending: true }),
    admin
      .from("mastery_scores")
      .select("learner_id, belt_tier, total_score, created_at")
      .order("created_at", { ascending: false }),
  ]);

  if (!org) notFound();

  const memberList = members ?? [];
  const memberIds = new Set(memberList.map((m) => m.id));

  // Latest belt per member
  const beltByLearner: Record<string, { belt: string; score: number }> = {};
  for (const row of masteryRows ?? []) {
    if (row.learner_id && memberIds.has(row.learner_id) && !beltByLearner[row.learner_id]) {
      beltByLearner[row.learner_id] = { belt: row.belt_tier, score: row.total_score };
    }
  }

  // Team aggregates
  const beltCounts: Record<string, number> = {};
  let scoreSum = 0;
  let scored = 0;
  for (const m of memberList) {
    const b = beltByLearner[m.id];
    if (b) {
      beltCounts[b.belt] = (beltCounts[b.belt] ?? 0) + 1;
      scoreSum += b.score;
      scored++;
    }
  }
  const avgScore = scored > 0 ? Math.round(scoreSum / scored) : null;
  const used = memberList.length;

  return (
    <div className="p-8 max-w-5xl">
      <Link href="/admin/organisations" className="text-xs text-white/40 hover:text-white transition-colors">
        ← All organisations
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4 mt-3 mb-8">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white">{org.name}</h1>
            <span
              className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded ${
                org.status === "active"
                  ? "bg-green-500/15 text-green-400"
                  : "bg-red-500/15 text-red-400"
              }`}
            >
              {org.status}
            </span>
          </div>
          <p className="text-sm text-white/40 mt-1">
            {org.contact_name ?? "No contact"}
            {org.contact_email ? ` · ${org.contact_email}` : ""}
          </p>
        </div>

        <form
          action={async () => {
            "use server";
            await updateOrganisationStatus(org.id, org.status === "active" ? "suspended" : "active");
          }}
        >
          <button
            type="submit"
            className={`text-sm font-semibold px-4 py-2 rounded-lg border transition-colors ${
              org.status === "active"
                ? "border-red-500/40 text-red-400 hover:bg-red-500/10"
                : "border-green-500/40 text-green-400 hover:bg-green-500/10"
            }`}
          >
            {org.status === "active" ? "Suspend invites" : "Reactivate"}
          </button>
        </form>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
          <p className="text-[11px] text-white/30 uppercase tracking-wider">Seats</p>
          <p className="text-2xl font-bold text-white mt-1">
            {used}<span className="text-white/30 text-base">/{org.seat_count}</span>
          </p>
          <form
            action={async (formData: FormData) => {
              "use server";
              await updateOrganisationSeats(org.id, parseInt(String(formData.get("seats")), 10));
            }}
            className="flex gap-2 mt-3"
          >
            <input
              name="seats"
              type="number"
              min={1}
              defaultValue={org.seat_count}
              className="w-16 bg-white/5 border border-white/10 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-[#c9a84c]/50"
            />
            <button type="submit" className="text-[11px] text-white/40 hover:text-[#c9a84c] transition-colors">
              Update
            </button>
          </form>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
          <p className="text-[11px] text-white/30 uppercase tracking-wider">Avg Mastery Score</p>
          <p className="text-2xl font-bold text-[#c9a84c] mt-1">{avgScore ?? "—"}</p>
          <p className="text-[11px] text-white/30 mt-1">{scored} of {used} assessed</p>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 col-span-2">
          <p className="text-[11px] text-white/30 uppercase tracking-wider mb-2">Team belt distribution</p>
          <div className="flex items-end gap-3">
            {Object.keys(BELT_COLORS).map((belt) => (
              <div key={belt} className="text-center">
                <p className="text-sm font-bold text-white">{beltCounts[belt] ?? 0}</p>
                <div
                  className="w-8 h-1.5 rounded-full mt-1"
                  style={{ background: BELT_COLORS[belt] }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Invite link */}
      <div className="rounded-xl border border-[#c9a84c]/30 bg-[#c9a84c]/5 p-5 mb-10">
        <p className="text-[11px] text-white/40 uppercase tracking-wider mb-1.5">
          Invite link — members joining via this link are approved automatically
        </p>
        <p className="font-mono text-sm text-[#c9a84c] break-all select-all">
          {APP_URL}/join/{org.invite_code}
        </p>
      </div>

      {/* Members */}
      <h2 className="text-sm font-semibold text-white/60 uppercase tracking-widest mb-4">
        Members ({used})
      </h2>
      <div className="rounded-xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/3">
                {["Name", "Email", "Role", "Belt", "Score", "Status", "Joined"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold text-white/40 uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {memberList.map((m, i) => {
                const mastery = beltByLearner[m.id];
                return (
                  <tr key={m.id} className={`border-b border-white/5 ${i % 2 === 0 ? "" : "bg-white/2"}`}>
                    <td className="px-4 py-3 font-medium text-white whitespace-nowrap">
                      {m.full_name ?? m.first_name}
                    </td>
                    <td className="px-4 py-3 text-white/50 max-w-48 truncate">{m.email}</td>
                    <td className="px-4 py-3 text-white/50 max-w-36 truncate">{m.role_title ?? "—"}</td>
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
                    <td className="px-4 py-3 text-white/60 font-mono">{mastery?.score ?? "—"}</td>
                    <td className="px-4 py-3 text-white/50 capitalize">{m.status}</td>
                    <td className="px-4 py-3 text-white/30 text-xs whitespace-nowrap">
                      {m.created_at ? new Date(m.created_at).toLocaleDateString("en-GB") : "—"}
                    </td>
                  </tr>
                );
              })}
              {memberList.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-white/30 text-sm">
                    No members yet — share the invite link above.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
