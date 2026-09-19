# Verification

- Five Node tests pass: stress arithmetic, contribution totals, cash-shift loss reduction, opportunity cost, all-cash behavior and invalid inputs.
- Browser smoke: default -$2,800; gentle easing +$2,700; moving ten points to cash +$2,400; invalid 95% allocation hides estimates and displays corrective message; reset restores example; growth-shock -$2,400.
- Desktop and narrow mobile previews inspected. Narrow heading sizing adjusted to avoid overlap. No horizontal overflow in inspected narrow viewport. No browser console errors observed.
- Read-only WebMCP calculation registered and returned the same scenario/values as the visible interface. The browser exposes no invalid schema invocation path used in this verification.
- Reduced-motion treatment implemented in CSS/JS; not separately emulated in browser verification.
- This verifies the illustrative calculator and UI only, not financial forecasting accuracy or live integrations.

## Live MVP verification — 2026-09-19

- 14 automated tests pass, covering prior portfolio calculations plus RSS date/link filtering, FRED missing observations, meeting-date parsing, substantive article extraction, probability validation, missing-key withholding and cross-origin rejection.
- Real local upstream smoke: all 13 sources available, four FRED observations, five Yahoo prices, original Fed passages and official next meeting date resolved.
- Real Jev smoke returned HTTP 200, model `jev-1.13.0`, status `ready`, 12 routed evidence items and a normalized cut/hold/hike distribution. This is integration verification, not calibration evidence.
- Initial source extraction captured header-only text; Jev correctly withheld the estimate. Fixed extraction to read article paragraphs beyond nested headers and added a regression test. No confidence threshold was relaxed.
- Production Worker export, route responses and absence of the local key from bundled assets are checked before publishing.

## Hosted-data correction

The first Worker deployment verified Jev secret presence, but FRED CSV downloads failed from the hosting network. The UI now distinguishes nine live source checks from four retained FRED observations, includes their actual retrieval timestamps, and expires retained copies after 72 hours. A 15th regression test covers snapshot provenance, expiration and rejection of future retrieval timestamps. The optional FRED API key enables authenticated refresh without changing the client.

## Vercel preview deployment

- 17 tests pass, including the Node serverless adapter's status response, secret exclusion, method/origin checks and unknown routes.
- The adapter was exercised locally with real credentials: 13/13 sources available and Jev `jev-1.13.0` returned a ready analysis.
- Both secrets configured for Vercel Preview. Vercel reported the preview build READY; the deployed URL was not fetched as part of verification.
- Use `vercel deploy --target=preview --yes` explicitly: the first deployment of a new Vercel project may otherwise select Production. The unintended initial production deployment was removed; the configured Preview was retained.

## Multi-signal extension — September 19, 2026

- Added Fed, CPI, unemployment, and commercial crude inventory event contracts, independent routing/caches and outcome-specific portfolio illustrations.
- 23 automated tests passed: inventory units/SPR exclusion, publication freshness, CPI transformation, per-signal probability schemas, portfolio impact, evidence filtering and unknown-signal rejection, plus existing API/adapter checks.
- Local live briefing returned 18 evidence items and all four baselines. FRED release dates: CPI October 14, employment October 2. EIA next report September 23; Fed decision October 28.
- All four real Jev calls returned HTTP 200 and `insufficient_evidence` (adequacy 0.46 / 0.30 / 0.34 / 0.36). These checks confirm integration and abstention, not forecast quality. No threshold was relaxed and no synthetic probabilities are displayed to users.
- Syntax checks and Vite worker build passed. Portfolio impacts remain uncalibrated hand-authored scenarios.
- Playwright local browser smoke passed: all four signal selectors, real insufficient-evidence display, and all four fixture-only portfolio calculations ($2,000 / $1,200 / $375 / $240 for each first outcome on the example portfolio). Fixture interception was removed and the page reloaded afterward. Mobile viewport 390×844 had no horizontal page overflow.

## Visual signal mind map — September 19, 2026

- 26 automated tests passed, including new exposure routing checks for irrelevant/unknown channels, excluded zero positions, and no article dollar attribution.
- Local Playwright smoke passed: default collapsed analysis; article detail and pending routing; all-article pagination; hypothetical Fed and oil calculations; allocation changes reflected immediately; signal switching; mobile horizontal map scrolling without page overflow; Escape dismissal.
- Real Jev routing produced article channel details; loading feedback appeared immediately. Probabilities remain withheld when evidence is inadequate.
- Inspected a desktop screenshot of the rendered map. Syntax and Vite worker build passed. Production credentials remain server-side and portfolio amounts remain in the browser.

## Interaction audit — September 19, 2026

