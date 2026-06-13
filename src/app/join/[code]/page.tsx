// ─────────────────────────────────────────────────────────────────────────────
// /join/[code] — institutional invite landing.
// Logged-out: brand the invite and push to signup (code carried via query).
// Logged-in: redeem immediately and continue to onboarding/dashboard.
// ─────────────────────────────────────────────────────────────────────────────

import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Building2, XCircle, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import {
  getOrganisationByInviteCode,
  countOrgMembers,
  redeemInviteCode,
} from "@/lib/organisations";

export const metadata: Metadata = {
  title: "Join your organisation — AscendMentor AI",
};

export default async function JoinPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const org = await getOrganisationByInviteCode(code);

  // ── Invalid / unusable invite states ──────────────────────────────────────
  if (!org || org.status !== "active") {
    return (
      <Shell>
        <StateCard
          icon={<XCircle className="h-7 w-7" />}
          iconClass="text-red-400 bg-red-500/10"
          title={!org ? "Invite link not recognised" : "Invites are paused"}
          body={
            !org
              ? "This invite link is invalid or has been replaced. Ask your organisation's programme contact for the current link."
              : `${org.name}'s invite link is currently paused. Contact your programme administrator.`
          }
        />
      </Shell>
    );
  }

  const used = await countOrgMembers(org.id);
  if (used >= org.seat_count) {
    return (
      <Shell>
        <StateCard
          icon={<Users className="h-7 w-7" />}
          iconClass="text-yellow-400 bg-yellow-500/10"
          title="All seats are taken"
          body={`${org.name}'s licence is fully allocated. Ask your programme administrator to add more seats.`}
        />
      </Shell>
    );
  }

  // ── Logged-in user: redeem now ────────────────────────────────────────────
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const result = await redeemInviteCode(user.id, code);
    if (result.ok) {
      const { data: learner } = await supabase
        .from("learners")
        .select("onboarding_complete")
        .eq("user_id", user.id)
        .maybeSingle();
      redirect(learner?.onboarding_complete ? "/dashboard" : "/onboarding");
    }
    // redeem failed in a way we didn't pre-check — show generic error
    return (
      <Shell>
        <StateCard
          icon={<XCircle className="h-7 w-7" />}
          iconClass="text-red-400 bg-red-500/10"
          title="Couldn't join the organisation"
          body="Something went wrong joining this organisation. Please try again, or contact support@ascendmentor.ai."
        />
      </Shell>
    );
  }

  // ── Logged-out: branded invite → signup ───────────────────────────────────
  return (
    <Shell>
      <div className="w-full max-w-md bg-card border border-border/50 rounded-3xl p-8 text-center">
        <div className="w-14 h-14 rounded-2xl bg-primary/15 text-yellow-400 flex items-center justify-center mx-auto mb-6">
          <Building2 className="h-7 w-7" />
        </div>

        <p className="text-xs font-semibold text-yellow-400 tracking-[0.2em] uppercase mb-2">
          Institutional invite
        </p>
        <h1 className="font-display text-xl font-bold text-foreground">
          Join {org.name} on AscendMentor AI
        </h1>
        <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
          {org.name} has licensed AscendMentor AI for its leadership team. Create
          your account and your access is activated immediately — no review queue.
        </p>

        <Link
          href={`/signup?invite=${encodeURIComponent(code)}`}
          className="btn-gold mt-7 inline-flex w-full items-center justify-center py-3 rounded-xl text-sm transition-colors"
        >
          Create your account
        </Link>

        <p className="mt-4 text-xs text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="text-yellow-400 hover:underline">
            Sign in
          </Link>{" "}
          first, then open this link again.
        </p>
      </div>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-5">
      <div className="flex items-center gap-3 mb-10">
        <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
          <span className="text-primary-foreground font-bold text-sm font-display">A</span>
        </div>
        <div>
          <p className="font-display font-bold text-sm leading-none">AscendMentor</p>
          <p className="text-[9px] text-muted-foreground tracking-[0.2em] uppercase mt-0.5">AI by BGC</p>
        </div>
      </div>
      {children}
    </div>
  );
}

function StateCard({
  icon,
  iconClass,
  title,
  body,
}: {
  icon: React.ReactNode;
  iconClass: string;
  title: string;
  body: string;
}) {
  return (
    <div className="w-full max-w-md bg-card border border-border/50 rounded-3xl p-8 text-center">
      <div className={`w-14 h-14 rounded-2xl ${iconClass} flex items-center justify-center mx-auto mb-6`}>
        {icon}
      </div>
      <h1 className="font-display text-xl font-bold text-foreground">{title}</h1>
      <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{body}</p>
      <Link
        href="/"
        className="mt-6 inline-block text-sm text-yellow-400 hover:text-yellow-300 transition-colors"
      >
        ← Back to AscendMentor AI
      </Link>
    </div>
  );
}
