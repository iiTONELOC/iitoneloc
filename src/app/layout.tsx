import "./globals.css";
import type { Metadata } from "next";
import { Header } from "@/components";

const styles = {
  body: "w-full h-screen flex flex-col justify-start items-center bg-sig-dark text-gray-100",
};

export const metadata: Metadata = {
  title: "Anthony Tropeano | Security Engineer",
  description: "Security engineer and toolmaker. OSINT platforms, infrastructure automation, systems-level software.",
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
