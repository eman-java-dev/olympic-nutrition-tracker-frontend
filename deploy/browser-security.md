# Browser session and deployment

The app keeps its existing bearer token in browser local storage so a route can reload and restore the session. Storage exceptions fall back to memory for the current page. A successful server response starts the session, and expiration, sign-out and authenticated 401 responses clear it. HTTP 403 leaves the session available for permitted work. Late 401 responses for a superseded session leave the new session alone.

Same-origin JavaScript can read the persisted token. Session storage changes persistence and retains that exposure. Memory-only storage would change reload behavior. A cookie change would require coordinated cross-origin cookie, CSRF, CORS and logout tests. This candidate preserves the current authentication transport. Revisit persistence if the origins or session requirements change.

## Static response headers

In a separate Render static site, verify the deployed rewrite and the actual frontend/API hostname first. Start with path `/*` and `Content-Security-Policy-Report-Only`. Exercise all six routes in English and French, including a fresh visit and direct reload. Check Chrome and another supported browser for application errors, media or style violations, throttling feedback and permitted API calls. Then promote the reviewed policy to `Content-Security-Policy` and retest. The candidate build avoids inline critical-CSS handlers, and styles still require the inline allowance. [Render static headers](https://render.com/docs/static-site-headers) · [Angular security](https://angular.dev/best-practices/security)

```text
default-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://images.unsplash.com; media-src 'self' blob:; font-src 'self'; connect-src 'self' https://olympicnutritiontracker-backend.onrender.com; object-src 'none'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'
```

Set `X-Content-Type-Options: nosniff`, `Referrer-Policy: no-referrer`, and `Permissions-Policy: camera=(), microphone=(), geolocation=()` on the same path. Capture sanitized response headers from a direct-route request after deploying to staging. For rollback, verify the effective static headers and rewrites independently of the previous artifact. Render retains those settings during rollback. [Render rollback behavior](https://render.com/docs/rollbacks)

The recommended header values are a staging candidate. Applying them in production requires approval of the exact service, artifact and tested settings.

The [hosted browser job](ci-browser.md) uses an optimized loopback bundle and applies the local equivalent of this CSP through the test HTTP server. Render header and rewrite settings require separate staging evidence.
