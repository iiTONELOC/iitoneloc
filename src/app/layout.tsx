import "./globals.css";
import type { Metadata } from "next";
import { Header } from "@/components";

const styles = {
  body: "w-full h-screen flex flex-col justify-start items-center bg-sig-dark text-gray-100",
};

export const metadata: Metadata = {
  title: "Anthony Tropeano | Security Engineer",
  description:
    "Security engineer and toolmaker. OSINT platforms, infrastructure automation, systems-level software.",
  icons: {
    icon: [
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
    <html lang="en">
      <body className={styles.body}>
        <Header />
        {children}
      </body>
    </html>
  );
}
