import type { Metadata } from "next";
import { Jost, Inter } from "next/font/google";
import Script from "next/script";
import { Toaster } from "sonner";
import "./globals.css";

const jost = Jost({
  variable: "--font-jost",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "https://clarityos.ai"),
  title: {
    default: "ClarityOS — Clarity. Mastery. Scale.",
    template: "%s | ClarityOS",
  },
  description:
    "Smart SaaS. Clear impact. The AI-powered leadership mastery platform for African founders and executives, built on BGC's five proprietary frameworks. Measure your Mastery Score™.",
  applicationName: "ClarityOS",
  keywords: [
    "leadership coaching",
    "African executives",
    "executive coaching",
    "AI coaching",
    "Blackbelt Global Consulting",
    "Dr. Valentino Heavens",
    "Clarity Mandate",
    "Mastery Score",
    "ClarityOS",
  ],
  authors: [{ name: "Dr. Valentino Heavens", url: "https://blackbeltglobal.co" }],
  creator: "Blackbelt Global Consulting Limited",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: "/clarityos-mark.svg",
  },
  openGraph: {
    type: "website",
    locale: "en_NG",
    siteName: "ClarityOS",
    title: "ClarityOS — Clarity. Mastery. Scale.",
    description:
      "Smart SaaS. Clear impact. AI-powered leadership mastery for African founders and executives, built on BGC's proprietary frameworks.",
    images: [{ url: "/clarityos-logo.svg", width: 460, height: 120, alt: "ClarityOS" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "ClarityOS — Clarity. Mastery. Scale.",
    description: "Smart SaaS. Clear impact. AI-powered leadership mastery for African leaders.",
    images: ["/clarityos-logo.svg"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${jost.variable} ${inter.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Preconnect to Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Set the theme before paint to avoid a flash. Stored choice wins;
            otherwise default to the brand's dark theme. */}
        <Script id="theme-init" strategy="beforeInteractive">
          {`(function(){try{var t=localStorage.getItem('theme');var dark=t?t==='dark':true;var e=document.documentElement;e.classList.toggle('dark',dark);e.style.colorScheme=dark?'dark':'light';}catch(e){}})();`}
        </Script>
      </head>
      <body
        className="min-h-dvh bg-background text-foreground antialiased"
        suppressHydrationWarning
      >
        {children}
        <Toaster
          position="top-right"
          theme="system"
          toastOptions={{
            style: {
              fontFamily: "var(--font-jost)",
            },
          }}
        />
      </body>
    </html>
  );
}
