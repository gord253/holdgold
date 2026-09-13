import { createFileRoute } from "@tanstack/react-router";

import { ScrollScrub } from "@/components/scroll-scrub/scroll-scrub";
import type { ScrollScrubScene } from "@/components/scroll-scrub/scroll-scrub";
import { scrollScrubScenes, scrollScrubTheme } from "@/scroll-scrub-scenes";

import {
  BootScreen,
  BuyButton,
  MobileBuyBar,
  PaperLink,
  ParticleField,
  ScrollProgressBar,
  SiteNav,
  TickerTape,
  ToastHost,
} from "@/gold/chrome";
import { HowItPays, RainCounter } from "@/gold/journey";
import { BuySection, GoldenTicket, ProofPanel, SiteFooter, Tokenomics } from "@/gold/sections";
import { GoldStateProvider } from "@/gold/state";

import "@/gold/gold.css";
import "@/gold/gold-journey.css";
import "@/gold/gold2.css";

const FONTS =
  "https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;700&display=swap";

export const Route = createFileRoute("/")({
  head: () => ({
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: FONTS },
    ],
  }),
  component: Index,
});

// Module constant: the chapter copy lives in scroll-scrub-scenes.ts; the
// interactive pieces (CTAs, the live counter) are attached here once so the
// scenes array keeps a stable identity across renders.
const SCENES: ScrollScrubScene[] = scrollScrubScenes.map((scene) => {
  if (scene.id === "hero") {
    return {
      ...scene,
      actions: (
        <>
          <BuyButton />
          <PaperLink />
        </>
      ),
    };
  }
  if (scene.id === "rain") {
    return { ...scene, actions: <RainCounter /> };
  }
  if (scene.id === "lore") {
    return { ...scene, actions: <PaperLink>Read the whitepaper</PaperLink> };
  }
  return scene;
});

function Index() {
  return (
    <GoldStateProvider>
      <div className="g-page" id="top">
        <BootScreen />
        <ParticleField />
        <ScrollProgressBar />
        <SiteNav />
        <main>
          <ScrollScrub scenes={SCENES} theme={scrollScrubTheme} />
          <HowItPays />
          <GoldenTicket />
          <ProofPanel />
          <Tokenomics />
          <BuySection />
        </main>
        <SiteFooter />
        <TickerTape />
        <MobileBuyBar />
        <ToastHost />
      </div>
    </GoldStateProvider>
  );
}
