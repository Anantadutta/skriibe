# Security Hardening: Plan and Change Tracker

This file tracks the five-phase hardening plan that came out of the October 2026 audit, and records exactly what each phase changed. Update it whenever a phase or step is completed.

| Phase | Scope | Status |
|---|---|---|
| 1 | Stop the bleeding: secrets, admin login, debug routes, top-up amount, creator passwords | Code written 2026-10-01. Not yet run, tested, committed or deployed |
| 2 | Access control on chat, buyer routes and sockets | Not started |
| 3 | Money integrity (atomic balances, unique payment reference, webhook) | Not started |
| 4 | Traffic management (headers, rate limits, OTP storage, indexes, pagination) | Not started |
| 5 | Structure and quality (scripts folder, controllers, lazy loading, tests) | Not started |

## Phase 1

### Before you run or deploy this

The code will not work fully until these are done. Do them locally first, then in the hosting dashboard.

1. **Set the admin login.** From the `backend` folder run `node scripts/hash-admin-password.js`, type a new password, and add the printed `ADMIN_PASSWORD_HASH=...` line plus `ADMIN_USERNAME=<your choice>` to `backend/.env` and to the host. Until both are set, the admin panel login shows "Admin login is not configured on the server". The old hardcoded username and password no longer work and must not be reused.
2. **Replace the default secrets.** The local `backend/.env` has `JWT_SECRET` and `ENCRYPTION_KEY` set to the well-known default values that were hardcoded in the source. The server now prints a `SECURITY WARNING` at startup while that is the case. If production uses the same values, anyone can forge a fan or creator login. Use long random values (`ENCRYPTION_KEY` must be exactly 32 characters). Changing `JWT_SECRET` logs every fan and creator out once.
3. **Check the host has `JWT_SECRET`, `SESSION_SECRET` and `ENCRYPTION_KEY`.** The server now refuses to start if any of the three is missing.
4. **Set `CRON_SECRET` and update Uptime Robot.** The two cron URLs return 503 until `CRON_SECRET` is set, then 401 without the secret. Change the monitor URLs to `/api/cron/sla-monitor?secret=<CRON_SECRET>` and `/api/cron/weekly-sweep?secret=<CRON_SECRET>` (or send an `x-cron-secret` header).
5. **Rotate the leaked credentials.** The MongoDB users and the Razorpay test key that were hardcoded in scripts are still in git history. Change those passwords and keys in the MongoDB Atlas and Razorpay dashboards.

### What changed

| Step | Change | Files |
|---|---|---|
| 1 | Hardcoded MongoDB URIs and Razorpay keys removed from scripts; they now read `backend/.env` | `backend/test.js`, `backend/check_ana_9000.js`, `backend/test-razorpay.js` |
| 2 | New startup check: stops the server if a required secret is missing, warns if one is a known default | `backend/utils/validateEnv.js` (new), `backend/server.js` |
| 2 | Removed the `\|\| 'secret'` fallback (18 places), the session-secret fallback and the encryption-key fallback | `backend/middleware/auth.js`, `backend/server.js`, `backend/routes/auth.js`, `buyers.js`, `creator.js`, `creators.js`, `fanAuth.js` |
| 3 | New `POST /api/admin/login`: checks `ADMIN_USERNAME` / `ADMIN_PASSWORD_HASH`, limits failed attempts to 10 per 15 minutes, returns a 12-hour admin token | `backend/routes/admin.js` |
| 3 | Every `/api/admin/*` route now requires an admin token (`router.use(verifyAdminToken)`) | `backend/routes/admin.js` |
| 3 | Admin tokens are signed with their own key, derived from `JWT_SECRET` and the admin password hash, so a weak `JWT_SECRET` alone cannot forge one. Changing the admin password invalidates old tokens | `backend/middleware/auth.js` |
| 3 | Query admin routes (stats, list, update, delete) require an admin token; `POST /api/queries` (raise a query) stays public | `backend/routes/queries.js` |
| 3 | Admin login screen calls the server instead of comparing against a password in the browser; the token is stored as `skriibe_admin_token` and attached to every admin API call | `admin-frontend/src/pages/AdminLogin.jsx`, `admin-frontend/src/adminAuth.js` (new), `admin-frontend/src/main.jsx` |
| 3 | Helper to generate the admin password hash | `backend/scripts/hash-admin-password.js` (new) |
| 4 | Admin token required on `/api/debug-refs`, `/test-route-123`, `/api/public/debug-questions`, `/api/public/fix-stats`, `/api/creators/resolve-conflicts` | `backend/server.js`, `backend/routes/public.js`, `backend/routes/creators.js` |
| 4 | `/api/cron/sla-monitor` and `/api/cron/weekly-sweep` require `CRON_SECRET` | `backend/server.js` |
| 5 | Top-up credits the amount on the Razorpay order, not the amount sent by the browser, and only for an order created for that fan | `backend/routes/wallet.js` |
| 6 | Password helpers moved to one shared file (same hashing as before for fans) | `backend/utils/password.js` (new), `backend/routes/fanAuth.js` |
| 6 | Creator passwords are hashed at signup and reset. Existing plain-text passwords are checked once at the next login and replaced with a hash | `backend/routes/creators.js` |
| – | New env vars documented | `backend/.env.example` |

