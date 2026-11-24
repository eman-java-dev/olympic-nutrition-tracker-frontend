# Hosted browser verification

The browser job checks out the backend at the immutable commit in `BACKEND_SHA` and verifies the checked-out SHA. It packages the Java 21 application, starts disposable MySQL 8.0.43, and seeds synthetic ADMIN, COACH and ATHLETE accounts using the pinned backend fixtures. The application connects using a temporary database account with DML grants. Docker and the backend bind only to loopback from the runner.

The job runs the five existing Playwright workflows against an optimized test build. `npm run build:e2e` uses the production optimization settings and the loopback API URL, and writes to `dist/e2e`. The regular production build keeps its Render URL and `dist/app` output. The local static server validates the test bundle's API target and sends the test CSP on its responses. Chrome uses a deny-by-default proxy with loopback bypass, so the suite does not send authentication or fixture data to external services.

The job bounds database and API startup, masks the generated credentials, and removes the fixture container, processes, logs and results. Traces, videos and screenshots are disabled. The test verifies local CSP behavior. Production Render CSP, rewrite settings, deployed commits, origin and proxy configuration continue to require staging and operator evidence.

The preceding hardening pass ran five browser workflows locally. See [the draft pull request checks](https://github.com/eman-java-dev/olympic-nutrition-tracker-frontend/pull/2/checks) for hosted follow-up evidence tied to a specific commit.
