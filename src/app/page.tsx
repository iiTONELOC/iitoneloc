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
