import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "AscendMentor AI — Getting Started",
  description: "Set up your leadership mastery profile.",
};

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Server-side auth check — redirect if not logged in
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Minimal header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-border/40">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm font-display">A</span>
          </div>
          <span className="font-display font-semibold text-foreground text-sm">
            AscendMentor AI
          </span>
        </div>
        <span className="text-xs text-muted-foreground hidden sm:block">
          Powered by BGC Blackbelt OS™
        </span>
      </header>

      {/* Page content */}
      <main className="flex-1 flex flex-col items-center justify-start py-10 px-4">
        <div className="w-full max-w-2xl">{children}</div>
      </main>
    </div>
  );
}
