/**
 * $GOLD front end data layer.
 *
 * Everything on the page reads from `goldData`. Swap these values for live
 * chain reads later and nothing else changes.
 *
 * `demo: true` makes the page simulate activity (ticking counters, a forwarder
 * log, hourly draws) so the site feels alive before launch. Set it to `false`
 * to render the exact values below with no simulation.
 */

export type Winner = { time: string; wallet: string; amount: number; tx: string };
export type LogEntry = { id: number; amount: number; ago: string; tx: string };

export const goldData = {
  demo: true,
  contract: "TBD_PUMP_MINT",
  pairToken: { name: "Tokenized Gold", ticker: "XAU", mint: "TBD", issuer: "TBD" },
  feePct: 1.0,
  totalPaidXau: 0.0,
  holders: 0,
  payoutsToday: 0,
  avgPayout24h: 0.0,
  ticket: { potXau: 0.0, nextDrawIso: "2026-09-13T00:00:00Z", intervalMin: 60 },
  winners: [] as Winner[],
  devWallet: { address: "TBD", forwardedPct: 100, sold: 0, log: [] as LogEntry[] },
  links: { pump: "", dexscreener: "", x: "", telegram: "", whitepaper: "" },
};

/** Starting values used only while `demo` is on. */
export const demoSeed = {
  totalPaidXau: 12.4218,
  holders: 1284,
  payoutsToday: 61,
  avgPayout24h: 0.0083,
  potXau: 0.412,
  drawInSeconds: 150,
};

export const XAU = goldData.pairToken.ticker;

export function fmtXau(n: number): string {
  return n.toFixed(4);
}

export function fmtInt(n: number): string {
  return Math.round(n).toLocaleString("en-US");
}

export function truncate(addr: string): string {
  if (!addr) return "TBD";
  if (addr.length <= 12) return addr;
  return `${addr.slice(0, 4)}\u2026${addr.slice(-4)}`;
}

export function fmtClock(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
}

const B58 = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

export function randAddr(len = 44): string {
  let out = "";
  for (let i = 0; i < len; i += 1) out += B58[Math.floor(Math.random() * B58.length)];
  return out;
}

export function explorerTx(tx: string): string {
  return `https://solscan.io/tx/${tx}`;
}

export function explorerAccount(addr: string): string {
  return `https://solscan.io/account/${addr}`;
}

export const copyBank = {
  hero: "Hold $GOLD. Get paid gold.",
  cope: "Zero cope. 100% gold.",
  noDev: "No claiming. No dev. Just gold, every few minutes.",
  feature: "Before it was a feature, it was a bar.",
  whales: "Whales get pro-rata. You get the ticket.",
  onchain: "If it's not on chain, it's not on this page.",
  boomer: "Boomer asset. Degen delivery.",
};