### Behaviour that is different on purpose

- The open back doors listed above now return 401. The admin pages inside the main `frontend` app (`/admin/queries` on the Vite dev server) show no data unless an admin token exists; the real admin panel is `admin-frontend`.
- Creator login no longer accepts the placeholder value `oauth_dummy_pass`. Creators upgraded from a Google or Facebook fan account had that literal string stored as their password, so anyone could log in as them.
- Creators upgraded from an email fan account already had a hashed password that the old plain-text comparison always rejected. The creator login page now accepts their correct password.
- Resetting a password through the creator reset page stored the fan password as plain text, which made the fan login fail afterwards. It is now hashed.

### Not verified

No command was run for this phase: the server was not started, no login or payment was exercised, and nothing was built. Before deploying, check at least: server starts, fan login, creator login with an old account, admin login, one admin page loads data, one wallet top-up in Razorpay test mode.

### Noticed but not changed

- `backend/routes/wallet.js`: the Razorpay `receipt` string is about 52 characters and Razorpay documents a 40-character limit. If top-ups fail with "Error creating order", this is the likely cause.
- `GET /api/creators/me` and `POST /api/auth/verify-otp` return the whole creator record, including the password hash and reset token, to that creator's browser.
- `admin-frontend/src/pages/DismissDispute.jsx` and `RefundDispute.jsx` call `require('axios')` inside a browser build, which is likely to throw when the button is clicked.
- `admin-frontend/dist` still holds an old build containing the old hardcoded password until the next build.
- Instagram tokens already stored were encrypted with the default key and a fixed IV.

## Phase 2: access control (not started)

- [ ] Verify the token on socket connect; check the user belongs to the session before join, send or end
- [ ] Add login and ownership checks to `/api/chat/end`, `/fan-accept`, `/creator-accept`, `/:sessionId`, `/:creatorId/:fanId/messages`
- [ ] Add login and ownership checks to `/api/buyers/history/:phone`, `/question/:id`, `/flag`, `/satisfied`, and follow-up submission
- [ ] Replace global `io.emit` with room-targeted emits, after mapping which frontend listeners rely on them

## Phase 3: money integrity (not started)

- [ ] Atomic balance changes (`$inc` with a balance condition) for tips, questions and chat billing
- [ ] Unique index on the payment reference to block double credit
- [ ] Razorpay webhook as a backstop for top-ups

## Phase 4: traffic management (not started)

- [ ] Security headers, global rate limit, stricter limits on login, OTP and password reset
- [ ] OTP storage in MongoDB with expiry, `crypto.randomInt`, attempt limits on every OTP route
- [ ] Missing indexes on Question, WalletTransaction, ChatSession; escape search input; optional pagination
- [ ] Move the boot-time stats sync and migration out of server startup
- [ ] Make chat billing survive restarts

## Phase 5: structure and quality (not started)

- [ ] Move loose scripts into `backend/scripts/`
- [ ] Split large route files into controllers and services; one shared `connectDB`
- [ ] Lazy-load pages in `frontend/src/App.jsx`; remove duplicate admin pages and API files
- [ ] Request validation with zod, central logging, smoke tests for auth, wallet and chat
