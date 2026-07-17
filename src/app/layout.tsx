import "./globals.css";
import type { Metadata } from "next";
import { JetBrains_Mono, Hanken_Grotesk } from "next/font/google";
import { TelemetryBar, SiteNav } from "@/components";

// Self-hosted via next/font (no external request; satisfies CSP font-src 'self').
const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-mono",
  display: "swap",
});

const sans = Hanken_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://atropeano.com"),
  title: "Anthony Tropeano | Security Engineer",
  description:
    "Security engineer tracing trust assumptions across applied cryptography, applications, infrastructure, networking, and operations.",
  openGraph: {
    type: "website",
    url: "https://atropeano.com",
    siteName: "atropeano.com",
    title: "Anthony Tropeano | Security Engineer",
    description:
      "Security engineer building secure systems across cryptography, applications, infrastructure, and operations.",
    images: [
      {
        url: "/og.png",
        width: 2116,
        height: 1654,
        alt: "Anthony Tropeano, Security Engineer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Anthony Tropeano | Security Engineer",
    description:
      "Security engineer building secure systems across cryptography, applications, infrastructure, and operations.",
    images: ["/og.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${mono.variable} ${sans.variable}`}>
      <body className="min-h-screen bg-op-bg font-sans text-op-text antialiased">
        <TelemetryBar />
        <SiteNav />
        {children}
      </body>
    </html>
  );
}
