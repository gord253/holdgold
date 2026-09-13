import { useEffect, useRef, useState, type CSSProperties } from "react";

import { BuyButton, CopyChip, PaperLink } from "./chrome";
import { XAU, copyBank, explorerAccount, explorerTx, fmtClock, fmtXau, goldData, truncate } from "./data";
import { TerminalWindow } from "./journey";
import { useGold, useReducedMotion, useReveal, useRolling, useTilt } from "./state";

type Vars = CSSProperties & Record<`--${string}`, string | number>;

/* ---------- Golden Ticket ---------- */

function Confetti({ trigger }: { trigger: number }) {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const reduced = useReducedMotion();
  useEffect(() => {
    if (trigger === 0 || reduced) return;
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const w = (canvas.width = canvas.offsetWidth);
    const h = (canvas.height = canvas.offsetHeight);
    type Bar = { x: number; y: number; vx: number; vy: number; r: number; vr: number; s: number };
    const bars: Bar[] = Array.from({ length: 90 }, () => ({
      x: w / 2 + (Math.random() - 0.5) * 80,
      y: h * 0.45,
      vx: (Math.random() - 0.5) * 14,
      vy: -6 - Math.random() * 11,
      r: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.3,
      s: 6 + Math.random() * 9,
    }));
    let frame = 0;
    const start = performance.now();
    const draw = (now: number) => {
      ctx.clearRect(0, 0, w, h);
      for (const b of bars) {
        b.vy += 0.32;
        b.x += b.vx;
        b.y += b.vy;
        b.r += b.vr;
        ctx.save();
        ctx.translate(b.x, b.y);
        ctx.rotate(b.r);
        ctx.fillStyle = Math.random() > 0.5 ? "#F5C542" : "#B8860B";
        ctx.fillRect(-b.s, -b.s * 0.45, b.s * 2, b.s * 0.9);
        ctx.restore();
      }
      if (now - start < 2800) frame = requestAnimationFrame(draw);
      else ctx.clearRect(0, 0, w, h);
    };
    frame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frame);
  }, [trigger, reduced]);
  return <canvas aria-hidden="true" className="g-confetti" ref={ref} />;
}

