// ─────────────────────────────────────────────────────────────────────────────
// Auth Layout
// Centred card layout with BGC branding. Used by login, signup, reset flows.
// ─────────────────────────────────────────────────────────────────────────────

import type { Metadata } from "next";
import { Logo } from "@/components/brand/logo";

export const metadata: Metadata = {
  title: "ClarityOS — Sign In",
  description: "Leadership mastery for African founders and executives.",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      {/* Background pattern */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #1B6FF3 1px, transparent 0)`,
            backgroundSize: "40px 40px",
          }}
        />
        {/* Brand glow top-right */}
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/15 rounded-full blur-3xl" />
        {/* Cyan glow bottom-left */}
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-cyan-400/10 rounded-full blur-3xl" />
        {/* Violet accent */}
        <div className="absolute top-1/3 -left-24 w-72 h-72 bg-violet-500/10 rounded-full blur-3xl" />
      </div>

      {/* Logo mark */}
      <div className="mb-8 flex justify-center">
        <Logo markClassName="h-10 w-10" wordmarkClassName="text-xl" showTagline />
      </div>

      {/* Auth card */}
      <div className="w-full max-w-md">{children}</div>

      {/* Footer */}
      <p className="mt-8 text-muted-foreground text-xs text-center">
        © {new Date().getFullYear()} Blackbelt Global Consulting Limited.
        All rights reserved.
      </p>
    </div>
  );
}
