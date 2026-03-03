# Copilot Instructions for FITNESS-GURU

## Project Overview
- FITNESS-GURU is a React + Vite web application for gym management, featuring member, admin, staff, and subscription dashboards.
- The codebase is organized by feature: `components/` (UI logic), `layout/` (page structure), and `utils/` (shared utilities).

## Architecture & Patterns
- **Authentication:** Managed via `tokenManager.js` in `src/utils/`. Handles access/refresh tokens, auto-refresh, and logout. Use `ProtectedRoute.jsx` for route-level access control (including admin-only routes).
- **Dashboards:**
  - Member dashboard: `Dashboard.jsx`, wrapped in `DashboardLayout/`.
  - Admin dashboard: `AdminDashboard.jsx` with `AdminSidebar.jsx`.
  - Staff management: `StaffManagement.jsx`.
  - Subscription management: `Subscriptions.jsx`, `Membership.jsx`.
- **Layout:**
  - Dashboard pages use `DashboardLayout.jsx` for consistent navigation and content structure.
  - Sidebar and Navbar components are in `layout/Sidebar/` and `layout/Navbar/`.
- **Data Flow:**
  - API base URL is set via `VITE_API_BASE_URL` (see `.env` or Vite config).
  - API calls use tokens from `tokenManager`. Logout triggers a POST to `/api/auth/logout`.
  - User profile and dashboard data fetched from `/api/users/profile` and related endpoints.

## Developer Workflows
- **Build:** Use `npm run build` (Vite).
- **Dev:** Use `npm run dev` for hot-reload development.
- **Lint:** Use `npm run lint` (ESLint config in `eslint.config.js`).
- **No test suite is present** (as of Feb 2026).

## Conventions & Integration
- **CSS:** Each component has a matching `.css` file for styles.
- **Icons:** FontAwesome classes (e.g., `fas fa-home`) are used for dashboard icons.
- **State:** Components use React hooks (`useState`, `useEffect`).
- **Navigation:** Uses `react-router-dom` for routing and navigation.
- **Logout:** Always clear tokens via `tokenManager.logout()` after API logout.

## Examples
- To add a protected admin route:
  ```jsx
  <ProtectedRoute adminOnly>
    <AdminDashboard />
  </ProtectedRoute>
  ```
- To fetch user profile:
  ```js
  fetch(`${API_BASE_URL}/api/users/profile`, { headers: { Authorization: `Bearer ${accessToken}` } })
  ```

## Key Files
- `src/utils/tokenManager.js`: Token handling logic
- `src/utils/ProtectedRoute.jsx`: Route protection
- `src/components/Dashboard.jsx`: Member dashboard
- `src/components/AdminDashboard.jsx`: Admin dashboard
- `src/layout/DashboardLayout/DashboardLayout.jsx`: Dashboard layout
- `src/components/StaffManagement.jsx`: Staff management
- `src/components/Subscriptions.jsx`, `src/components/Membership.jsx`: Subscription logic

---
For questions or unclear patterns, check component docstrings or ask for clarification. Please review and suggest improvements if any section is unclear or incomplete.