// BGC AI Coach page — server component shell + client chat interface

import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ChatInterface } from "@/components/coaching/chat-interface";
import type { SessionType } from "@/types/platform";

export const metadata: Metadata = {
  title: "BGC AI Coach — ClarityOS",
};

const SESSION_TYPES: { id: SessionType; label: string; desc: string }[] = [
  { id: "coaching", label: "BGC Coaching", desc: "Framework-guided leadership coaching" },
  { id: "reflection", label: "Weekly Reflection", desc: "Review your week and log evidence" },
  { id: "assessment_debrief", label: "Assessment Debrief", desc: "Understand your Clarity scores" },
];

export default async function CoachingPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const params = await searchParams;
  const sessionType = (SESSION_TYPES.find(s => s.id === params.type)?.id ?? "coaching") as SessionType;

  return (
    <div className="max-w-3xl mx-auto h-[calc(100vh-8rem)] flex flex-col gap-4">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">BGC AI Coach</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Your personalised BGC Blackbelt OS™ coach — powered by Groq AI
        </p>
      </div>

      {/* Session type tabs */}
      <div className="flex gap-2 flex-wrap">
        {SESSION_TYPES.map(({ id, label, desc }) => (
          <a
            key={id}
            href={`/coaching?type=${id}`}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
              sessionType === id
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card text-muted-foreground border-border/60 hover:text-foreground hover:border-border"
            }`}
          >
            <span className="block">{label}</span>
            <span className={`text-[11px] font-normal ${sessionType === id ? "text-primary-foreground/70" : "text-muted-foreground/70"}`}>
              {desc}
            </span>
          </a>
        ))}
      </div>

      {/* Chat — grows to fill remaining space */}
      <div className="flex-1 bg-card rounded-2xl border border-border/40 p-4 overflow-hidden flex flex-col">
        <ChatInterface sessionType={sessionType} sessionId={null} />
      </div>
    </div>
  );
}
