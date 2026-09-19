# Folio — live hackathon MVP

A scroll-driven portfolio companion for US retail investors. One procedural sphere follows the narrative; the working surface connects public macro evidence to experimental Jev event estimates and portfolio scenario calculations.

## Run

Node.js 22.13+ is required. Run `npm ci`, copy `.env.example` to `.env.local`, set `TYPESAFE_API_KEY`, then `npm run dev`. The server prints its URL and tries subsequent ports if 4173 is occupied. Secrets are never served to the browser. The optional `FRED_API_KEY` uses FRED's API; otherwise separate public CSV requests are used.

`npm test` runs 15 tests. `npm run check` checks syntax. `npm run build` emits a Cloudflare-compatible Worker in `dist/server/index.js`, including the frontend assets and Sites metadata.

## Demo

1. Open **Live signals** to retrieve public sources (five-minute cache).
2. Inspect FRED observations, Yahoo ETF prices, the next official FOMC date, and linked evidence.
3. Click **Analyze current signals**. Jev routes source items and estimates cut/hold/hike probabilities; insufficient evidence withholds estimates.
4. Inspect the source passages and routing labels. Relevance probabilities are distinguished from event probabilities.
5. Edit the portfolio below. The event-weighted illustration updates locally; portfolio dollar amounts and weights are not sent to Jev.
6. Compare a SPY-to-cash allocation change across the standalone stress scenarios.

## API

- `GET /api/status`: connection presence only; never returns secrets.
- `GET /api/briefing`: source availability, original timestamps, macro observations, recent quotes, evidence, official event calendar.
- `POST /api/analyze`: Jev's experimental distribution and evidence routing. Same-origin browser requests only; upstream calls cached/coalesced for five minutes. Includes deadlines and meaningful upstream failures.

## Sources and model

Federal Reserve monetary-policy RSS and speeches; EIA Today in Energy; FRED DFF, DGS10, T10YIE, CPIAUCSL; Yahoo chart data for SPY, TLT, GLD, SLV and USO. FOMC dates are parsed from the official calendar. Source outages remain explicit. The hosting network could not retrieve FRED CSVs during production verification; a timestamped snapshot of four locally retrieved FRED observations is used for at most 72 hours and labeled in the interface. A configured FRED API key uses the official API instead. Jev uses the documented `/v1/systemone` API and `jev-latest`; local verification resolved to `jev-1.13.0`.

## Boundaries

This MVP is not a calibrated trading system. Jev event probabilities have not been backtested on Fed outcomes and do not incorporate a futures-market baseline. Conditional ETF returns are explicitly **hand-authored illustrations**, not fitted causal effects or confidence intervals. The weighted dollar estimate combines those assumptions with model probabilities; it is not a statistically validated portfolio-return forecast. Quotes may be delayed. Source timestamps and retrieval times are distinct. Broad social-media chatter, arbitrary stocks, portfolio persistence, automatic alerts and brokerage execution are not implemented. Yahoo's public endpoints are prototype dependencies, not a guaranteed production market-data service.

Only the supported ETF/cash examples are accepted. Cash has zero assumed one-week return. Taxes, fees, slippage and dividends are excluded. All source excerpts are escaped for rendering. Model instructions treat fetched source content as untrusted evidence. No URLs supplied by users are fetched by the backend.

## Deployment

The existing Sites project remains private. `.openai/hosting.json` holds only project metadata. Secrets are configured through Sites runtime environment variables and excluded from Git/build assets. Use the exact pushed source revision for the saved deployment archive.
