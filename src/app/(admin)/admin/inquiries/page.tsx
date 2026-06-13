// Admin — Enterprise inquiries from the public /institutions form.

import { createAdminClient } from "@/lib/supabase/admin";
import { updateInquiryStatus } from "@/lib/actions/admin";

export const metadata = { title: "Inquiries — AscendMentor Admin" };
export const dynamic = "force-dynamic";

const STATUS_STYLES: Record<string, string> = {
  new: "bg-yellow-500/15 text-yellow-400",
  contacted: "bg-blue-500/15 text-blue-400",
  closed: "bg-white/10 text-white/40",
};

export default async function InquiriesPage() {
  const admin = createAdminClient();

  const { data: inquiries } = await admin
    .from("enterprise_inquiries")
    .select("*")
    .order("created_at", { ascending: false });

  const list = inquiries ?? [];
  const open = list.filter((i) => i.status !== "closed").length;

  return (
    <div className="p-8 max-w-4xl">
      <h1 className="text-2xl font-bold text-white mb-1">Enterprise Inquiries</h1>
      <p className="text-sm text-white/40 mb-8">{open} open · {list.length} total</p>

      {list.length === 0 ? (
        <div className="rounded-xl border border-white/10 p-12 text-center text-white/30 text-sm">
          No inquiries yet. Institutions submit these via the public
          “For institutions” page.
        </div>
      ) : (
        <div className="space-y-4">
          {list.map((inq) => (
            <div key={inq.id} className="rounded-xl border border-white/10 bg-white/[0.02] p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-3">
                    <p className="font-semibold text-white">{inq.organisation_name}</p>
                    <span
                      className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded ${STATUS_STYLES[inq.status] ?? STATUS_STYLES.new}`}
                    >
                      {inq.status}
                    </span>
                  </div>
                  <p className="text-sm text-white/50 mt-1">
                    {inq.contact_name} ·{" "}
                    <a href={`mailto:${inq.contact_email}`} className="text-[#c9a84c] hover:underline">
                      {inq.contact_email}
                    </a>
                    {inq.phone ? ` · ${inq.phone}` : ""}
                  </p>
                  <p className="text-xs text-white/30 mt-1">
                    {inq.country ?? "—"} · Team size: {inq.team_size ?? "—"} ·{" "}
                    {new Date(inq.created_at).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>

                <div className="flex gap-2">
                  {inq.status === "new" && (
                    <form
                      action={async () => {
                        "use server";
                        await updateInquiryStatus(inq.id, "contacted");
                      }}
                    >
                      <button
                        type="submit"
                        className="text-xs font-semibold text-blue-400 border border-blue-500/40 hover:bg-blue-500/10 rounded-lg px-3 py-1.5 transition-colors"
                      >
                        Mark contacted
                      </button>
                    </form>
                  )}
                  {inq.status !== "closed" && (
                    <form
                      action={async () => {
                        "use server";
                        await updateInquiryStatus(inq.id, "closed");
                      }}
                    >
                      <button
                        type="submit"
                        className="text-xs font-semibold text-white/40 border border-white/10 hover:bg-white/5 rounded-lg px-3 py-1.5 transition-colors"
                      >
                        Close
                      </button>
                    </form>
                  )}
                </div>
              </div>

              {inq.message && (
                <p className="mt-3 text-sm text-white/60 leading-relaxed border-l-2 border-[#c9a84c]/40 pl-3">
                  {inq.message}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
