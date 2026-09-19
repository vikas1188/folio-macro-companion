# Folio — live hackathon MVP

A scroll-driven portfolio companion for US retail investors. One procedural sphere follows the narrative; the working surface connects public macro evidence to experimental Jev event estimates and portfolio scenario calculations.

## Run

Node.js 22.13+ is required. Run `npm ci`, copy `.env.example` to `.env.local`, set `TYPESAFE_API_KEY`, then `npm run dev`. The server prints its URL and tries subsequent ports if 4173 is occupied. Secrets are never served to the browser. The optional `FRED_API_KEY` uses FRED's API; otherwise separate public CSV requests are used.

`npm test` runs the Node regression suite. `npm run check` checks syntax. `npm run build` emits a Cloudflare-compatible Worker in `dist/server/index.js`, including the frontend assets and Sites metadata.

## Demo

1. Open **Live signals** to retrieve public sources (15-minute persistent cache).
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

This MVP is not a calibrated trading system. Jev event probabilities have not been backtested on Fed outcomes and do not incorporate a futures-market baseline. Conditional ETF returns are explicitly **hand-authored illustrations**, not fitted causal effects or confidence intervals. The weighted dollar estimate combines those assumptions with model probabilities; it is not a statistically validated portfolio-return forecast. Quotes may be delayed. Source timestamps and retrieval times are distinct. Arbitrary stocks, personal-portfolio persistence, automatic alerts and brokerage execution are not implemented. Yahoo's public endpoints are prototype dependencies, not a guaranteed production market-data service.

Only the supported ETF/cash examples are accepted. Cash has zero assumed one-week return. Taxes, fees, slippage and dividends are excluded. All source excerpts are escaped for rendering. Model instructions treat fetched source content as untrusted evidence. No URLs supplied by users are fetched by the backend.

## Deployment

The existing Sites project remains private. `.openai/hosting.json` holds only project metadata. Secrets are configured through Sites runtime environment variables and excluded from Git/build assets. Use the exact pushed source revision for the saved deployment archive.

## Vercel deployment

`vercel.json` serves `public/` and maps `/api/:action` to the Node serverless adapter in `api/[action].js`. Node 22 and a 60-second function deadline are configured. The existing Cloudflare/Sites build remains available independently.

Set `TYPESAFE_API_KEY` and `FRED_API_KEY` as sensitive Vercel Preview environment variables, then run `vercel deploy --target=preview --yes` for a preview. `.vercelignore` excludes local secrets and Sites metadata. Automated tests include the Vercel adapter's method, origin, status and unknown-route behavior.

### Multi-signal board

Select Fed policy, CPI inflation, unemployment, or commercial crude inventories; analyze one or all available signals. `POST /api/analyze?signal=fed|inflation|jobs|oil` uses separate cached Jev calls and event-specific evidence. FRED supplies CPI history, UNRATE, PAYEMS and release calendars. EIA Table 4 supplies commercial crude stocks excluding SPR in millions of barrels; its report page supplies publication and next-release dates. Missing calendars remain explicitly unverified. Missing or stale baselines withhold estimates.

Shared contracts in `public/signals.js` define mutually exclusive outcomes and hand-authored one-week return assumptions. CPI compares rounded monthly inflation against the current observation, unemployment compares the published rate, and crude inventories use a ±0.1 million-barrel near-flat band. These are not consensus-surprise forecasts. Portfolio amounts remain in the browser; estimates across correlated events are never summed. Jev evidence adequacy below 0.55 withholds probabilities rather than fabricating a usable signal.

### Interactive impact map

The live workspace opens with an article → macro event → holdings → portfolio mind map. Select a signal, page through all its articles, and click any article to inspect Jev's transmission channel and the connected share of your allocation. Unrouted, uncertain, and low-relevance links remain explicitly distinguished. Article connections are possible exposures, not measured causal effects; no dollar loss is attributed to a single story.

Outcome buttons explore the existing hand-authored one-week assumptions even when event probabilities are withheld. Click a holding or the portfolio sphere for a detailed allocation/value/scenario-impact table. Edit allocations in the portfolio section; the map updates immediately. Longer probability and source explanations are collapsed below the map. Mobile supports horizontal map scrolling, and Escape closes the detail panel.

Interaction reliability: Route articles is available directly on the map. Upstream failures expose a retry action; source refresh clears stale visual results. Keyboard dismissal returns to the originating node, invalid allocations suppress stale dollar totals, and pending analysis survives signal navigation without leaking results across a refresh. Browser regression procedures are recorded in `docs/verification.md`.

### Broader chatter and asset probabilities

On a fresh briefing (15-minute persistent cache), ingest Hacker News stories/comments through Algolia search, CNBC/BBC/Guardian business RSS, and existing Fed/EIA sources. Topic keyword triage can assign multiple macro categories; Jev verifies selected evidence. The model context reserves room for official sources and publishers and caps community items, admitting at most one comment per HN thread. Community content remains explicitly unverified. Sources are collected on demand and deduplicated in PostgreSQL; this is not a comprehensive firehose archive.

