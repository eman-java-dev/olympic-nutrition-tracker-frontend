# Olympic Nutrition Tracker Frontend

Olympic Nutrition Tracker is an Angular application for managing athlete profiles, coaches, consultations, and nutrition entries. It provides English and French interfaces and uses the [Spring Boot API](https://github.com/eman-java-dev/OlympicNutritionTracker-Backend) for authentication and data.

[Open the live application](https://olympic-nutrition-tracker-frontend.onrender.com) · [Check API reachability](https://olympicnutritiontracker-backend.onrender.com/healthz)

The candidate resolves Angular core 21.2.26, Angular CLI 21.2.31, TypeScript 5.9.3, and RxJS 7.8.2 from the [lockfile](package-lock.json).

## Screenshots

**Home screen**

![Olympic Nutrition Tracker home screen with navigation and a video hero](src/assets/screenshots/home-page.png)

**Sign-in screen**

![Olympic Nutrition Tracker sign-in form in French](src/assets/screenshots/signin-page.png)

## Routes and permissions

| Route | Screen |
| --- | --- |
| `/signin` | Sign-in form. The root path and unknown paths redirect here. An authenticated user is directed to the home screen. |
| `/home` | Protected home screen with links to the main features. |
| `/athletes` | Athlete profiles and coach assignment controls. |
| `/coaches` | Coach directory and administration controls. |
| `/nutrition` | Nutrition entries and athlete filtering. |
| `/consultations` | Consultation schedules and management controls. |

`authGuard` protects `/home`, `/athletes`, `/coaches`, `/nutrition`, and `/consultations` and redirects unauthenticated users to `/signin`. The `/signin` route uses `guestGuard` to redirect authenticated users to `/home`. The root path and unknown paths redirect to `/signin`. [Angular route definitions](src/app/app.routes.ts)

| Role | Available interface actions |
| --- | --- |
| `ADMIN` | Manage athletes and coaches, assign coaches, and create, update, or delete nutrition entries and consultations. |
| `COACH` | View assigned athletes and browse the coach directory. Create or update nutrition entries for assigned athletes and create or update their own consultations in that scope. |
| `ATHLETE` | Read the linked athlete profile, its nutrition entries and consultations, and the coach directory. |

The interface uses the account role to control which actions are visible. The backend enforces authorization and record scope, including coach assignments. `ATHLETE` accounts need a matching athlete profile link to access their records. `COACH` accounts need a matching coach profile link to access the records of their assigned athletes. `ADMIN` access requires no profile link.

## Local development

Use Node.js 24.22.3, pinned in [.nvmrc](.nvmrc), and the included npm. The update moved through Angular 18, 19, 20 and 21 with browser tests and a production build between each major. [Angular version compatibility](https://angular.dev/reference/versions) ? [Node.js release lifecycle](https://nodejs.org/en/about/previous-releases)

From the repository root:

```sh
npm ci
npm start
```

The development server opens `http://localhost:4200` and sends API requests to `http://localhost:8080/api`. Set up and start the [backend service](https://github.com/eman-java-dev/OlympicNutritionTracker-Backend) with a local MySQL database before signing in.

## API configuration and Render

| Build | API base |
| --- | --- |
| Development | `http://localhost:8080/api` in [environment.ts](src/environments/environment.ts) |
| Production | `https://olympicnutritiontracker-backend.onrender.com/api` in [environment.prod.ts](src/environments/environment.prod.ts) |

The [Angular build configuration](angular.json) selects the production environment file for a production build. The API base is part of the public JavaScript bundle. Update the environment file and rebuild if the backend moves.

```sh
npm run build -- --configuration production
```

The repository targets an HTTPS Render Static Site. For a corresponding deployment, build from the repository root with `npm ci` and the production build command, publish `dist/app`, and rewrite Angular paths from `/*` to `/index.html` so that a route can be opened directly or refreshed. Angular sends API requests directly to the separate Render backend by absolute URL. [Render routes and rewrites](https://render.com/docs/redirects-rewrites)

The API must allow the exact frontend origin, `https://olympic-nutrition-tracker-frontend.onrender.com`, in its `CORS_ALLOWED_ORIGINS` settings. Requests use `Content-Type` for JSON and `Authorization` for bearer tokens. The backend handles CORS preflights for cross-origin requests.

## Authentication and browser security

The sign-in form posts `username` and `password` to `/api/auth/login`. The API supplies the username, role, and JWT. Angular keeps the session in browser local storage, clears it on sign-out or expiry, and drops rejected sessions after an authenticated request receives HTTP `401`. The interceptor attaches the bearer token only to protected requests under the configured API origin and path.

The frontend uses the token expiry and role for navigation and display. The backend verifies token signatures and enforces permissions. Keep database credentials and JWT signing keys in backend runtime configuration.

## Verification and remaining work

Run `npm test` for the Angular browser suite in ChromeHeadless. Set `CHROME_BIN` if Chrome is installed in a nonstandard location.
Run `npm run build` for production assets and `npm audit --audit-level=high` for the lockfile dependency check.

The optional Playwright suite uses only the local frontend and a disposable backend. Start the backend fixture at `http://localhost:8080` with the synthetic accounts seeded by the backend fixture script. Set `BROWSER_TEST_PASSWORD` in the local environment to the generated fixture password, then run `npm run test:e2e`. Playwright starts the local frontend and uses installed Chrome. Traces, screenshots and videos are disabled.

The UI supports sign-in and sign-out. Registration remains available through the backend API. See [the session decision and staging header policy](deploy/browser-security.md).
