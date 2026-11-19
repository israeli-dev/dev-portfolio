import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { GeistSerif } from "geist/font/serif";
import "./globals.css";
import { siteUrl } from "@/lib/site";

const canonical = siteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(canonical),
  title: {
    default: "Israel Kolawole — AI Engineer & Geoscience",
    template: "%s · Folio",
  },
  description:
    "Portfolio of Israel Kolawole, an AI engineer applying LLMs and modern software to geoscience and real operational problems — and Folio, the portfolio platform he built.",
  applicationName: "Folio",
  authors: [{ name: "Israel Kolawole", url: "https://github.com/israeli-dev" }],
  creator: "Israel Kolawole",
  keywords: [
    "Israel Kolawole",
    "AI engineer",
    "AI application developer",
    "geoscience",
    "LLM applications",
    "portfolio platform",
    "FastAPI",
    "Next.js",
  ],
  openGraph: {
    type: "website",
    siteName: "Folio",
    title: "Israel Kolawole — AI Engineer & Geoscience",
    description:
      "AI applications where geoscience, LLMs and real operational data meet. Plus Folio, a portfolio platform with GitHub sync and four template engines.",
    url: "/",
    locale: "en_GB",
  },
  twitter: {
    card: "summary_large_image",
    title: "Israel Kolawole — AI Engineer & Geoscience",
    description: "AI applications for geoscience and real operational problems.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#08090b",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable} ${GeistSerif.variable}`}>
      <body className="min-h-dvh bg-ink text-text antialiased">{children}</body>
    </html>
  );
}