Reddit uses public RSS feeds by default; an optional `REDDIT_ACCESS_TOKEN` enables OAuth. X uses saved PostgreSQL posts from bounded Apify Console runs. Source errors and unavailable credentials remain explicit.

The five ETF cards show **historical base-rate probabilities** for a move above +1%, within ±1%, or below −1% over five trading sessions. Method: up to five years of Yahoo adjusted closes, non-overlapping five-session windows, empirical frequencies, marginal 95% Wilson intervals, and a final-20% sequential holdout Brier score. Require ≥100 usable windows and a last observation within seven days; discard current-day/future prices. These are descriptive historical estimates, not calibrated next-week forecasts and not conditioned on chatter or event scenarios. Serial dependence and regime changes limit the sampling intervals. Portfolio impacts remain the separately labeled scenario assumptions.

Primary connector references: https://hn.algolia.com/api ; https://www.reddit.com/dev/api/ ; https://docs.x.com/x-api/posts/search-recent-posts . Browser regression: run `tests/browser-chatter.js` through the existing Playwright CLI procedure.

### Reddit scraping fallback and X scraper

Reddit now also supports public Atom/RSS feeds for r/Economics, r/investing, and r/stocks when OAuth is absent. This reads public post titles, links, publication timestamps, and feed excerpts—not full comment threads. Rate limits and blocked feeds remain unavailable; there is no proxy rotation or login bypass. An available feed can supply Reddit content even while optional OAuth access is unconfigured.

