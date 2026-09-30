# Changelog

## 2026-09-30

### Cleanup
- Removed numerous 0-byte ghost files from the root directory (e.g. `check.js`, `list.js`, `temp.txt`, `{const`, `{file`, etc.).
- Removed temporary scratch scripts cluttering the root directory (e.g. `check_*.js`, `find_*.js`, `search_*.js`, `test_*.js`, `script*.js`).
- Removed unused and detached scripts from the root directory (`backfill_alerts.js`, `clean.ps1`, `diff_backend.txt`, `fetch_alerts.js`, `insert_alert.js`, `syntax-check.js`, `temp-merge.patch`, `fallback.log`).
- Retained essential configuration files, documentation, and the main source directories (`backend`, `frontend`, `admin-frontend`).

### Structure Assessment
- Recorded initial review of the codebase folder structure for future refactoring (moving root images to an assets folder, setting up a shared workspace, migrating backend scripts to a `scripts/` or `tests/` directory).
