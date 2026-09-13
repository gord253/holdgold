import { useEffect, useRef, useState, type ReactNode } from "react";

import { XAU, fmtClock, fmtInt, fmtXau, goldData, truncate } from "./data";
import { useCopy, useGold, useMagnetic, useReducedMotion, useRolling } from "./state";

/* ---------- Boot screen: one second of terminal, then the page ---------- */

const BOOT_LINES = [
  "mounting quote asset ........ tokenized gold",
  "holder rewards .............. ON",
  "dev in the loop ............. NONE",
  "press any key",
];

export function BootScreen() {
  const [visible, setVisible] = useState(false);
  const [lines, setLines] = useState(0);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    setVisible(true);
    document.documentElement.dataset.boot = "on";
    const timers: number[] = [];
    BOOT_LINES.forEach((_, i) => {
      timers.push(window.setTimeout(() => setLines(i + 1), 160 + i * 230));
    });
    const dismiss = () => {
      setVisible(false);
      delete document.documentElement.dataset.boot;
    };
    timers.push(window.setTimeout(dismiss, 1700));
    window.addEventListener("keydown", dismiss, { once: true });
    window.addEventListener("pointerdown", dismiss, { once: true });
    return () => {
      timers.forEach((t) => window.clearTimeout(t));
      window.removeEventListener("keydown", dismiss);
      window.removeEventListener("pointerdown", dismiss);
      delete document.documentElement.dataset.boot;
    };
  }, [reduced]);

  if (!visible) return null;
  return (
    <div aria-hidden="true" className="g-boot">
      <div className="g-boot__term">
        <p className="g-boot__head">$GOLD / boot.log</p>
        {BOOT_LINES.slice(0, lines).map((l) => (
          <p key={l}>{l}</p>
        ))}
        <span className="g-boot__cursor" />
      </div>
    </div>
  );
}

/* ---------- Drifting gold particles on a capped canvas ---------- */

export function ParticleField() {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const reduced = useReducedMotion();
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || reduced) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let w = 0;
    let h = 0;
    let frame = 0;
    let running = true;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    type P = { x: number; y: number; r: number; vx: number; vy: number; a: number; t: number };
    const N = Math.min(120, Math.max(40, Math.floor(window.innerWidth / 12)));
    const ps: P[] = [];
    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const seed = () => {
      ps.length = 0;
      for (let i = 0; i < N; i += 1) {
        ps.push({
          x: Math.random() * w,
          y: Math.random() * h,
          r: 0.6 + Math.random() * 1.8,
          vx: (Math.random() - 0.5) * 0.12,
          vy: -0.05 - Math.random() * 0.22,
          a: 0.15 + Math.random() * 0.5,
          t: Math.random() * Math.PI * 2,
        });
      }
    };
    const draw = () => {
      if (!running) return;
      ctx.clearRect(0, 0, w, h);
      for (const p of ps) {
        p.t += 0.01;
        p.x += p.vx + Math.sin(p.t) * 0.08;
        p.y += p.vy;
        if (p.y < -4) {
          p.y = h + 4;
          p.x = Math.random() * w;
        }
        if (p.x < -4) p.x = w + 4;
        if (p.x > w + 4) p.x = -4;
        const tw = 0.6 + 0.4 * Math.sin(p.t * 3);
        ctx.beginPath();
        ctx.fillStyle = `rgba(245, 197, 66, ${p.a * tw})`;
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      frame = requestAnimationFrame(draw);
    };
    const onVis = () => {
      running = document.visibilityState === "visible";
      if (running) frame = requestAnimationFrame(draw);
      else cancelAnimationFrame(frame);
    };
    resize();
    seed();
    frame = requestAnimationFrame(draw);
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      running = false;
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [reduced]);
  return <canvas aria-hidden="true" className="g-particles" ref={ref} />;
}

/* ---------- Thin gold scroll progress bar ---------- */

export function ScrollProgressBar() {
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let frame = 0;
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? window.scrollY / max : 0;
      el.style.transform = `scaleX(${p})`;
    };
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);
  return (
    <div aria-hidden="true" className="g-progress">
      <div className="g-progress__bar" ref={ref} />
    </div>
  );
}

/* ---------- Contract chip: truncate, click to copy, toast ---------- */

