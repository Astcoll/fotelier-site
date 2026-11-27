# Conversion v12 review

Base is main at b4aa2f6. Work is isolated on conversion-v12 for Claude's review.

## Configuration before publication

Set `BUTTONDOWN_USER` in `assets/site.js`, then run `node scripts/configure-waitlist.mjs` and commit both files. The script copies the single username setting into the plain HTML action so signup can work with JavaScript disabled. No account was created. The placeholder intentionally shows an on-page setup message with JavaScript enabled.

Approve the added Buttondown paragraph in `privacy/index.html`. All existing policy body wording is preserved, including the older email/iPhone-model paragraph as requested. The new form collects no model. Navigation on both policy pages now says “Join beta” to remove the December promise.

Confirm double opt-in and unsubscribe behavior in the Buttondown account before launch. Source tags need the account's tagging feature enabled. With JavaScript disabled, the form submits the default `direct` tag. With JavaScript enabled, `src` must match `[a-z0-9-]{1,32}` or becomes `direct`.

## Checks completed

- JavaScript syntax and Git whitespace checks pass.
- Isolated Node checks exercised the actual waitlist handler with mocked requests. Valid and invalid source tags, submitted tag, success, HTTP failure, network failure, placeholder setup state and duplicate-submit prevention pass. Success and failure are simulated, with no email sent.
- All image references exist and have explicit width/height. The three reused hero WebP assets are 18,076, 13,752 and 19,330 bytes. Originals are unavailable for the real app exports, so the hero explicitly labels the existing demo photos and shows the same CSS Warm look plus a white frame across all three.
- Original Privacy and Support body text matches main after removing the one added paragraph. CNAME and .nojekyll are byte-identical to main.
- Only Google Fonts and Buttondown appear as external network hosts in shipped HTML/JS. No cookies, storage or analytics were added.
- Own JS is 8,106 bytes gzipped and CSS is 10,252 bytes gzipped, measured with Python gzip at level 9. Both are within budget.

## Browser checks blocked

The browser helper failed to start with “No such file or directory”. No screenshots or browser layout/performance measurements were produced. Browser rendering must be checked before publication, especially the first screen at 390 × 844 and 1440 × 900 and the 767/768 px breakpoint.

| Requested evidence | Result |
| --- | --- |
| First screen at 390 and 1440 px | Unverified, screenshots unavailable |
| Form empty, success and error at both widths | Handler checked with mocks, screenshots unavailable |
| Total document scroll height at 390 px before/after | Unmeasured |
| Baseline desktop FPS / long tasks | Unmeasured |
| Grain disabled FPS / long tasks | Unmeasured |
| Cursor disabled FPS / long tasks | Unmeasured |
| Header blend disabled FPS / long tasks | Unmeasured |
| Real iPhone Safari and Instagram browser | Untested |
| Real Buttondown signup, CORS and confirmation delivery | Untested, account not configured |
| JavaScript-disabled native submission | HTML action prepared, actual request untested |

The fourth commit retains an unlinked diagnostic switch for the pending measurements. Use the same Chrome viewport and machine, and repeat the same scroll recording from top to bottom with no query, `?perf=grain`, `?perf=cursor` and `?perf=header`. Each variant disables exactly one feature. Record FPS and long tasks in Chrome DevTools Performance. Grain becomes static, cursor code does not initialize, and header blend becomes normal respectively. No effect was removed from the baseline without measurements. Remove the switch after completing the diagnosis and deciding the measured fix.

For form screenshots, intercept only the Buttondown request in the review browser and return a successful HTTP response or an HTTP error. Clearly label these screenshots as simulated. Test a real signup separately after configuration and approval.
