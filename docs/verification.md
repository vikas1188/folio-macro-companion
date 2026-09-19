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