Fixed hidden upstream errors, stale display during source refresh, missing source-retry UI, unavailable analysis controls, duplicate batch submission, and incorrect focus return after detail dismissal. Added a prominent Route articles action and an article-detail routing action, immediate allocation validation, and preserved source-passage expansion across updates.

Two repeatable Playwright CLI suites are saved in `tests/browser-interactions.js` and `tests/browser-races.js`. Both passed locally. Coverage includes each node type, all 24 holding/signal combinations, four outcome totals, pagination boundaries, reset, portfolio edits, invalid allocation, mocked upstream/source errors and recovery, keyboard focus/Escape, mobile scroll retention and no page overflow, duplicate-click guards, switching signals mid-request, stale response rejection after refresh, and exactly one analysis per signal in Analyze all. Fixtures were removed and the browser reloaded afterward. Expected HTTP 502 console entries came from failure fixtures; there were zero uncaught page errors.

Run with a local server and an open Playwright CLI session:
`npx --yes --package=@playwright/cli playwright-cli -s=folio-audit run-code "$(cat tests/browser-interactions.js)"`
Then run the same command with `tests/browser-races.js`.

## Expanded chatter and historical probability baselines — September 19, 2026

Local live briefing retrieved 83 items: 47 Hacker News, 6 CNBC, 6 BBC, 6 Guardian, and 18 existing Fed/EIA items. All five ETF histories supplied 250 five-session windows. Reddit anonymous access returned 403; its OAuth connector and the X recent-search connector are credential-gated, not live-verified. Four real Jev analysis calls returned 200 with insufficient-evidence responses; no threshold was relaxed.

37 automated tests cover source parsing/freshness, credential gates, multi-topic classification, source quotas, same-thread deduplication, historical frequency normalization, sample intervals, sparse/stale data abstention, and no current-day/future price leakage, plus earlier tests. Browser chatter suite verified all five asset detail panels, uncertainty/method labels, external-card keyboard focus, Hacker News filtering, community warnings, filter reset, and mobile layout. Fixtures were not used for the live source/baseline checks.

Final ingestion check after strict HN relevance filtering: 62 items, including 26 HN stories/comments. The earlier 83-item collection included fuzzy matches and was replaced. Browser testing found and fixed a global input listener that reset the source selector before its change event; portfolio updates now listen only to portfolio inputs.
The existing interaction and asynchronous-request race suites also passed after this extension; failure fixtures were removed. Existing holding-isolation assertions now target the direct allocation table because asset details additionally contain a separate three-row probability-method table.

## Reddit/X scraper investigation — September 19, 2026

Direct attempts: r/Economics public RSS returned HTTP 200 with 25 Atom entries; r/investing returned 429. Public X search returned an HTML shell with zero tweet-text markers and zero status links. No X records were claimed as scraped. No Apify/Bright Data/X/Reddit credentials were configured.

Implemented Reddit Atom fallback for three public subreddits, preserving source timestamps and HTTPS Reddit links. Added a credential-gated Apify X dataset reader and a one-shot scraper runner using verified current actor inputs; dry-run payload passed. Actual Apify execution remains unverified pending APIFY_TOKEN. Unit suite: 39 tests passed, including feed normalization and no-credential fallback selection.
Final integrated check: 25 Reddit records were retrieved from r/investing; r/Economics and r/stocks were unavailable on that run, demonstrating intermittent upstream availability. Browser smoke verified actual Reddit filtering, post details, community labels, and removal of the misleading credentials warning when RSS works. Final suite: 40 tests, including a mocked Apify dataset normalization/header-auth test; syntax and worker build passed. The mock test does not establish live Apify access.

## Persistent ingestion and Apify credit control — 2026-09-19

- Connected isolated `folio_` tables and authenticated `folio-ingestion` function in existing MacroGuru project; no new subscription. Verified RLS on all four tables, no anon SELECT, no authenticated INSERT, and no anon execution of the reservation function.
- Transactional SQL assertions exercised duplicate window, unresolved attempt, 24-hour cooldown and $0.50/month ceiling. Assertions passed and the test transaction rolled back.
- API actor run `RxO3ZVDW9LE3hatdR` returned ten demo placeholders under Free-plan restrictions; stored zero posts, recorded failed, reported charge $0.004. Added preflight that stops API collection on Free accounts without launching another run.
- One supervised Console recovery, separately reserved before Start: `FEJHRUy1IM9od9i6E`; input ten items, maxTotalChargeUsd 0.10, timeout 120 seconds, memory 256 MB. API readback verified those limits. Ten real public posts imported, reported charge $0.020.
- Repeated import of the same dataset: ten accepted, zero new rows, total X rows ten, zero new Actor runs. Reserved budget remains $0.20 (failed attempts keep their reservation), actual reported total $0.024.
- Live local briefing: 97 total news items, including ten X and 25 Reddit. Fresh Node process read the same saved briefing with `storage.reused=true`, proving persistence beyond the in-memory cache.
- Browser smoke: X-only filtering, article detail and unverified label, Reset view, Rate cut, SPY exposure +$800, portfolio breakdown summing +$2,000, and immediate disabled Routing feedback. Upstream evidence adequacy remains separate from historical asset frequencies.
- Node regression suite: 45/45 passed; syntax checks passed; optional Sites/Vite Worker build passed. New tests cover canonical URL cleanup, duplicate rows, missing-store failure and database-first X retrieval.
- No paid schedule, account upgrade, proxy bypass or automatic retry was created. The Console-only restriction is a provider limitation; saved data remains usable without further scrapes. Public refresh endpoints cannot launch an Actor.

