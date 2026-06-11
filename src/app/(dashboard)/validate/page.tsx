// Peer Validation page — invite validators, view status

import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PeerValidationClient } from "@/components/validation/peer-validation-client";

export const metadata: Metadata = {
  title: "Peer Validation — AscendMentor AI",
};

export default async function ValidatePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [validatorsRes, learnerRes] = await Promise.all([
    supabase
      .from("validators")
      .select("*")
      .eq("learner_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("learners")
      .select("id, full_name, subscription_tier")
      .eq("user_id", user.id)
      .single(),
  ]);

  const validators = validatorsRes.data ?? [];
  const learner = learnerRes.data;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Peer Validation</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Invite colleagues to validate your leadership behaviours and earn belt upgrades.
          Peer validation contributes 10 points to your BGC Mastery Score™.
        </p>
      </div>

      <PeerValidationClient
        validators={validators}
        learnerId={learner?.id ?? user.id}
        userId={user.id}
      />
    </div>
  );
}
