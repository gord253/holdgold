import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";

import { copyBank, goldData, XAU } from "./data";
import { useGold, useReveal, useRolling } from "./state";

type Vars = CSSProperties & Record<`--${string}`, string | number>;

/* ---------- Terminal window (draggable on desktop) ---------- */

export function TerminalWindow({ title, live, children, className = "" }: { title: string; live?: boolean; children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const g = useGold();
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const bar = el.querySelector<HTMLElement>(".g-term__bar");
    if (!bar) return;
    let sx = 0;
    let sy = 0;
    let ox = 0;
    let oy = 0;
    let dragging = false;
    const onDown = (e: PointerEvent) => {
      if ((e.target as HTMLElement).closest("a,button")) return;
      dragging = true;
      sx = e.clientX;
      sy = e.clientY;
      bar.setPointerCapture(e.pointerId);
      el.dataset.dragging = "true";
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging) return;
      el.style.transform = `translate(${ox + e.clientX - sx}px, ${oy + e.clientY - sy}px)`;
    };
    const onUp = (e: PointerEvent) => {
      if (!dragging) return;
      dragging = false;
      ox += e.clientX - sx;
      oy += e.clientY - sy;
      delete el.dataset.dragging;
    };
    bar.addEventListener("pointerdown", onDown);
    bar.addEventListener("pointermove", onMove);
    bar.addEventListener("pointerup", onUp);
    bar.addEventListener("pointercancel", onUp);
    return () => {
      bar.removeEventListener("pointerdown", onDown);
      bar.removeEventListener("pointermove", onMove);
      bar.removeEventListener("pointerup", onUp);
      bar.removeEventListener("pointercancel", onUp);
    };
  }, []);
  return (
    <div className={`g-term ${className}`} ref={ref}>
      <div className="g-term__bar">
        <span className="g-term__dots" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <span className="g-term__title">
          {title}
          {g.demo ? <em className="g-term__demo">demo feed</em> : null}
        </span>
        {live ? (
          <span className="g-term__live">
            <span className="g-dot" /> LIVE
          </span>
        ) : null}
      </div>
      <div className="g-term__body">{children}</div>
    </div>
  );
}

/* ---------- Journey chapter 2: the proof-of-payout counter ---------- */

export function RainCounter() {
  const g = useGold();
  const total = useRolling(g.totalPaidXau, 4, 1100);
  const holders = useRolling(g.holders, 0);
  const payouts = useRolling(g.payoutsToday, 0);
  const avg = useRolling(g.avgPayout24h, 4);
  const tiles: [string, string, string][] = [
    ["Holders being paid", holders, "Wallets holding over $20 of $GOLD at the last distribution."],
    ["Payouts today", payouts, "Distribution events since 00:00 UTC. Several per hour."],
    [`Avg payout per holder (24h)`, `${avg} ${XAU}`, "Total gold paid in 24h divided by paid wallets."],
  ];
  return (
    <div className="g-rain">
      <p className="g-rain__num" aria-live="off">
        <img alt="" className="g-rain__coin" height={64} src="/assets/brand/coin.png" width={64} />
        <span className="g-rain__value">{total}</span>
        <span className="g-rain__unit">{XAU}</span>
      </p>
      <p className="g-rain__sub">since launch · updates every block</p>
      <ul className="g-tiles">
        {tiles.map(([k, v, how]) => (
          <li className="g-tile" key={k} tabIndex={0}>
            <span className="g-tile__face g-tile__front">
              <span className="g-tile__k">{k}</span>
              <span className="g-tile__v">{v}</span>
            </span>
            <span className="g-tile__face g-tile__back">
              <span className="g-tile__k">how it is calculated</span>
              <span className="g-tile__how">{how}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ---------- How it pays ---------- */

const STEPS = [
  {
    n: "01",
    t: "You buy $GOLD",
    d: "on Pump.fun, quoted in gold not SOL.",
    icon: (
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <rect x="8" y="16" width="32" height="18" rx="2" />
        <path d="M14 22h8M14 28h5" />
        <circle cx="33" cy="25" r="3.5" />
      </svg>
    ),
  },
  {
    n: "02",
    t: "Trades pay fees in gold",
    d: `flat ${goldData.feePct.toFixed(0)}% on every buy and sell, collected in the gold quote asset.`,
    icon: (
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <path d="M10 30l10-10 8 8 10-12" />
        <path d="M32 16h6v6" />
        <circle cx="10" cy="30" r="2" />
      </svg>
    ),
  },
  {
    n: "03",
    t: "You get paid for holding",
    d: "Holder Rewards streams it pro-rata to every wallet over $20, several times an hour. No claiming.",
    icon: (
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <path d="M12 14h24a4 4 0 0 1 4 4v14a4 4 0 0 1-4 4H12a4 4 0 0 1-4-4V18a4 4 0 0 1 4-4z" />
        <path d="M30 24h10M8 20h32" />
        <circle cx="31" cy="27" r="1.5" />
      </svg>
    ),
  },
];

export function HowItPays() {
  const root = useReveal<HTMLElement>();
  return (
    <section className="g-section g-pays" id="pays" ref={root}>
      <img alt="" className="g-pays__bar" height={600} src="/assets/brand/bar-rain.png" width={600} />
      <div className="g-wrap">
        <p className="g-eyebrow" data-reveal>how it pays</p>
        <h2 className="g-h2" data-reveal>
          {copyBank.noDev}
        </h2>
        <ol className="g-steps">
          <svg aria-hidden="true" className="g-steps__line" preserveAspectRatio="none" viewBox="0 0 1000 2">
            <path d="M0 1H1000" />
          </svg>
          {STEPS.map((s, i) => (
            <li className="g-step" data-reveal key={s.n} style={{ "--i": i } as Vars}>
              <span className="g-step__icon">{s.icon}</span>
              <span className="g-step__n">{s.n}</span>
              <h3 className="g-step__t">{s.t}</h3>
              <p className="g-step__d">{s.d}</p>
            </li>
          ))}
        </ol>
        <p className="g-foot" data-reveal>
          Powered by Pump.fun Custom Pairs + Holder Rewards. We didn&apos;t build the rails. We just picked gold.
        </p>
      </div>
    </section>
  );
}
