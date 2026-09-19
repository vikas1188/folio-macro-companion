# Verification

- Five Node tests pass: stress arithmetic, contribution totals, cash-shift loss reduction, opportunity cost, all-cash behavior and invalid inputs.
- Browser smoke: default -$2,800; gentle easing +$2,700; moving ten points to cash +$2,400; invalid 95% allocation hides estimates and displays corrective message; reset restores example; growth-shock -$2,400.
- Desktop and narrow mobile previews inspected. Narrow heading sizing adjusted to avoid overlap. No horizontal overflow in inspected narrow viewport. No browser console errors observed.
- Read-only WebMCP calculation registered and returned the same scenario/values as the visible interface. The browser exposes no invalid schema invocation path used in this verification.
- Reduced-motion treatment implemented in CSS/JS; not separately emulated in browser verification.
- This verifies the illustrative calculator and UI only, not financial forecasting accuracy or live integrations.
