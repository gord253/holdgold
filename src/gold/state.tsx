import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { demoSeed, goldData, randAddr, type LogEntry, type Winner } from "./data";

export type GoldState = {
  totalPaidXau: number;
  holders: number;
  payoutsToday: number;
  avgPayout24h: number;
  potXau: number;
  secondsToDraw: number;
  drawing: boolean;
  winners: Winner[];
  log: LogEntry[];
  drawCount: number;
  demo: boolean;
};

const secondsUntil = (iso: string) => {
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return 0;
  return Math.max(0, Math.floor((t - Date.now()) / 1000));
};

const rand = (min: number, max: number) => min + Math.random() * (max - min);

function staticState(): GoldState {
  return {
    totalPaidXau: goldData.totalPaidXau,
    holders: goldData.holders,
    payoutsToday: goldData.payoutsToday,
    avgPayout24h: goldData.avgPayout24h,
    potXau: goldData.ticket.potXau,
    secondsToDraw: 0,
    drawing: false,
    winners: goldData.winners,
    log: goldData.devWallet.log,
    drawCount: 0,
    demo: goldData.demo,
  };
}

function demoState(): GoldState {
  const now = Date.now();
  const winners: Winner[] = Array.from({ length: 6 }, (_, i) => ({
    time: new Date(now - (i + 1) * 3600_000).toISOString(),
    wallet: randAddr(),
    amount: rand(0.11, 0.62),
    tx: randAddr(88),
  }));
  const log: LogEntry[] = Array.from({ length: 7 }, (_, i) => ({
    id: i,
    amount: rand(0.0009, 0.0041),
    ago: `${(i + 1) * 4}m ago`,
    tx: randAddr(88),
  }));
  return {
    totalPaidXau: demoSeed.totalPaidXau,
    holders: demoSeed.holders,
    payoutsToday: demoSeed.payoutsToday,
    avgPayout24h: demoSeed.avgPayout24h,
    potXau: demoSeed.potXau,
    secondsToDraw: demoSeed.drawInSeconds,
    drawing: false,
    winners,
    log,
    drawCount: 0,
    demo: true,
  };
}

const GoldContext = createContext<GoldState>(staticState());

/**
 * Provides the numbers every section reads. Server renders the static mock so
 * the HTML is complete; the client swaps in the simulation after mount.
 */
export function GoldStateProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<GoldState>(staticState);

  useEffect(() => {
    if (!goldData.demo) {
      setState((s) => ({ ...s, secondsToDraw: secondsUntil(goldData.ticket.nextDrawIso) }));
      const tick = window.setInterval(() => {
        setState((s) => ({ ...s, secondsToDraw: secondsUntil(goldData.ticket.nextDrawIso) }));
      }, 1000);
      return () => window.clearInterval(tick);
    }

    setState(demoState());
    let nextLogId = 100;

    const second = window.setInterval(() => {
      setState((s) => {
        if (s.drawing) return s;
        if (s.secondsToDraw > 1) return { ...s, secondsToDraw: s.secondsToDraw - 1 };
        return { ...s, secondsToDraw: 0, drawing: true };
      });
    }, 1000);

    let payoutTimer = 0;
    const schedulePayout = () => {
      payoutTimer = window.setTimeout(() => {
        const amount = rand(0.0006, 0.0034);
        setState((s) => ({
          ...s,
          totalPaidXau: s.totalPaidXau + amount * 40,
          payoutsToday: s.payoutsToday + (Math.random() > 0.55 ? 1 : 0),
          holders: s.holders + (Math.random() > 0.7 ? 1 : 0),
          avgPayout24h: s.avgPayout24h + rand(-0.00004, 0.00007),
          potXau: s.potXau + amount,
          log: [
            { id: nextLogId++, amount, ago: "just now", tx: randAddr(88) },
            ...s.log.slice(0, 7),
          ],
        }));
        schedulePayout();
      }, rand(3800, 8200));
    };
    schedulePayout();

    return () => {
      window.clearInterval(second);
      window.clearTimeout(payoutTimer);
    };
  }, []);

  // The draw: 5 seconds of "Drawing", then a winner slides in and the clock resets.
  useEffect(() => {
    if (!state.drawing) return;
    const t = window.setTimeout(() => {
      setState((s) => ({
        ...s,
        drawing: false,
        secondsToDraw: goldData.ticket.intervalMin * 60,
        potXau: rand(0.004, 0.02),
        drawCount: s.drawCount + 1,
        winners: [
          { time: new Date().toISOString(), wallet: randAddr(), amount: s.potXau, tx: randAddr(88) },
          ...s.winners.slice(0, 9),
        ],
      }));
    }, 5000);
    return () => window.clearTimeout(t);
  }, [state.drawing]);

  return <GoldContext.Provider value={state}>{children}</GoldContext.Provider>;
}

