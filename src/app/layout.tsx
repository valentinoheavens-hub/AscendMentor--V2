import type { Metadata } from "next";
import { Jost, Inter } from "next/font/google";
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
  title: {
    default: "AscendMentor AI — Clarity. Mastery. Scale.",
    template: "%s | AscendMentor AI",
  },
  description:
    "The AI-powered leadership mastery platform for African founders and executives. Built on BGC's five proprietary frameworks. Measure your Mastery Score™.",
  keywords: [
    "leadership coaching",
    "African executives",
    "executive coaching",
    "AI coaching",
    "Blackbelt Global Consulting",
    "Dr. Valentino Heavens",
    "Clarity Mandate",
    "Mastery Score",
  ],
  authors: [{ name: "Dr. Valentino Heavens", url: "https://blackbeltglobal.co" }],
  creator: "Blackbelt Global Consulting Limited",
  openGraph: {
    type: "website",
    locale: "en_NG",
    siteName: "AscendMentor AI",
    title: "AscendMentor AI — Clarity. Mastery. Scale.",
    description:
      "AI-powered leadership mastery for African founders and executives. Built on BGC's proprietary frameworks.",
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
      className={`${jost.variable} ${inter.variable} dark`}
      suppressHydrationWarning
    >
      <head>
        {/* Preconnect to Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body
        className="min-h-dvh bg-[#1A1A1A] text-[#F9F6F0] antialiased"
        suppressHydrationWarning
      >
        {children}
        <Toaster
          position="top-right"
          theme="dark"
          toastOptions={{
            style: {
              background: "#222222",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "#F9F6F0",
              fontFamily: "var(--font-jost)",
            },
          }}
        />
      </body>
    </html>
  );
}
