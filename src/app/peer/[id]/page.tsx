// ─────────────────────────────────────────────────────────────────────────────
// /peer/[id] — public 360 validation portal.
// A learner's invited colleague opens this link and rates them. No login.
// ─────────────────────────────────────────────────────────────────────────────

import type { Metadata } from "next";
import Link from "next/link";
import { XCircle, CheckCircle2 } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { PeerResponseForm } from "@/components/validation/peer-response-form";
import { Logo } from "@/components/brand/logo";

export const metadata: Metadata = {
  title: "Peer Validation — ClarityOS",
};

export default async function PeerValidationPortal({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const admin = createAdminClient();

  const { data: validator } = await admin
    .from("validators")
    .select("id, status, relationship, learner_id")
    .eq("id", id)
    .maybeSingle();

  let learnerName = "this leader";
  if (validator?.learner_id) {
    const { data: learner } = await admin
      .from("learners")
      .select("first_name, full_name")
      .eq("user_id", validator.learner_id)
      .maybeSingle();
    learnerName = learner?.first_name ?? learner?.full_name ?? learnerName;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-5 py-12">
      <div className="mb-8">
        <Logo markClassName="h-9 w-9" wordmarkClassName="text-base" />
      </div>

      <div className="w-full max-w-lg">
        {!validator ? (
          <StateCard
            icon={<XCircle className="h-7 w-7" />}
            iconClass="text-red-400 bg-red-500/10"
            title="Validation link not recognised"
            body="This link is invalid or has expired. Please ask the person who invited you for a fresh link."
          />
        ) : validator.status === "completed" ? (
          <StateCard
            icon={<CheckCircle2 className="h-7 w-7" />}
            iconClass="text-yellow-400 bg-primary/10"
            title="Already submitted"
            body={`Your validation of ${learnerName} has already been recorded. Thank you.`}
          />
        ) : (
          <>
            <div className="text-center mb-7">
              <p className="text-xs font-semibold text-yellow-400 tracking-[0.2em] uppercase mb-2">
                360 Leadership Validation
              </p>
              <h1 className="font-display text-2xl font-bold text-foreground">
                How does {learnerName} lead?
              </h1>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                {learnerName} is on a leadership mastery journey with ClarityOS and
                has asked for your honest perspective. It takes two minutes and stays
                confidential — they see the aggregate, not who said what.
              </p>
            </div>
            <PeerResponseForm validatorId={validator.id} learnerName={learnerName} />
          </>
        )}
      </div>
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
    <div className="bg-card border border-border/50 rounded-3xl p-8 text-center">
      <div className={`w-14 h-14 rounded-2xl ${iconClass} flex items-center justify-center mx-auto mb-6`}>
        {icon}
      </div>
      <h1 className="font-display text-xl font-bold text-foreground">{title}</h1>
      <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{body}</p>
      <Link href="/" className="mt-6 inline-block text-sm text-yellow-400 hover:text-yellow-300 transition-colors">
        ← ClarityOS
      </Link>
    </div>
  );
}
