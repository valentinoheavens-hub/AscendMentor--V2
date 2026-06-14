// ─────────────────────────────────────────────────────────────────────────────
// ClarityOS — Brand Logo
// Faithful, scalable recreation of the ClarityOS mark: an open "C" arc enclosing
// a cloud, with pixels dispersing to the right (clarity → data → scale). The
// wordmark is rendered as live text so it stays crisp and theme-aware.
// ─────────────────────────────────────────────────────────────────────────────

import { useId } from "react";

interface LogoMarkProps {
  className?: string;
  title?: string;
}

/** The icon only — C-arc + cloud + dispersing pixels, in the brand gradient. */
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

      {/* Open "C" ring — gap on the right where the pixels break out */}
      <path
        d="M46 13 A26 26 0 1 0 46 51"
        fill="none"
        stroke={`url(#${gid}-grad)`}
        strokeWidth="7"
        strokeLinecap="round"
      />

      {/* Cloud, nestled inside the C */}
      <path
        d="M24 40
           a8 8 0 0 1 0.6 -15.9
           a10 10 0 0 1 19 -1.2
           a7 7 0 0 1 -1.6 13.8
           Z"
        fill={`url(#${gid}-grad)`}
      />

      {/* Dispersing pixels — clarity becoming data, scaling out */}
      <rect x="45.5" y="24" width="6" height="6" rx="1.4" fill="#1B6FF3" />
      <rect x="53"   y="22" width="4.5" height="4.5" rx="1.1" fill="#2E90FA" />
      <rect x="45.5" y="33" width="5" height="5" rx="1.2" fill="#16C0F0" />
      <rect x="52.5" y="31.5" width="3.5" height="3.5" rx="1" fill="#16C0F0" opacity="0.85" />
    </svg>
  );
}

interface LogoProps {
  /** Show the "ClarityOS" wordmark next to the mark. Default true. */
  showWordmark?: boolean;
  /** Show the "Clarity. Mastery. Scale." tagline under the wordmark. */
  showTagline?: boolean;
  /** Wrapper classes (controls overall sizing/spacing). */
  className?: string;
  /** Mark size classes. Default h-8 w-8. */
  markClassName?: string;
  /** Wordmark text size classes. Default text-lg. */
  wordmarkClassName?: string;
}

/** Full lockup: mark + ClarityOS wordmark (and optional tagline). */
export function Logo({
  showWordmark = true,
  showTagline = false,
  className = "flex items-center gap-2.5",
  markClassName = "h-8 w-8",
  wordmarkClassName = "text-lg",
}: LogoProps) {
  return (
    <span className={className}>
      <LogoMark className={markClassName} />
      {showWordmark && (
        <span className="flex flex-col leading-none">
          <span className={`font-display font-bold tracking-tight ${wordmarkClassName}`}>
            <span className="text-foreground">Clarity</span>
            <span className="text-brand-gradient">OS</span>
          </span>
          {showTagline && (
            <span className="mt-1 text-[9px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Clarity. Mastery. Scale.
            </span>
          )}
        </span>
      )}
    </span>
  );
}

export default Logo;
