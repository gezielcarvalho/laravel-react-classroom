# Auth Implementation Plan — SPA Login (Frontend + Backend)

Goal: Add user authentication (login/logout/current user) to the app using Laravel Sanctum (cookie-based SPA auth) and a React login page. This approach provides secure cookie-based session for the SPA and keeps API calls simple (no manual token handling), while allowing token usage for non-browser clients later if needed.

Summary (high level)

- Backend: enable and configure Laravel Sanctum, implement `AuthController` with `login`, `logout`, and `user` methods; protect API routes with `auth:sanctum` middleware; add validation and tests.
- Frontend: add `AuthService` to perform CSRF fetch and login/logout, create `Login` page, `AuthProvider` (context) to hold authenticated user state, and `ProtectedRoute` component to guard pages.
- Add tests: PHPUnit feature tests, frontend unit tests, and optionally an e2e test (Cypress/Playwright) for sign in flow.
- Update docs: `README.md` and `docs/auth-plan.md` with usage steps and troubleshooting tips (CORS, cookies, CSRF).

Why choose Sanctum (cookie-based SPA flow)

- Minimal token handling in the frontend (uses cookies managed by browser).
- Works well with same-origin or controlled subdomain setups and supports SPA sessions.
- Already included in the backend `composer.json`.

Phases & Tasks (detailed)

1. Design & decisions (in-progress)

- Confirm SPA origin (frontend at http://localhost:3000) and API at http://localhost:8000.
- Decide on same-site cookie settings (SameSite=None for cross-site; for dev same-origin works).
- Choose which fields the `user` endpoint returns (id, name, email, role).

2. Backend: Sanity & setup

- Install/publish Sanctum (if not already): `composer require laravel/sanctum` & `php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"`.
- Add `\Laravel\Sanctum\SanctumServiceProvider` if needed (Laravel 8 auto-discovers usually).
- Add middleware `\Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class` or configure `config/sanctum.php` `stateful` domains for SPA dev.
- Add Sanctum middleware to `api` if using cookie-based auth (see docs).
- Add config env notes in `api/.env.example` about `SESSION_DOMAIN`, `SANCTUM_STATEFUL_DOMAINS` for local dev.

3. Backend: Implement endpoints

- Create `app/Http/Controllers/Api/AuthController.php` with methods:
  - `login(Request $r)`: validate credentials, attempt `Auth::attempt()`, return 200 and user on success. (For Sanctum cookie flow: first request `GET /sanctum/csrf-cookie` to set cookie). Return 401 on failure.
  - `logout(Request $r)`: revoke tokens or `auth()->logout();` and clear session; return 200.
  - `user(Request $r)`: returns `auth()->user()`.
- Register routes in `routes/api.php`:
  - `Route::post('login', [AuthController::class, 'login']);`
  - `Route::post('logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');`
  - `Route::get('user', [AuthController::class, 'user'])->middleware('auth:sanctum');`

4. Backend: Protect APIs & tests

- Apply `auth:sanctum` middleware to routes that require authentication (e.g., student creation/edit if desired).
- Add PHPUnit feature tests for login success/failure, protected route access, logout.

5. Frontend: Auth plumbing

- Create `src/services/authService.ts` with methods:
  - `getCsrf()` → `axios.get('/sanctum/csrf-cookie', { withCredentials: true })`.
  - `login(credentials)` → call `getCsrf()` then `POST /api/login` with `{ withCredentials: true }`.
  - `logout()` → `POST /api/logout` with credentials.
  - `getUser()` → `GET /api/user` with credentials.
- Configure axios instance (e.g., `src/services/apiClient.ts`) to use `baseURL` and `withCredentials: true`.

6. Frontend: UI & routing

- Add `src/pages/Login.tsx` page with form fields (email, password), client validation, and call `AuthService.login()`.
- Add `AuthProvider` context that holds `user` and `loading` state, exposes `login`, `logout`, and auto-fetches `getUser()` on mount (if cookie present).
- Add `ProtectedRoute` wrapper (or use route guards) redirecting to `/login` if not authenticated.
- Update `App.tsx` routes to include `Login` page and wrap protected pages (e.g., student add/edit) with `ProtectedRoute`.

7. Frontend: Tests

- Unit tests for `AuthService` mocks (axios) and `Login` component behavior.
- Optional e2e: simulate full flow (visit login page, submit credentials, assert redirect and protected content visible).

8. Security & CORS notes

- Ensure `api` CORS config allows credentials and the frontend origin in `config/cors.php`:
  - `'supports_credentials' => true` and allowed origins include `http://localhost:3000`.
  - Add `FRONTEND_URL` to `.env` during local setup if needed.
- Ensure cookies have correct `SameSite` and `secure` flags for the environment.

9. Docs & developer notes

- Add step-by-step instructions to `docs/auth-install.md` covering `/sanctum/csrf-cookie`, `POST /api/login`, expected responses, and troubleshooting for cookies (browser blocking third-party cookies, CORS config, correct domains).
- Update README with quick usage notes.

10. Rollout and monitoring

- Add tests to CI.
- Verify cookies and endpoints in staging before production.

Estimated effort (rough)

- Design & config: 1–2 hours
- Backend endpoints + tests: 2–4 hours
- Frontend pages + context + tests: 3–6 hours
- e2e test and docs: 1–2 hours

Deliverables

- `AuthController` + routes + tests
- `AuthService` and axios client
- `Login` page and `AuthProvider` + `ProtectedRoute`
- `docs/auth-plan.md` (this file) + README updates

Notes & Alternatives

- If you prefer token-based (JWT) auth for API clients, we can add a token flow instead (passport/jwt). For a SPA, Sanctum cookie flow is simplest and secure.
- For SSO (Google, Microsoft), integrate social providers later via Laravel Socialite and map sessions accordingly.

If you'd like, I can start implementing the backend `AuthController` and the frontend `Login` page now — say which step to start with (backend or frontend) and I'll begin and update the todo list as I progress.
