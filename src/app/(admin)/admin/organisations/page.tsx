// ─────────────────────────────────────────────────────────────────────────────
// Admin — Organisations (enterprise licences).
// Create orgs with seat counts; each gets an invite link that auto-approves
// members against available seats.
// ─────────────────────────────────────────────────────────────────────────────

import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { createOrganisation } from "@/lib/actions/admin";

export const metadata = { title: "Organisations — AscendMentor Admin" };
export const dynamic = "force-dynamic";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export default async function OrganisationsPage() {
  const admin = createAdminClient();

  const [{ data: orgs }, { data: memberRows }] = await Promise.all([
    admin
      .from("organisations")
      .select("id, name, contact_name, contact_email, seat_count, invite_code, status, created_at")
      .order("created_at", { ascending: false }),
    admin.from("learners").select("organisation_id").not("organisation_id", "is", null),
  ]);

  // Seats used per org
  const seatUse: Record<string, number> = {};
  for (const row of memberRows ?? []) {
    if (row.organisation_id) {
      seatUse[row.organisation_id] = (seatUse[row.organisation_id] ?? 0) + 1;
    }
  }

  return (
    <div className="p-8 max-w-5xl">
      <h1 className="text-2xl font-bold text-white mb-1">Organisations</h1>
      <p className="text-sm text-white/40 mb-8">
        Enterprise licences — members joining via an organisation&apos;s invite link are
        approved automatically against available seats.
      </p>

      {/* Create form */}
      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6 mb-10">
        <h2 className="text-sm font-semibold text-white/60 uppercase tracking-widest mb-4">
          New organisation
        </h2>
        <form
          action={async (formData: FormData) => {
            "use server";
            await createOrganisation(formData);
          }}
          className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3"
        >
          <input
            name="name"
            required
            placeholder="Organisation name *"
            className="lg:col-span-2 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#c9a84c]/50"
          />
          <input
            name="contact_name"
            placeholder="Contact person"
            className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#c9a84c]/50"
          />
          <input
            name="contact_email"
            type="email"
            placeholder="Contact email"
            className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#c9a84c]/50"
          />
          <div className="flex gap-3">
            <input
              name="seat_count"
              type="number"
              min={1}
              defaultValue={10}
              title="Seats"
              className="w-20 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#c9a84c]/50"
            />
            <button
              type="submit"
              className="flex-1 bg-[#c9a84c] hover:bg-[#d4b563] text-black font-semibold text-sm px-4 py-2 rounded-lg transition-colors whitespace-nowrap"
            >
              Create
            </button>
          </div>
        </form>
      </div>

      {/* Org list */}
      {(orgs ?? []).length === 0 ? (
        <div className="rounded-xl border border-white/10 p-12 text-center text-white/30 text-sm">
          No organisations yet. Create one above, then share its invite link with the
          institution&apos;s members.
        </div>
      ) : (
        <div className="space-y-4">
          {(orgs ?? []).map((org) => {
            const used = seatUse[org.id] ?? 0;
            const pctUsed = Math.min(100, Math.round((used / org.seat_count) * 100));
            return (
              <Link
                key={org.id}
                href={`/admin/organisations/${org.id}`}
                className="block rounded-xl border border-white/10 bg-white/[0.02] hover:border-[#c9a84c]/40 p-5 transition-colors"
              >
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-3">
                      <p className="font-semibold text-white truncate">{org.name}</p>
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
                    <p className="text-xs text-white/40 mt-1">
                      {org.contact_name ?? "No contact"}
                      {org.contact_email ? ` · ${org.contact_email}` : ""}
                    </p>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-sm font-semibold text-white">
                        {used}/{org.seat_count}
                      </p>
                      <p className="text-[11px] text-white/30">seats used</p>
                    </div>
                    <div className="w-28">
                      <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${pctUsed >= 100 ? "bg-red-400" : "bg-[#c9a84c]"}`}
                          style={{ width: `${pctUsed}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <p className="mt-3 text-[11px] text-white/30 font-mono truncate">
                  {APP_URL}/join/{org.invite_code}
                </p>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
