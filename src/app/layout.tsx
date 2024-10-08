import "./globals.css";
import type { Metadata } from "next";
import { Header } from "@/components";

const styles = {
  body: "w-full h-screen flex flex-col justify-start items-center bg-gradient-to-l from-slate-950 via-slate-900 to-slate-950 text-gray-100",
};

export const metadata: Metadata = {
  title: "Anthony Tropeano",
  description: "Software Developer and aspiring Cybersecurity Engineer",
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