For X, the selected maintained scraper is [Apidojo Twitter Scraper Unlimited](https://apify.com/apidojo/twitter-scraper-lite), with verified `searchTerms`, `sort`, `maxItems`, and `start` input fields. A direct public X search page yielded no post records; an Apify account token is required for this alternative, but no X developer key is required by our adapter.

The actor blocks API launches on Apify's Free plan, returning demo placeholders. This was verified live; Folio rejects those records and checks the plan before API launches. The Console works with ten-item runs. No upgrade or recurring paid schedule was created.

### Durable collection and credit controls

Folio uses isolated `folio_posts`, `folio_cache`, `folio_runs`, and `folio_access` PostgreSQL tables in the existing MacroGuru Supabase project. No new project subscription was purchased. RLS is enabled, anonymous/authenticated access is revoked, and the dedicated `folio-ingestion` Edge Function authenticates a server-only key against its SHA-256 hash. Its API is limited to Folio operations; it does not expose arbitrary SQL. Existing MacroGuru tables are unchanged. Schema and function source live in `database/`.

Vercel needs `FOLIO_STORE_URL` and sensitive `FOLIO_STORE_KEY` alongside the existing Jev/FRED keys. `APIFY_TOKEN` stays local for collection/import; Vercel reads X from PostgreSQL and does not need that token. `.env.local` is ignored.

- Posts are upserted by stable platform IDs or canonical feed URLs. Marketing URL parameters are removed; repeated imports update one record rather than add copies. Separate posts repeating a claim are still separate evidence, not independent confirmation.
- The full briefing is shared across process restarts for 15 minutes. X reads saved posts, and API/browser refreshes never launch an Apify actor. The UI immediately shows loading and then whether the saved collection was reused.
- Operator collection reserves **$0.10 per attempt** before launch, with a **$0.50 calendar-month reservation ceiling**. Failed attempts retain the entire reservation. A PostgreSQL advisory transaction lock makes reservation atomic; unresolved runs block further launches. Standard collection has a 24-hour cooldown and unique day/window keys. No automatic schedule exists.
- Actor settings: ten items for Free-plan Console runs (30 for a paying-plan API run), $0.10 actor-charge cap, 120 seconds, 256 MB. Platform storage/transfer charges may be additional; this is not an account-wide cap on other projects or manual dashboard activity.
- Windows end at the current UTC midnight and advance from the last usable collection. These deliberately small samples are not exhaustive. Only valid public posts within 30 days enter the feed; profile metadata and private portfolios are not archived.

Operator workflow:

1. `npm run prepare:x` reserves a window and prints the exact Console input, run limits and reservation ID. A denied reservation must not be followed by a new run.
2. Start that input once in the Apify Console. Do not repeat Start if the outcome is uncertain.
3. `npm run import:x -- RUN_ID RESERVATION_ID` validates the actor, time and run cap, reads its dataset and upserts the posts. Repeating an import costs no new scraper run and adds no duplicate records. An already linked run can be imported with just `RUN_ID`.
4. `npm run collect:x` is the paying-plan API alternative; Free accounts fail before launch. `npm run collect:x -- --dry-run` shows settings without network calls. Unknown launch outcomes remain blocked until an operator reconciles the existing Apify run.

Initial verification: one unusable API trial ($0.004) followed by one explicitly recorded, supervised Console recovery ($0.020); 10 usable X posts, repeated import added zero rows. Both attempts count toward reservations ($0.20 of $0.50). This supervised recovery is recorded in the ledger and did not enable automatic retries.

Other researched alternatives: [The Mine Works Reddit scraper](https://apify.com/themineworks/reddit-scraper) for full comment trees, and [Bright Data Twitter scraper](https://brightdata.com/products/web-scraper/twitter). Provider tokens are still needed. The older `trudax/reddit-scraper` is listed as deprecated and was not selected.

### People behind the signals

A dated, primary-source-verified watchlist in `public/people.js` covers the seven Fed governors, Scott Bessent, Donald Trump and Haitham Al Ghais. Profiles explain each person's authority and possible ETF transmission channels; these are watchlist exposures, not statement-level impact forecasts. Roles were checked September 19, 2026; the UI flags review after 30 days. The list is an initial policy-focused sample, not all FOMC voters or all influential market participants.

The briefing adds three bounded open-web RSS searches (Fed, fiscal policy, OPEC), plus person matching on existing sources. Google News results are index excerpts, not independently verified quotes; index URLs are retained as provenance. Original Fed speech attribution requires both the official hostname and a speaker-prefixed speech title. Full-name mentions are explicitly reported coverage. A matched X author is distinguished from an institutional account; retweets do not become the person's own opinion. No personal Fed/Trump handle is invented. Bessent's linked official handle and OPEC's institutional account seed targeted X collection, along with name searches for the watchlist. Author handles are retained when importing the existing capped actor output.

People links and the dated registry are saved inside the existing PostgreSQL post payloads and briefing cache. Refreshing the website collects free open-web sources only when the shared 15-minute cache expires. X remains an operator-triggered, bounded sample: the previously established cooldown/reservation ceiling still applies, and this feature does not create a new scraper run or subscription. `prepare:x` and `collect:x` now use the shared people query; existing datasets can be re-imported without new scraper runs.

Click a person for the visual person → signals → holdings path, linked source passages, attribution type, account provenance and role source. “Trace this story to holdings” opens that exact article and page in the existing map. Empty coverage is explicit. Profile exposure recalculates with valid portfolio allocations; Jev gets the dated role context and per-item attribution, but must evaluate the actual evidence and may abstain. Popularity, identity and a mention alone never supply an event probability.

Public demo: https://folio-macro-companion.vercel.app/#live. The stable alias points to the verified Preview build, using Preview secrets. Project-level Vercel SSO/password protection is off for this public hackathon demo; the database bridge still requires its server-only key. After each future deploy, update the stable alias with `vercel alias set NEW_DEPLOYMENT_URL folio-macro-companion.vercel.app`.

Priority statement cards surface direct, relevant communications first. Clicking “Show portfolio connection” opens the exact story and requests its Jev route, including that item explicitly in the model's evidence even if it fell outside the default source sample. Missing evidence still withholds event probabilities. These clicks do not start Apify collection.

### Reddit continuity and initial event forecasting

Reddit ingestion combines live public RSS with the existing PostgreSQL collection. Stored items retain original publication timestamps, expire from retrieval after 30 days, and merge with live copies using platform IDs/canonical URLs. No Apify run is launched by a page refresh. Source health distinguishes the saved collection from live subreddit feed availability.

CPI and unemployment now receive an experimental next-release statistical baseline directly in `/api/briefing`. `server/forecasts.js` uses up to 160 monthly FRED observations, classifies outcome directions under the existing event contracts, and estimates transition probabilities conditional on the latest direction. With at least 12 matching transitions, counts are shrunk toward Laplace-smoothed overall frequencies using 12 pseudo-observations; otherwise the overall frequency baseline is used. Missing-month transitions are excluded. Stale history, insufficient data, and a mismatched current baseline withhold the estimate.

Each forecast includes sequential retrospective Brier scores against an unconditional reference. These use **latest revised observations**, not historical first-release vintages; they do not establish real-time predictive skill or first-release calibration. Baselines are labeled independently of Jev. When Jev abstains or fails, the statistical estimate remains available with the news-assessment status and routing attached. Fed and crude inventory events do not use this monthly baseline. Portfolio dollar impacts still depend on fixed one-week return assumptions.

## Pitch deck

- [Live HTML presentation](https://folio-macro-companion.vercel.app/pitch.html)
- [Matching PDF](public/Folio-Website-Pitch.pdf)
- [PowerPoint visual copy](outputs/Folio-Website-Pitch.pptx)

The presentation shares the website's CSS tokens, DM Sans typography and `public/orb.js` canvas renderer. Edit the eight-slide content in `public/pitch-data.js`; layout and controls live in `public/pitch.css` and `public/pitch.js`. Arrow keys, Page Up/Down, Home/End, space, touch swipes and fullscreen are supported. PDF and PowerPoint are static visual exports; regenerate them when content changes. The HTML deck is linked from the main navigation.

The current public deployment is on Vercel. For production updates, configure server secrets in the production environment and use `vercel deploy --prod`. Do not commit `.env.local`, provider credentials, or database keys. `.env.example` contains names only.
