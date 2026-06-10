"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Tables } from "@/types/supabase";

export type LearnerRow = Tables<"learners">;
export type MasteryScoreRow = Tables<"mastery_scores">;
export type ClarityAssessmentRow = Tables<"clarity_assessments">;

interface UseLearnerReturn {
  learner: LearnerRow | null;
  latestMastery: MasteryScoreRow | null;
  latestAssessment: ClarityAssessmentRow | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useLearner(): UseLearnerReturn {
  const [learner, setLearner] = useState<LearnerRow | null>(null);
  const [latestMastery, setLatestMastery] = useState<MasteryScoreRow | null>(null);
  const [latestAssessment, setLatestAssessment] = useState<ClarityAssessmentRow | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("Not authenticated");
      setIsLoading(false);
      return;
    }

    // Fetch all three in parallel
    const [learnerRes, masteryRes, assessmentRes] = await Promise.all([
      supabase
        .from("learners")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle(),

      supabase
        .from("mastery_scores")
        .select("*")
        .eq("user_id", user.id)
        .order("snapshot_date", { ascending: false })
        .limit(1)
        .maybeSingle(),

      supabase
        .from("clarity_assessments")
        .select("*")
        .eq("user_id", user.id)
        .order("completed_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

    if (learnerRes.error) setError(learnerRes.error.message);
    setLearner(learnerRes.data ?? null);
    setLatestMastery(masteryRes.data ?? null);
    setLatestAssessment(assessmentRes.data ?? null);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    learner,
    latestMastery,
    latestAssessment,
    isLoading,
    error,
    refetch: fetchData,
  };
}