- Final safeguards: unauthenticated store call returned HTTP 401; `prepare:x` rejected the previously reserved collection window. Reddit RSS/OAuth ID variants are tested to map to one record. Live Jev routing completed and marked the low-information X replies as low relevance.
- Vercel preview: https://folio-macro-companion-22c7dn62g.vercel.app (initial database-backed deployment, Ready); final follow-up deployment is recorded in the task response. Deployed URL was not fetched by the deployment smoke check; functional checks used the local server with the real cloud database.

## People watchlist — 2026-09-19

- Verified the current seven-member Fed roster, Treasury secretary, US president and OPEC secretary general against linked primary pages. Fed chair is Kevin Warsh; Powell is listed as a governor. Profiles carry verification and review dates.
- Three live people-search RSS sources returned available. The first combined briefing contained 114 items and 16 matched items, including six original Fed speeches. Search results and mere mentions are not attributed as personal opinions. Some profiles have no recent captured items, explicitly displayed.
- Existing X dataset was re-imported with author metadata: ten accepted, zero new unique posts, zero new scraper runs. Updated single-query collection input includes the watchlist and documented accounts. `prepare:x` still denied the already reserved window. No budget increase or recurring paid collection was introduced.
- Browser smoke: Waller profile showed original speech attribution and SPY/TLT/GLD/SLV path; Trace this story opened the correct Waller article in the map. Jefferson showed explicit missing coverage. Oil selection exposed Bessent, Trump and Al Ghais. Close and Escape returned focus to the person card; final Bowman Escape check passed.
- Live Jev analysis with role and attribution context returned 13 routes, model jev-1.13.0, and insufficient_evidence for the event distribution; no probability was fabricated.
- 50/50 Node tests passed, syntax checks passed and optional Worker build passed. Added tests for role provenance, full-name versus surname matching, official speech hostname, personal versus institutional account attribution, retweets, and portfolio exposure.

## Public deployment correction — 2026-09-19

- Found Vercel `ssoProtection.deploymentType=all_except_custom_domains`, which required login on shared preview URLs. Set SSO protection to null for the public demo; verified password protection is also absent.
- Attached verified stable domain `folio-macro-companion.vercel.app` to the latest Ready Preview deployment `dpl_ENLqsY4CNDfHNNyjnfd5koTRhx4h`. Preview runtime secrets remain in use; no production environment was substituted.
- Added prioritized relevant statement cards and one-click story routing. Browser smoke confirmed immediate Routing feedback and the correct Waller story opening in the map.
- Fixed targeted routing: article query parameter explicitly includes the selected story in model evidence; pending selections are queued without duplicate concurrent calls. Live smoke returned Waller's rates route (relevance 0.55), while insufficient event evidence still withheld probabilities.
- 51 Node tests and syntax checks passed; build passed. Public settings and alias were verified through Vercel control-plane responses; no curl/fetch probe of the deployed website was used.

## Unified macro outlook — September 19

- All six factor buckets remain visible alongside all four events, holdings, and the portfolio. Inspecting an event changes the scenario details and highlighted paths, never removes other factors/events.
- Timeline sorts future official release dates; unknown or expired dates remain explicitly unverified. It covers the four supported scheduled contracts, not discovery of arbitrary unscheduled shocks.
- Event cards show separate fixed-assumption portfolio ranges, not confidence intervals. Correlated event impacts are never summed. Model estimates remain experimental and require the existing evidence sufficiency gate.
- Portfolio editor now sits directly above the map. Invalid allocations immediately pause map impacts; reset restores the six-asset example.
- Local browser smoke: 114 collected items, six groups, four events; official and Reddit evidence drill-down, article passage/source, event selection, portfolio breakdown, invalid 99% allocation, reset, and all-event analysis. Rate-cut illustration +$2,000; inventory-draw illustration +$240 for the default $100,000 example.
- Live all-event Jev smoke completed: all four returned insufficient evidence; the UI withheld probabilities and retained illustrative scenarios. No Apify paid collection was started.
- Backend now supplies all economic observations, oil baseline, and all upcoming event contracts as shared context alongside signal-relevant evidence. This is not a joint probabilistic model.

