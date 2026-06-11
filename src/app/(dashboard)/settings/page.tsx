// Settings page — profile, account, subscription info

import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SettingsClient } from "@/components/settings/settings-client";

export const metadata: Metadata = {
  title: "Settings — AscendMentor AI",
};

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: learner } = await supabase
    .from("learners")
    .select("full_name, first_name, organisation_name, role_title, country, subscription_tier, subscription_status")
    .eq("user_id", user.id)
    .single();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your profile and account preferences.
        </p>
      </div>

      <SettingsClient
        email={user.email ?? ""}
        fullName={learner?.full_name ?? ""}
        firstName={learner?.first_name ?? ""}
        organisation={learner?.organisation_name ?? ""}
        roleTitle={learner?.role_title ?? ""}
        country={learner?.country ?? ""}
        subscriptionTier={learner?.subscription_tier ?? "free"}
        subscriptionStatus={learner?.subscription_status ?? "inactive"}
      />
    </div>
  );
}
