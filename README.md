# $GOLD site

Self-hosted build (Cloudflare Workers).

## Edit the numbers, links and contract
Everything the page shows lives in `src/gold/data.ts`.
Set `demo: false` and fill in `contract`, `pairToken`, `devWallet` and `links`.

## Run locally
    bun install
    bun run dev

## Deploy
Connected through Cloudflare Workers Builds (git push deploys), or by hand:
    bun run build
    bunx wrangler deploy
