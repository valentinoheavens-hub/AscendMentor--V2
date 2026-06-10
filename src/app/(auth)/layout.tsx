// ─────────────────────────────────────────────────────────────────────────────
// Auth Layout
// Centred card layout with BGC branding. Used by login, signup, reset flows.
// ─────────────────────────────────────────────────────────────────────────────

import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "AscendMentor AI — Sign In",
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
            backgroundImage: `radial-gradient(circle at 1px 1px, #B8960C 1px, transparent 0)`,
            backgroundSize: "40px 40px",
          }}
        />
        {/* Gold glow top-right */}
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        {/* Subtle glow bottom-left */}
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </div>

      {/* Logo mark */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg font-display">A</span>
          </div>
          <div className="text-left">
            <p className="text-foreground font-display font-bold text-lg leading-none">
              AscendMentor
            </p>
            <p className="text-muted-foreground text-xs tracking-widest uppercase">
              AI by BGC
            </p>
          </div>
        </div>
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
