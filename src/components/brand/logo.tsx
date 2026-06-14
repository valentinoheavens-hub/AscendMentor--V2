// ─────────────────────────────────────────────────────────────────────────────
// ClarityOS — Brand Logo
// Renders the official ClarityOS lockup (public/clarityos-logo.png). The artwork
// has a dark wordmark tuned for light surfaces, so in dark mode the logo sits on
// a subtle white backing to stay crisp. LogoMark is a lightweight SVG of just the
// icon, for tight/icon-only spots (and dark surfaces that aren't theme-driven).
// ─────────────────────────────────────────────────────────────────────────────

import Image from "next/image";
import { useId } from "react";

interface LogoProps {
  /** Height (and spacing) classes for the lockup. Width is auto. Default h-9. */
  className?: string;
  /** Eager-load for above-the-fold headers. */
  priority?: boolean;
}

/** Official ClarityOS lockup (mark + wordmark + tagline) — the user's artwork. */
export function Logo({ className = "h-9 w-auto", priority = false }: LogoProps) {
  return (
    <span className="inline-flex items-center dark:rounded-lg dark:bg-white dark:px-2 dark:py-1">
      <Image
        src="/clarityos-logo-v2.png"
        alt="ClarityOS — Clarity. Mastery. Scale."
        width={1008}
        height={251}
        priority={priority}
        className={className}
      />
    </span>
  );
}

interface LogoMarkProps {
  className?: string;
  title?: string;
}

/** Icon-only ClarityOS mark (SVG) — C-arc + cloud + dispersing pixels. */
export function LogoMark({ className = "h-8 w-8", title = "ClarityOS" }: LogoMarkProps) {
  const gid = useId();
  return (
    <svg
      viewBox="0 0 64 64"
      role="img"
      aria-label={title}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id={`${gid}-grad`} x1="6" y1="10" x2="58" y2="56" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#1B6FF3" />
          <stop offset="1" stopColor="#16C0F0" />
        </linearGradient>
      </defs>
      <path
        d="M46 13 A26 26 0 1 0 46 51"
        fill="none"
        stroke={`url(#${gid}-grad)`}
        strokeWidth="7"
        strokeLinecap="round"
      />
      <path
        d="M24 40 a8 8 0 0 1 0.6 -15.9 a10 10 0 0 1 19 -1.2 a7 7 0 0 1 -1.6 13.8 Z"
        fill={`url(#${gid}-grad)`}
      />
      <rect x="45.5" y="24" width="6" height="6" rx="1.4" fill="#1B6FF3" />
      <rect x="53" y="22" width="4.5" height="4.5" rx="1.1" fill="#2E90FA" />
      <rect x="45.5" y="33" width="5" height="5" rx="1.2" fill="#16C0F0" />
      <rect x="52.5" y="31.5" width="3.5" height="3.5" rx="1" fill="#16C0F0" opacity="0.85" />
    </svg>
  );
}

export default Logo;
