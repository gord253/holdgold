/**
 * $GOLD scroll journey.
 *
 * One continuous 15s film, cut into three 5s chapters so each chapter can
 * carry its own copy. The cuts are contiguous frames of the same take, so the
 * seams are invisible and every poster is the exact first frame of its clip.
 */
import type {
  ScrollScrubScene,
  ScrollScrubTheme,
} from "@/components/scroll-scrub/scroll-scrub";

export const scrollScrubTheme: ScrollScrubTheme = {
  accent: "#F5C542",
  background: "#0A0A0A",
  ink: "#F2ECDF",
  muted: "#A89F8C",
};

export const scrollScrubScenes: ScrollScrubScene[] = [
  {
    id: "hero",
    label: "Hold",
    kicker: "Pump.fun custom pair + holder rewards",
    title: "Hold $GOLD. Get paid gold.",
    body: "The first Pump.fun coin paired with tokenized gold. Holder Rewards on. Every trade pays you in gold, every few minutes, no dev in the loop.",
    tags: ["no claiming", "no dev", "gold every few minutes"],
    clip: "/assets/world/scene-01.mp4",
    poster: "/assets/world/scene-01-poster.jpg",
    mobileClip: "/assets/world/scene-01-mobile.mp4",
    mobilePoster: "/assets/world/scene-01-mobile-poster.jpg",
    align: "left",
    scroll: 2.2,
    linger: 0.15,
    objectPosition: "62% 50%",
    mobileObjectPosition: "50% 40%",
  },
  {
    id: "rain",
    label: "Paid",
    kicker: "proof of payout",
    title: "Total gold paid to holders",
    body: "Every buy and sell pays a flat fee in gold. Holder Rewards streams it to every wallet, several times an hour. This number only goes up.",
    clip: "/assets/world/scene-02.mp4",
    poster: "/assets/world/scene-02-poster.jpg",
    mobileClip: "/assets/world/scene-02-mobile.mp4",
    mobilePoster: "/assets/world/scene-02-mobile-poster.jpg",
    align: "left",
    scroll: 2.4,
    linger: 0.2,
    objectPosition: "66% 50%",
    mobileObjectPosition: "50% 35%",
  },
  {
    id: "lore",
    label: "Lore",
    kicker: "the lore",
    title: "Boomer asset. Degen delivery.",
    body: "Boomers hold gold. Degens hold memes. $GOLD holders get paid in both.",
    tags: ["zero cope", "100% gold", "before it was a feature, it was a bar"],
    clip: "/assets/world/scene-03.mp4",
    poster: "/assets/world/scene-03-poster.jpg",
    mobileClip: "/assets/world/scene-03-mobile.mp4",
    mobilePoster: "/assets/world/scene-03-mobile-poster.jpg",
    align: "right",
    scroll: 2.2,
    linger: 0.1,
    objectPosition: "40% 50%",
    mobileObjectPosition: "50% 40%",
  },
];