function timeAgo(iso: string, now: number): string {
  if (!now) return "";
  const s = Math.max(0, (now - Date.parse(iso)) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  return `${Math.floor(s / 3600)}h ago`;
}

export function GoldenTicket() {
  const g = useGold();
  const root = useReveal<HTMLElement>();
  const tilt = useTilt(9);
  const pot = useRolling(g.potXau, 4);
  const [now, setNow] = useState(0);
  useEffect(() => {
    setNow(Date.now());
    const t = window.setInterval(() => setNow(Date.now()), 20_000);
    return () => window.clearInterval(t);
  }, []);
  const last = g.winners[0];
  const urgent = !g.drawing && g.secondsToDraw > 0 && g.secondsToDraw < 60;
  return (
    <section className="g-section g-ticket" id="ticket" ref={root}>
      <Confetti trigger={g.drawCount} />
      <div className="g-wrap g-ticket__grid">
        <div className="g-ticket__stage">
          <div className="g-ticket__card" ref={tilt}>
            <img alt="The Golden Ticket" className="g-ticket__img" height={800} src="/assets/brand/ticket.png" width={1200} />
            <span className="g-ticket__shine" aria-hidden="true" />
          </div>
          <img alt="" className="g-ticket__bar" height={600} src="/assets/brand/bar-ticket.png" width={600} />
        </div>
        <div className="g-ticket__copy">
          <p className="g-eyebrow" data-reveal>golden ticket</p>
          <h2 className="g-h2" data-reveal>
            Every hour, one holder wins the pot.
          </h2>
          <div className="g-ticket__live" data-reveal>
            <div className="g-live">
              <span className="g-live__k">Pot size</span>
              <span className="g-live__v">
                {pot} <small>{XAU}</small>
              </span>
            </div>
            <div className="g-live" data-urgent={urgent ? "true" : "false"} data-drawing={g.drawing ? "true" : "false"}>
              <span className="g-live__k">Next draw</span>
              <span className="g-live__v g-live__clock">{g.drawing ? "Drawing\u2026" : fmtClock(g.secondsToDraw)}</span>
            </div>
            <div className="g-live">
              <span className="g-live__k">Last winner</span>
              <span className="g-live__v g-live__addr">
                {last ? (
                  <>
                    <a href={explorerTx(last.tx)} rel="noreferrer" target="_blank">
                      {truncate(last.wallet)}
                    </a>{" "}
                    <small>{fmtXau(last.amount)} {XAU}</small>
                  </>
                ) : (
                  "awaiting first draw"
                )}
              </span>
            </div>
          </div>
          <p className="g-body" data-reveal>
            The dev wallet earns holder rewards like everyone else and forwards 100% of it here. One wallet, one entry.
            Not weighted by size. {copyBank.whales}
          </p>
        </div>
      </div>
      <div className="g-wrap">
        <TerminalWindow className="g-winners" title="winners.csv">
          <table className="g-table">
            <thead>
              <tr>
                <th>time</th>
                <th>wallet</th>
                <th>amount</th>
                <th>tx</th>
              </tr>
            </thead>
            <tbody>
              {g.winners.length === 0 ? (
                <tr>
                  <td colSpan={4}>no draws yet · first draw after launch</td>
                </tr>
              ) : (
                g.winners.slice(0, 10).map((w, i) => (
                  <tr className="g-table__row" data-new={i === 0 ? "true" : "false"} key={w.tx}>
                    <td>{timeAgo(w.time, now)}</td>
                    <td>
                      <a href={explorerAccount(w.wallet)} rel="noreferrer" target="_blank">
                        {truncate(w.wallet)}
                      </a>
                    </td>
                    <td>
                      {fmtXau(w.amount)} {XAU}
                    </td>
                    <td>
                      <a href={explorerTx(w.tx)} rel="noreferrer" target="_blank">
                        {truncate(w.tx)}
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          <a className="g-verify" href="#vrf">
            Verify randomness → VRF proof
          </a>
        </TerminalWindow>
      </div>
    </section>
  );
}

/* ---------- Proof ---------- */

export function ProofPanel() {
  const g = useGold();
  const root = useReveal<HTMLElement>();
  const dev = goldData.devWallet;
  return (
    <section className="g-section g-proof" id="proof" ref={root}>
      <div className="g-wrap">
        <p className="g-eyebrow" data-reveal>proof</p>
        <h2 className="g-h2" data-reveal>
          {copyBank.onchain}
        </h2>
        <div className="g-proof__grid">
          <TerminalWindow live title="proof.log">
            <dl className="g-kv">
              <dt>dev wallet</dt>
              <dd>
                <CopyChip value={dev.address} />{" "}
                <a className="g-kv__link" href={dev.address === "TBD" ? "#proof" : explorerAccount(dev.address)} rel="noreferrer" target="_blank">
                  explorer
                </a>
              </dd>
              <dt>rewards forwarded to golden ticket</dt>
              <dd>{dev.forwardedPct}%</dd>
              <dt>sold</dt>
              <dd className="g-kv__sell">{dev.sold}</dd>
              <dt>pair</dt>
              <dd>
                {goldData.pairToken.name} · issuer {goldData.pairToken.issuer}
              </dd>
              <dt>quote mint</dt>
              <dd>
                <CopyChip value={goldData.pairToken.mint} />
              </dd>
              <dt>fee mode</dt>
              <dd>
                Holder Rewards · {goldData.feePct.toFixed(2)}% · locked
              </dd>
            </dl>
          </TerminalWindow>
          <TerminalWindow live title="forwarder.log">
            <ul className="g-log">
              {g.log.length === 0 ? (
                <li className="g-log__row">no forwards yet · waiting for launch</li>
              ) : (
                g.log.map((e) => (
                  <li className="g-log__row" key={e.id}>
                    <span className="g-log__amt">+{fmtXau(e.amount)} {XAU}</span>
                    <span className="g-log__arrow">→ Golden Ticket</span>
                    <span className="g-log__ago">{e.ago}</span>
                    <a className="g-log__tx" href={explorerTx(e.tx)} rel="noreferrer" target="_blank">
                      {truncate(e.tx)}
                    </a>
                  </li>
                ))
              )}
            </ul>
          </TerminalWindow>
        </div>
      </div>
    </section>
  );
}

/* ---------- Tokenomics ---------- */

const TOKENOMICS = [
  ["1B", "supply", "Fixed. Mint and freeze authority revoked."],
  ["0", "team allocation", "Dev buys on the curve in public, like you."],
  ["LP", "burned", "On graduation. Pump.fun standard."],
  ["100%", "fee → holders", "Not devs. Not a treasury. You."],
] as const;

export function Tokenomics() {
  const root = useReveal<HTMLElement>();
  return (
    <section className="g-section g-tok" id="tokenomics" ref={root}>
      <div className="g-wrap">
        <p className="g-eyebrow" data-reveal>tokenomics</p>
        <ul className="g-tok__grid">
          {TOKENOMICS.map(([big, k, d], i) => (
            <li className="g-tok__card" data-reveal key={k} style={{ "--i": i } as Vars}>
              <span className="g-tok__big">{big}</span>
              <span className="g-tok__k">{k}</span>
              <span className="g-tok__d">{d}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ---------- Buy ---------- */

const LINKS = [
  ["DexScreener", goldData.links.dexscreener],
  ["X community", goldData.links.x],
  ["Telegram", goldData.links.telegram],
] as const;

export function BuySection() {
  const root = useReveal<HTMLElement>();
  return (
    <section className="g-section g-buysec" id="buy" ref={root}>
      <img alt="" className="g-buysec__bar" height={600} src="/assets/brand/bar-hero.png" width={600} />
      <div className="g-wrap g-buysec__inner">
        <p className="g-eyebrow" data-reveal>buy</p>
        <h2 className="g-h2 g-h2--xl" data-reveal>
          {copyBank.cope}
        </h2>
        <div className="g-buysec__ca" data-reveal>
          <CopyChip label="contract" size="lg" value={goldData.contract} />
        </div>
        <div className="g-buysec__ctas" data-reveal>
          <BuyButton />
          <PaperLink />
        </div>
        <ul className="g-buysec__links" data-reveal>
          {LINKS.map(([t, href]) => (
            <li key={t}>
              <a href={href || "#buy"}>{t}</a>
            </li>
          ))}
        </ul>
        <details className="g-howto" data-reveal>
          <summary>How to buy in 3 taps</summary>
          <ol>
            <li>Open Pump.fun, search the contract address above (paste it, never type it).</li>
            <li>Hold gold as your quote asset in your wallet. The pair is gold, not SOL.</li>
            <li>Buy. Keep over $20 of $GOLD and the gold lands on its own. No claiming.</li>
          </ol>
        </details>
      </div>
    </section>
  );
}

/* ---------- Footer ---------- */

export function SiteFooter() {
  return (
    <footer className="g-footer">
      <div className="g-wrap">
        <p className="g-footer__disc">
          No association with Pump.fun, xStocks, Sunrise, Backpack, or any gold issuer. Memecoin. Not investment
          advice. Payouts depend on volume and may be zero. Tokenized gold is not bullion.
        </p>
        <div className="g-footer__row">
          <a href={goldData.links.whitepaper || "#paper"}>whitepaper</a>
          <a href="#proof">explorer</a>
          <span>© $GOLD 2026</span>
          <span className="g-footer__tag">{copyBank.feature}</span>
        </div>
      </div>
    </footer>
  );
}
