# Changelog

## 2026-10-01

### Security (Phase 1 of `SECURITY_IMPLEMENTATION_PLAN.md`)
- Server refuses to start without `JWT_SECRET`, `SESSION_SECRET` and `ENCRYPTION_KEY`; hardcoded fallbacks removed.
- Admin panel login moved to the server (`POST /api/admin/login`, `ADMIN_USERNAME` / `ADMIN_PASSWORD_HASH`); all admin and query-admin routes require an admin token.
- Debug and fix routes require an admin token; cron trigger routes require `CRON_SECRET`.
- Wallet top-up credits the amount on the Razorpay order instead of the amount sent by the browser.
- Creator passwords are hashed; existing plain-text ones are upgraded at next login.
- Hardcoded database and Razorpay credentials removed from `backend/test.js`, `check_ana_9000.js`, `test-razorpay.js`.

## 2026-09-30

### Cleanup
- Removed numerous 0-byte ghost files from the root directory (e.g. `check.js`, `list.js`, `temp.txt`, `{const`, `{file`, etc.).
- Removed temporary scratch scripts cluttering the root directory (e.g. `check_*.js`, `find_*.js`, `search_*.js`, `test_*.js`, `script*.js`).
- Removed unused and detached scripts from the root directory (`backfill_alerts.js`, `clean.ps1`, `diff_backend.txt`, `fetch_alerts.js`, `insert_alert.js`, `syntax-check.js`, `temp-merge.patch`, `fallback.log`).
- Retained essential configuration files, documentation, and the main source directories (`backend`, `frontend`, `admin-frontend`).

### Structure Assessment
- Recorded initial review of the codebase folder structure for future refactoring (moving root images to an assets folder, setting up a shared workspace, migrating backend scripts to a `scripts/` or `tests/` directory).