export const useGold = () => useContext(GoldContext);

/** Tabular-number roll from the previous value to the next one. */
export function useRolling(value: number, decimals: number, ms = 900): string {
  const [shown, setShown] = useState(value);
  const fromRef = useRef(value);
  const startRef = useRef(0);
  useEffect(() => {
    const from = fromRef.current;
    if (from === value) return;
    startRef.current = performance.now();
    let frame = 0;
    const step = (now: number) => {
      const p = Math.min(1, (now - startRef.current) / ms);
      const eased = 1 - (1 - p) * (1 - p) * (1 - p);
      const v = from + (value - from) * eased;
      setShown(v);
      if (p < 1) frame = requestAnimationFrame(step);
      else fromRef.current = value;
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [value, ms]);
  return decimals === 0
    ? Math.round(shown).toLocaleString("en-US")
    : shown.toFixed(decimals);
}

export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const on = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return reduced;
}

export function toast(message: string) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("gold:toast", { detail: message }));
}

export function useCopy() {
  return useCallback(async (text: string, label = "copied") => {
    try {
      await navigator.clipboard.writeText(text);
      toast(label);
    } catch {
      toast("copy failed");
    }
  }, []);
}

/** Transform-only reveal: elements slide up when they enter the viewport. */
export function useReveal<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const targets = el.querySelectorAll<HTMLElement>("[data-reveal]");
    if (targets.length === 0) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.setAttribute("data-reveal", "in");
            io.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
    );
    targets.forEach((t) => io.observe(t));
    return () => io.disconnect();
  }, []);
  return ref;
}

export function useTilt(max = 10) {
  const ref = useRef<HTMLDivElement | null>(null);
  const reduced = useReducedMotion();
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (reduced) {
      el.style.transform = "";
      return;
    }
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (!fine) {
      el.dataset.sway = "true";
      return;
    }
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      el.style.transform = `perspective(1100px) rotateY(${x * max}deg) rotateX(${-y * max}deg)`;
      el.style.setProperty("--shine-x", `${(x + 0.5) * 100}%`);
      el.style.setProperty("--shine-y", `${(y + 0.5) * 100}%`);
    };
    const onLeave = () => {
      el.style.transform = "perspective(1100px) rotateY(0deg) rotateX(0deg)";
    };
    const parent = el.parentElement ?? el;
    parent.addEventListener("pointermove", onMove);
    parent.addEventListener("pointerleave", onLeave);
    return () => {
      parent.removeEventListener("pointermove", onMove);
      parent.removeEventListener("pointerleave", onLeave);
    };
  }, [max, reduced]);
  return ref;
}

export function useMagnetic(strength = 0.25) {
  const ref = useRef<HTMLAnchorElement | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      el.style.transform = `translate(${dx * strength}px, ${dy * strength}px)`;
    };
    const onLeave = () => {
      el.style.transform = "translate(0px, 0px)";
    };
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, [strength]);
  return ref;
}
