// ─────────────────────────────────────────────────────────────────────────────
// Clarity Assessment™ — Step 6
// Server wrapper: fetches round number, renders client wizard.
// ─────────────────────────────────────────────────────────────────────────────

import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { AssessmentWizard } from "@/components/assessment/wizard";

export const metadata: Metadata = {
  title: "Clarity Assessment™ — AscendMentor AI",
};

export default async function AssessmentPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Count previous rounds so we can label this one correctly
  const { count } = await supabase
    .from("clarity_assessments")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);

  const assessmentRound = (count ?? 0) + 1;

  return (
    <div className="space-y-6 animate-fade-up">
      {/* ── Header ── */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Dashboard
        </Link>
      </div>

      <div>
        <h1 className="font-display text-2xl lg:text-3xl font-bold text-foreground">
          BGC Clarity Assessment™
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          26 questions across 5 leadership dimensions · ~10 minutes ·{" "}
          {assessmentRound > 1 ? `Round ${assessmentRound}` : "Round 1"}
        </p>
      </div>

      {/* ── Wizard ── */}
      <AssessmentWizard assessmentRound={assessmentRound} />
    </div>
  );
}
