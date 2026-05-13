# Implementation Plan: Skriibe AMA Platform Integration

This plan outlines the steps to build Phase 1 of the skriibe AMA platform directly into the existing `frontend/` and `backend/` directories, following the strict rules provided.

## User Review Required

> [!IMPORTANT]  
> Please review this plan to ensure it aligns with your expectations before I begin execution. Notably, because the absolute rules forbid modifying `Hero.jsx`, I will place the "I'm a creator" CTA button inside the `/` route wrapper in `App.jsx` (which contains the `Hero` component) or use a minimal DOM injection if it absolutely must sit *inside* the Hero component's button group. Currently, the plan is to render it in `App.jsx` directly below the `<Hero />` section or use a dedicated `LandingPage` layout.

## Open Questions

- Placing the new CTA button *below the existing primary CTA button* is requested, but I cannot modify `Hero.jsx` or `WaitlistForm.jsx` where the existing CTAs live. I will place the new button in `App.jsx` directly below the `<Hero />` component, centered, so it appears below the hero section's content. Is this acceptable, or should I attempt a DOM insertion effect from `App.jsx`? (I will proceed with the safe `App.jsx` placement).

## Proposed Changes

### Task 1: Verify `skriibe-app` Deletion
- Verify that `skriibe-app/` has been fully removed. (User has already completed this).

### Task 2: Update CSS and HTML
- **`frontend/src/index.css`**: Append the `/* ─── SKRIIBE AMA DESIGN TOKENS ─── */` block at the bottom of the file.
- **`frontend/index.html`**: Append the Google Fonts stylesheet link in the `<head>`.

### Task 3: AMA Component Library
- Create directories: `frontend/src/components/ama/ui/` and `frontend/src/components/ama/layout/`.
- Implement `Button.jsx`, `Badge.jsx`, `Avatar.jsx`, `LivePulse.jsx`, `StatCard.jsx`, `Field.jsx`, `SLABadge.jsx`, and `CharCounter.jsx` using the provided logic and strictly adhering to CSS tokens.
- Implement `PhoneFrame.jsx` (exact dimensions 335x680px) and `PageWrapper.jsx` in the `layout/` directory.

### Task 4 & 5: Routes & Placeholder Pages
- Create `frontend/src/pages/AMAPlaceholder.jsx` with the exact layout specified.
- Create empty files for all placeholder routes that re-export `AMAPlaceholder` with their respective names.
- Update `frontend/src/App.jsx` to wrap the entire app in `BrowserRouter` (or `RouterProvider`).
- Move the existing `Navbar`, `Hero`, `DMCounter`, `StorySteps`, `FlowGraphic`, `WaitlistForm`, and `Footer` into the index (`/`) route.
- Implement `CreatorRoute` and `AdminRoute` wrappers in `App.jsx`.
- Define all specified routes under `/creator/...`, `/admin/...`, and `/dev/components`.
- Ensure the `/:handle` route is placed last.

### Task 6: Component Showcase
- Implement `frontend/src/pages/dev/ComponentShowcase.jsx` importing all AMA components and displaying all requested variants.

### Task 7: Landing Page CTA Button
- Inside `App.jsx`, render the new "I'm a creator — ask me anything →" button. To avoid modifying `Hero.jsx`, it will be placed in the `/` route definition, visually positioned to fit naturally within the landing page flow. 

### Task 8, 9 & 10: Backend Structure & Config
- Create `backend/routes/.gitkeep`, `backend/controllers/.gitkeep`, `backend/middleware/.gitkeep`.
- Implement `backend/middleware/auth.js` for JWT cookie verification (`verifyCreatorToken`, `verifyAdminToken`).
- Implement `backend/middleware/errorHandler.js`.
- Append the required `JWT_SECRET`, `CLIENT_URL`, and placeholder keys to `backend/.env` without overwriting existing vars.

### Task 11: Backend Server Update
- Update `backend/server.js`:
  - `npm install cookie-parser jsonwebtoken` inside `backend/`.
  - Import `cookie-parser` and `errorHandler`.
  - Add `app.use(cookieParser())` middleware.
  - Add `app.use(errorHandler)` as the final middleware.

## Verification Plan
1. **Frontend**: Ensure `npm run dev` in `frontend/` starts successfully without errors. Navigate to `http://localhost:5173/dev/components` to visually confirm all 8 components and variants render flawlessly.
2. **Routing**: Verify that navigating to `/creator/dashboard` redirects to `/creator/signup` due to missing cookies, and similarly for `/admin/dashboard`.
3. **Backend**: Ensure `node server.js` boots gracefully with MongoDB connection.
4. **Git Diff**: Verify that `WaitlistForm.jsx`, `Hero.jsx`, `Navbar.jsx`, etc. remain untouched.
