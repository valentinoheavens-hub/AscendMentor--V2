import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Logo } from "@/components/brand/logo";

export const metadata: Metadata = {
  title: "ClarityOS — Getting Started",
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
        <Logo markClassName="h-8 w-8" wordmarkClassName="text-sm" />
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
