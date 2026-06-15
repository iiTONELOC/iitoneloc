import type { Metadata } from "next";
import { JSX } from "react";
import {
  Hero,
  FeaturedWork,
  GithubStrip,
  AboutSection,
  ContactSection,
  RevealObserver,
  Footer,
} from "@/components";

export const metadata: Metadata = {
  alternates: {
    canonical: "/",
  },
};

/**
 * Single-scroll home: telemetry + nav come from the root layout; this composes
 * hero, featured work, the demoted github strip, about, contact, and footer.
 * The page renders immediately; <GithubStrip /> loads its data on the client
 * from /api/repos so nothing here blocks on GitHub. The globe canvas is wired
 * into <Hero /> in a later phase.
 */
export default function Home(): JSX.Element {
  return (
    <main>
      <Hero />
      <FeaturedWork />
      <GithubStrip />
      <AboutSection />
      <ContactSection />
      <Footer />
      <RevealObserver />
    </main>
  );
}