## Reddit restoration and initial forecasts — September 19

- Database read-back: 50 Reddit rows, 50 unique platform IDs. Public r/Economics RSS available; r/investing and r/stocks unavailable in this run. Saved retrieval keeps Reddit visible without new paid scraping.
- Browser smoke: 50 Reddit cards; CPI and jobs probabilities visible on initial load; methodology and retrospective scores in event details; changing portfolio value from $100,000 to $200,000 doubled CPI illustrative impact from approximately -$85 to -$169 before rounding.
- Live model smoke: jobs routes 10 items including two Reddit posts; inflation routes 12 including one Reddit post. Jev adequacy scores .42/.36 retained abstention; statistical probabilities remain labeled as baselines.
- CPI distribution: cooler .431577, same .191926, hotter .376497. Jobs: lower .477, same .24, higher .283. These are experimental estimates from revised FRED history, not validated first-release or chatter-conditioned forecasts.
- 62 tests passed, including gap handling, future-data exclusion, baseline matching, normalized forecasts, abstention preservation, saved Reddit expiry/IDs, and source-diverse routing. Syntax and production build passed.

## Bayesian probability and Pearl explainer

- Added an interactive educational methodology section at `#math`, linked from navigation and the signal map.
- Bayes demo computes posterior odds from a user-controlled prior and likelihood ratio. Inputs are explicitly educational and do not modify actual forecasts. Unit checks cover neutral/contrary evidence, boundaries, and invalid values.
- Pearl diagram distinguishes conditioning from intervention by removing the incoming cause of the rate decision. It explicitly states that Folio does not estimate identified do-operator effects; current impacts remain fixed-return scenario calculations. References link to Pearl's 2009 UCLA paper and Berkeley's Bayesian notes.
- Browser smoke verified prior 40% with LR 2 yields 57.1%, prior 45% yields 62.1%, reset, observe/intervene controls, arrow visibility, and portfolio-linked calculation changing $2,000 to $4,000 when value doubles. 64 unit tests passed; worker build includes the new math module.

## Hyperliquid metal prices

- Verified Yahoo GLD 401.17 and SLV 59.93 were share quotes for SPDR Gold Shares and iShares Silver Trust, respectively, at 2026-09-18 market timestamp. These are not gold/silver ounce prices.
- Verified XYZ contract specifications describe GOLD and SILVER as referencing USD spot price of one troy ounce. The UI identifies them as perpetual contract midpoints, not physical spot execution or ETF share prices.
- New GET /api/metals uses official Hyperliquid info endpoint, validates exact `xyz:GOLD` / `xyz:SILVER` metadata and timestamped l2Book, computes bid/ask midpoint, rejects stale (>60s), future, crossed, missing and nonnumeric books. Read-only; no wallet/API key required. Ten-second server cache, 30-second visible-page polling, explicit failure feedback and manual refresh; independent of briefing cache.
- Live check 2026-09-19 21:43:49 UTC: GOLD bid 4375.7 / ask 4375.8; SILVER bid 66.564 / ask 66.567. Values are transient, not hardcoded. 67 unit tests passed and worker build passed.

### Event-node typography fix — 2026-09-19

Replaced wrapped probability sentences with three aligned outcome rows and a separate model-source label. Event nodes are 136 px tall on a 150 px vertical step; SVG connection anchors follow the new centers and the map canvas is 660 px tall. All outcome labels remain visible, including the longer unemployment labels.

Validation: 67 unit tests passed; production build passed. Headless Chrome smoke checks at 1440 px and 390 px widths rendered all four ready states, verified every descendant stayed at least 8 px inside the top/bottom borders (observed bottom clearance: 17.47 px), and opened/closed each event detail panel. The eight-page deck PDF preserves the verified slide renders to avoid the converter's font substitutions.

### Website-matched pitch — 2026-09-19

`/pitch.html` uses `style.css` design tokens and DM Sans. `pitch-data.js` is the shared eight-slide content source; `pitch.css` contains slide layout only. `orb.js` is now the same canvas renderer used by the homepage and presentation, preserving homepage device-pixel scaling. A single persistent deck canvas changes position and scale between slides. Controls support previous/next, arrow keys, Page Up/Down, Home/End, space, touch swipes, fullscreen, URL slide hashes and reduced motion. PDF download is served from `/Folio-Website-Pitch.pdf`.

Chrome smoke: all eight slide contents fit above their footnotes; next/previous and Home/End work; 390 px viewport has no horizontal overflow; reduced-motion navigation and the original homepage orb load without page errors. All 67 unit tests, syntax checks and the build passed. PDF/PPTX are visual snapshots of the HTML slides so CSS and orb appearance stay identical; content edits belong in the HTML content source.