export function CopyChip({ value, label, size = "sm" }: { value: string; label?: string; size?: "sm" | "lg" }) {
  const copy = useCopy();
  return (
    <button
      className={`g-chip g-chip--${size}`}
      onClick={() => void copy(value, "copied")}
      title="click to copy"
      type="button"
    >
      {label ? <span className="g-chip__label">{label}</span> : null}
      <span className="g-chip__value">{truncate(value)}</span>
      <span aria-hidden="true" className="g-chip__icon">⧉</span>
    </button>
  );
}

/* ---------- The two site CTAs, each with its own identity ---------- */

export function BuyButton({ children = "Buy on Pump.fun", compact = false }: { children?: ReactNode; compact?: boolean }) {
  const ref = useMagnetic(0.22);
  const href = goldData.links.pump || "#buy";
  return (
    <a className={`g-buy${compact ? " g-buy--compact" : ""}`} href={href} ref={ref}>
      <span className="g-buy__shine" aria-hidden="true" />
      <span className="g-buy__text">{children}</span>
      <span className="g-buy__arrow" aria-hidden="true">↗</span>
    </a>
  );
}

export function PaperLink({ children = "Read the whitepaper" }: { children?: ReactNode }) {
  const href = goldData.links.whitepaper || "#paper";
  return (
    <a className="g-paper" href={href}>
      <span className="g-paper__prefix">$</span>
      <span className="g-paper__text">{children}</span>
      <span className="g-paper__line" aria-hidden="true" />
    </a>
  );
}

/* ---------- Sticky nav ---------- */

const NAV = [
  ["#pays", "how it pays"],
  ["#ticket", "golden ticket"],
  ["#proof", "proof"],
  ["#buy", "buy"],
] as const;

export function SiteNav() {
  const [solid, setSolid] = useState(false);
  useEffect(() => {
    const on = () => setSolid(window.scrollY > 24);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  return (
    <header className="g-nav" data-solid={solid ? "true" : "false"}>
      <a className="g-nav__logo" href="#top">
        <img alt="" className="g-nav__mark" height={26} src="/assets/brand/mark.png" width={26} />
        <span>$GOLD</span>
      </a>
      <nav aria-label="Sections" className="g-nav__links">
        {NAV.map(([href, text]) => (
          <a href={href} key={href}>
            {text}
          </a>
        ))}
      </nav>
      <div className="g-nav__right">
        <CopyChip label="CA" value={goldData.contract} />
        <BuyButton compact>Buy on Pump.fun</BuyButton>
      </div>
    </header>
  );
}

/* ---------- Ticker tape ---------- */

export function TickerTape() {
  const g = useGold();
  const total = useRolling(g.totalPaidXau, 3, 1200);
  const items = [
    `Gold paid to holders: ${total} ${XAU} \u25B2`,
    `Holders: ${fmtInt(g.holders)}`,
    `Next Golden Ticket in ${g.drawing ? "DRAWING" : fmtClock(g.secondsToDraw)}`,
    `Pot: ${fmtXau(g.potXau)} ${XAU}`,
    `Paired with: ${goldData.pairToken.name} (mint ${truncate(goldData.pairToken.mint)})`,
    `Fee mode: Holder Rewards \u00B7 ${goldData.feePct.toFixed(2)}% \u00B7 locked`,
  ];
  const row = [...items, ...items];
  return (
    <div aria-label="Live ticker" className="g-ticker">
      <div className="g-ticker__live">
        <span className="g-dot" /> LIVE
      </div>
      <div className="g-ticker__track">
        <div className="g-ticker__row">
          {row.map((t, i) => (
            <span className="g-ticker__item" key={`${t}-${i}`}>
              {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------- Mobile: hero CTA becomes a sticky bottom bar ---------- */

export function MobileBuyBar() {
  return (
    <div className="g-mobilebar">
      <CopyChip label="CA" value={goldData.contract} />
      <BuyButton compact>Buy on Pump.fun</BuyButton>
    </div>
  );
}

/* ---------- Toast host ---------- */

export function ToastHost() {
  const [msg, setMsg] = useState<string | null>(null);
  useEffect(() => {
    let t = 0;
    const on = (e: Event) => {
      setMsg(String((e as CustomEvent<string>).detail));
      window.clearTimeout(t);
      t = window.setTimeout(() => setMsg(null), 1600);
    };
    window.addEventListener("gold:toast", on);
    return () => {
      window.removeEventListener("gold:toast", on);
      window.clearTimeout(t);
    };
  }, []);
  return (
    <div aria-live="polite" className="g-toast" data-show={msg ? "true" : "false"}>
      {msg ?? ""}
    </div>
  );
}
