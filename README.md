# Folio

Object-led website concept for a US retail macro-risk companion. One persistent, procedural canvas sphere travels through four narrative chapters. The portfolio workspace supports six ETF/cash examples, allocation editing, three explicit stress scenarios, and SPY-to-cash comparisons.

## Run and verify

Node.js 20+; no dependencies required.

- `npm run dev`: serves the site at the printed URL; tries subsequent ports if 4173 is occupied.
- `npm test`: portfolio arithmetic, validation and comparison tests.
- `npm run check`: JavaScript syntax checks.

## Product status

This is a functional **illustrative website prototype**, not a live forecasting platform. Scenarios contain hand-authored assumed one-week returns and no event probabilities. Jev, FRED, news, prices, authentication and brokerage connections are not integrated. No portfolio data is persisted or transmitted. The Google Fonts stylesheet is an optional external request; a local font fallback is supplied.

The comparison transfers percentage points from SPY to cash. Taxes, fees and slippage are excluded. Financial limitations appear beside the calculator. Invalid inputs suppress results instead of displaying stale estimates.

## Design

The visual context is in `.impeccable.md`. Motion respects reduced-motion preferences; mobile positioning keeps the companion below copy. The sphere is drawn procedurally and requires no image or 3D library downloads. Browser animation pauses in hidden tabs. Semantic navigation, form labels, focus indicators and status feedback are included.

## Next integration boundary

Keep Jev keys server-side. Separate routing-confidence estimates from calibrated event probabilities. Replace stress assumptions with validated conditional return distributions before presenting quantitative forecasts. Event evidence needs original passages, first-seen times, deduplication and point-in-time data. Unsupported holdings must remain explicitly unsupported.
