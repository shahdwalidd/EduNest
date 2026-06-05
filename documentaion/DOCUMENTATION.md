# EduNest — Frontend System Documentation
### *Enterprise-Grade Technical Reference | React 19 · TypeScript · Vite*

> **Document Scope:** This documentation provides a complete architectural blueprint of the EduNest frontend application — a production-grade web platform that bridges students with professional mentors. It is intended for senior engineers, system architects, onboarding developers, and technical stakeholders.

---

## Table of Contents

1. [System Architecture](#1-system-architecture)
   - 1.1 [Complete Directory Layout](#11-complete-directory-layout)
   - 1.2 [Component Communication & Data Flow Diagram](#12-component-communication--data-flow-diagram)
   - 1.3 [RBAC Routing & Protected Route Architecture](#13-rbac-routing--protected-route-architecture)
2. [Technologies Used](#2-technologies-used)
3. [Functional Requirements](#3-functional-requirements)
   - 3A. [Home & Authentication Flows](#3a-home--authentication-flows)
   - 3B. [Advanced Features & Mentor Workspace](#3b-advanced-features--mentor-workspace)
4. [Build, Deployment & Performance Optimizations](#4-build-deployment--performance-optimizations)

---

---

## 1. System Architecture

### 1.1 Complete Directory Layout

The following tree represents the full `src/` directory structure. The design enforces a strict **separation of concerns** across five primary layers: presentation (components/pages), orchestration (hooks), communication (services), navigation (routes), and state management (store/context).

```
src/
│
├── App.tsx                        # ← Global route entrypoint; React.lazy code-splitting
├── main.tsx                       # ← DOM mount; global provider hierarchy wrapping
│
├── components/                    # Reusable, composable UI primitives
│   ├── common/                    # Cross-cutting shared components
│   │   ├── toaster/
│   │   │   └── CustomToaster.tsx  # Branded react-hot-toast wrapper
│   │   ├── ProtectedRoute.tsx     # RBAC guard — blocks unauthorized role access
│   │   └── LoadingSpinner.tsx
│   │
│   ├── layout/
│   │   └── BasicLayout.tsx        # Auth-page shell layout wrapper
│   │
│   ├── register-com/              # Registration form atomic components
│   │   ├── FormHeader.tsx
│   │   ├── JoinAsToggle.tsx       # Student ↔ Mentor role switcher
│   │   ├── PasswordInput.tsx
│   │   ├── FirstNameInput.tsx
│   │   ├── LastNameInput.tsx
│   │   ├── EmailInput.tsx
│   │   ├── PhoneInput.tsx
│   │   └── SubmitButton.tsx
│   │
│   ├── verify-com/                # OTP verification atomic components
│   │   ├── CodeInput.tsx
│   │   ├── ConfirmButton.tsx
│   │   └── ResendLink.tsx
│   │
│   ├── forgetPass-com/            # Password recovery atomic components
│   │
│   ├── admin/                     # Admin-specific UI blocks
│   │   └── admin-dash-com/
│   │
│   ├── student/                   # Student-specific UI blocks
│   │   ├── student-dash-com/
│   │   ├── student-learning-com/
│   │   └── explore-com/
│   │
│   └── mentor-components/         # Mentor-specific UI blocks
│       ├── mentor-dash-com/       # Dashboard KPI widgets, charts, tables
│       ├── mentor-message-com/    # Chat list, message bubbles, room modals
│       ├── mentor-notifications-com/ # Notification cards, tab headers
│       ├── mentor-profile-com/    # Profile display, EditModal
│       └── mentor-setting-com/    # Settings form sections
│
├── context/                       # React context providers (non-persistent cross-cutting state)
│   ├── ThemeContext.tsx            # Light / Dark mode provider
│   ├── WebSocketContext.tsx        # STOMP-over-WS persistent connection manager
│   └── NotificationsContext.tsx    # Real-time notification event propagator
│
├── hooks/                         # Custom hooks — business logic & data orchestration
│   ├── useLogin.ts
│   ├── useRegisterForm.ts
│   ├── useVerifyForm.ts
│   ├── useForgetPassForm.ts
│   ├── useResetPassForm.ts
│   ├── useMentorships.ts          # React Query-backed mentorship catalog
│   ├── Usementorprofile.ts
│   ├── Usementorsettings.ts
│   ├── Usedirectchat.ts           # WebSocket-integrated direct messaging state
│   └── Useroomchat.ts             # Room/group chat state management
│
├── pages/                         # Route-level view components
│   ├── Home.tsx                   # Public landing composition page
│   ├── Login/
│   │   └── Login.tsx
│   ├── register/
│   │   └── Register.tsx
│   ├── verifiy/
│   │   └── Verify.tsx
│   ├── forgetPass/
│   │   ├── ForgetPass.tsx
│   │   ├── CheckEmail.tsx
│   │   ├── ResetPassword.tsx
│   │   └── ResetSuccess.tsx
│   ├── mentorships/               # Public mentorship catalog & detail pages
│   │
│   ├── mentor-pages/              # ROLE_MENTOR protected workspace
│   │   ├── mentordash/
│   │   │   ├── MentorDash.tsx
│   │   │   └── hooks/
│   │   │       └── useDashboardData.ts
│   │   ├── mentorProfile/
│   │   │   └── ProfilePage.tsx
│   │   ├── mentorMessages/
│   │   │   └── Messages.tsx
│   │   ├── mentorNotifications/
│   │   │   └── NotificationsList.tsx
│   │   └── mentorSettings/
│   │
│   ├── student-pages/             # ROLE_STUDENT protected learning space
│   │   ├── studentDash/
│   │   ├── exploreMentorships/
│   │   ├── learning/
│   │   └── ...
│   │
│   └── admin-pages/               # ROLE_ADMIN global control panel
│       └── AdminDash/
│
├── routes/                        # Navigation access control layer
│   └── ProtectedRoute.tsx         # Role-assertion guard; redirects on mismatch
│
├── services/                      # Axios-based HTTP client infrastructure
│   ├── api.ts                     # Axios instance: base URL, interceptors, token refresh
│   ├── authService.ts             # Auth endpoints: login, register, OTP, password reset
│   ├── mentorDashboardService/
│   │   └── dashboard.ts           # Dashboard, reviews, sessions endpoints
│   ├── Mentorprofileservice.ts
│   └── Mentorsettingsservice.ts
│
├── store/                         # Zustand global client-state engines
│   └── useAuthStore.ts            # JWT token, user role, auth lifecycle persistence
│
├── types/                         # Shared TypeScript interfaces & type declarations
│   ├── auth.types.ts
│   ├── mentorship.types.ts
│   ├── mentor.types.ts
│   └── notification.types.ts
│
└── utils/
    ├── constants.ts               # Static config: ABOUT_IMAGES, ABOUT_STATS, dummyBlogs
    └── helpers.ts
```

---

### 1.2 Component Communication & Data Flow Diagram

The following diagram illustrates how data flows from user interaction through each architectural layer of the EduNest frontend — from the UI surface, through orchestration hooks, to the persistence and transport layers.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         PRESENTATION LAYER                                  │
│   ┌──────────────┐    ┌──────────────────┐    ┌──────────────────────────┐  │
│   │  Page Views  │    │  Layout Wrappers │    │  Atomic UI Components   │  │
│   │ (src/pages/) │    │ (BasicLayout etc)│    │  (src/components/**)    │  │
│   └──────┬───────┘    └────────┬─────────┘    └────────────┬─────────────┘  │
│          │                     │                            │                │
│          └─────────────────────┴────────────────────────────┘                │
│                                │  Props / Events                             │
└────────────────────────────────┼────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        ORCHESTRATION LAYER (Hooks)                          │
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │  Custom Hooks  (src/hooks/** & src/pages/**/hooks/**)               │   │
│   │                                                                     │   │
│   │  useLogin()  useRegisterForm()  useDashboardData()  useDirectChat() │   │
│   │  useMentorProfile()  useVerifyForm()  useRoomChat()  ...           │   │
│   └──────────────────────┬──────────────────────┬────────────────────┘    │
│                           │                      │                          │
│            React Query    │               Zustand │                          │
│          (server state)   │             (client   │                          │
│                           │              state)   │                          │
└───────────────────────────┼──────────────────────┼──────────────────────────┘
                            │                      │
          ┌─────────────────┘                      └───────────────────┐
          ▼                                                             ▼
┌─────────────────────────┐                               ┌────────────────────┐
│   SERVICE LAYER         │                               │   ZUSTAND STORE    │
│   (src/services/api.ts) │                               │ (useAuthStore.ts)  │
│                         │                               │                    │
│  Axios Instance         │                               │  • JWT Token       │
│  • Base URL: /api       │                               │  • User Role       │
│  • Auth interceptor     │                               │  • User Profile    │
│  • Token refresh MW     │                               │  • Auth status     │
│  • Error handling       │                               │                    │
│                         │                               │  ↕ localStorage    │
│  authService.ts         │                               │  ('auth-store')    │
│  dashboard.ts           │                               └────────────────────┘
│  Mentorprofileservice.ts│
└──────────┬──────────────┘
           │
           │  HTTP (REST)              WebSocket / STOMP
           │  GET / POST /             ┌─────────────────────────────┐
           ▼  PUT / DELETE             │    WebSocketContext.tsx      │
┌────────────────────────┐            │                             │
│   BACKEND API          │◄──────────►│  Full-duplex STOMP channel  │
│   http://localhost:8080│            │                             │
│   /api/v1/**           │            │  • Real-time notifications  │
│                        │            │  • Dashboard activity feed  │
│  Auth, Mentorship,     │            │  • Live chat messages       │
│  Dashboard, Profile,   │            └────────────┬────────────────┘
│  Messages endpoints    │                         │
└────────────────────────┘                         ▼
                                       NotificationsContext.tsx
                                       (event propagation to UI)
```

**Key data flow notes:**

- **Unidirectional data flow** is enforced across all page/component interactions. Pages own no direct server state — they delegate entirely to hooks.
- **React Query** manages all server-state: caching, background re-fetch, stale-while-revalidate strategies. Hooks like `useDashboardData` and `useMentorships` are built on top of it.
- **Zustand** manages only synchronous client-side auth state (token, role). It persists to `localStorage` under the key `auth-store` to survive browser refreshes.
- **Axios interceptors** in `src/services/api.ts` automatically attach Bearer tokens on every outbound request and transparently invoke `refreshAccessToken()` on 401 responses before retrying.
- **WebSocket/STOMP** operates as a parallel real-time channel, entirely managed by `WebSocketContext`. Components consume live events via `NotificationsContext`.

---

### 1.3 RBAC Routing & Protected Route Architecture

EduNest implements a strict **Role-Based Access Control** routing system, preventing cross-role access at the router level — not just the server level. The `ProtectedRoute` guard component (`src/routes/ProtectedRoute.tsx`) is the single enforcement point for all role isolation.

#### How `ProtectedRoute` Works

```
User navigates to a protected route
            │
            ▼
┌───────────────────────────┐
│       ProtectedRoute      │
│  Reads from useAuthStore  │
│  • isAuthenticated?       │
│  • userRole?              │
└─────────────┬─────────────┘
              │
    ┌─────────┴──────────┐
    │                    │
    ▼                    ▼
Not Authenticated    Authenticated
    │                    │
    ▼              ┌─────┴──────┐
Redirect to        │ Role Match? │
  /login           └─────┬──────┘
                         │
              ┌──────────┴──────────┐
              │                     │
              ▼                     ▼
         Role Matches          Role Mismatch
              │                     │
              ▼                     ▼
      Render <Outlet />     Redirect to role's
      (Protected content)   own home route
                            (or /unauthorized)
```

#### Route Guard Configuration (App.tsx)

```tsx
// Mentor workspace — only ROLE_MENTOR passes through
<Route element={<ProtectedRoute allowedRoles={["ROLE_MENTOR"]} />}>
  <Route path="/mentor/dashboard" element={<MentorDash />} />
  <Route path="/mentor/messages"  element={<Messages />} />
  <Route path="/mentor/profile"   element={<ProfilePage />} />
  {/* ... other mentor routes */}
</Route>

// Student learning space — only ROLE_STUDENT passes through
<Route element={<ProtectedRoute allowedRoles={["ROLE_STUDENT"]} />}>
  <Route path="/student/dashboard" element={<StudentDash />} />
  <Route path="/student/learning"  element={<LearningPage />} />
  {/* ... other student routes */}
</Route>

// Admin control panel — only ROLE_ADMIN passes through
<Route element={<ProtectedRoute allowedRoles={["ROLE_ADMIN"]} />}>
  <Route path="/admin/dashboard" element={<AdminDash />} />
</Route>
```

#### Role Space Isolation Summary

| Role | Permitted Route Namespace | Access Denied Behavior |
|---|---|---|
| `ROLE_MENTOR` | `/mentor/**` | Redirect to `/student/dashboard` or `/login` |
| `ROLE_STUDENT` | `/student/**`, `/explore-mentorships`, `/student/learning/**` | Redirect to `/mentor/dashboard` or `/login` |
| `ROLE_ADMIN` | `/admin/**` | Redirect to appropriate role home |
| Guest (no token) | Public routes only (`/`, `/login`, `/mentorships`, etc.) | Redirect to `/login` |

> **Design principle:** Role enforcement happens exclusively at the client-router boundary via `ProtectedRoute`. This defense-in-depth approach complements server-side authorization — the frontend guard prevents unauthorized route rendering and protects UX integrity, while the backend independently validates JWT claims on every API request.

---

---

## 2. Technologies Used

| Technology / Library | Core Purpose | Internal Mechanics & Performance Benefit |
|---|---|---|
| **React 19** | Component-based UI rendering engine | Leverages the new Compiler (auto-memoization), Concurrent Mode, and `useTransition` for non-blocking state updates. `React.lazy` + `Suspense` enable on-demand code-splitting, reducing initial bundle by deferring non-critical routes. |
| **TypeScript** | Statically typed application language | Compile-time type checking eliminates an entire class of runtime errors. Shared `src/types/**` interfaces enforce contract consistency between the service layer, hooks, and UI components. Improves IDE autocomplete, refactoring safety, and API shape validation. |
| **Vite** | Build tooling & development server | Uses native ES Modules for zero-bundle HMR during development (sub-50ms updates). Production builds leverage Rollup with `esbuild` minification — significantly faster than Webpack. `manualChunks` config enables deterministic vendor splitting for long-term cache efficiency. |
| **React Router DOM** | Client-side routing and navigation | Declarative nested route trees with `<Outlet />` enable layout composition. `useNavigate` and `useLocation` hooks power programmatic redirect flows (post-login, post-OTP). `useSearchParams` synchronizes filter/pagination state with the URL bar. |
| **@tanstack/react-query** | Server-state management and caching | Implements stale-while-revalidate caching, automatic background re-fetching, and deduplication of concurrent requests. Hooks like `useDashboardData` benefit from zero-configuration loading/error states and paginated query keys for independent cache slots per page. |
| **Zustand** | Lightweight global client-state store | Minimal boilerplate with a subscribe-based update model. The `useAuthStore` persists auth tokens and user roles to `localStorage` via the `persist` middleware, surviving full page refreshes without re-authentication roundtrips. |
| **TailwindCSS** | Utility-first responsive styling | JIT (Just-In-Time) compilation purges all unused CSS at build time, producing sub-10KB stylesheets in production. Consistent design tokens (spacing, colors, breakpoints) are applied directly in JSX, eliminating context-switching between CSS files. |
| **Axios** | Configurable HTTP client | Interceptor middleware in `src/services/api.ts` automatically attaches `Authorization: Bearer <token>` headers. A response interceptor transparently handles 401 errors by calling `refreshAccessToken()` and retrying the original request — providing seamless session renewal without UX disruption. |
| **WebSocket / STOMP** | Bidirectional real-time communication | STOMP protocol over a persistent WebSocket connection (managed by `WebSocketContext`) enables server-push events for notifications, live dashboard updates, and chat messages. Eliminates long-polling overhead, reducing server load and achieving sub-100ms message delivery. |
| **@jitsi/react-sdk** | Embedded live video conferencing | Renders Jitsi Meet inside a controlled React component with configurable room names, subject, and user info. Isolated into its own Vite chunk (`vendor-jitsi`) to ensure the heavyweight conferencing library is only loaded when a session page is actually visited. |
| **react-hot-toast** | Non-blocking toast notification UI | Renders toasts in a dedicated `CustomToaster` wrapper outside the main React tree, preventing unnecessary re-renders of the application body. Supports custom icons and themed styling aligned with EduNest's design system. |

---

---

## 3. Functional Requirements

---

### 3A. Home & Authentication Flows

---

#### 3A.1 — Main Landing Page

**Route:** `/` → `src/pages/Home.tsx`

**Functional Description:**

The Home page is a **composition-only** component — it owns zero business logic and instead serves as the structural container that assembles the full landing experience. Every visual block is an independently imported, self-contained section component, enabling isolated development and lazy-loadable future refactoring.

The page supports **in-page anchor navigation** by wrapping every section in a semantically identified `<section id="...">` element. This allows the top navigation bar to link directly to specific content blocks (e.g., `/#services`, `/#about`) without any client-side routing, maintaining scroll behavior natively through the browser.

**Page Composition Architecture:**

```
Home.tsx
  ├── HeroSection         (img: from useHomeImages())
  ├── ServicesSection
  ├── WhyChooseUsSection
  ├── MentorshipsSection
  ├── AboutSection        (images: ABOUT_IMAGES, stats: ABOUT_STATS from constants.ts)
  ├── Blog                (dummyBlogs: from constants.ts)
  ├── Testimonials
  ├── ContactUsSection
  └── FooterSection
```

**Data Dependencies:**
- `useHomeImages()` — custom hook supplying hero/landing visual asset URLs
- `src/utils/constants.ts` — provides `ABOUT_IMAGES`, `ABOUT_STATS`, and `dummyBlogs` static data arrays

**Section Anchor IDs:** `services` · `why-us` · `mentorships` · `about` · `blogs` · `testimonials` · `contactUs` · `footerSection`

![Main Landing Page — Hero Section](Screenshots/Home/Hero.png)
![Main Landing Page — Services Section](Screenshots/Home/Services.png)
![Main Landing Page — Mentorships Section](Screenshots/Home/Mentorships.png)

---

#### 3A.2 — Login Page

**Route:** `/login` → `src/pages/Login/Login.tsx`  
**Hook:** `useLogin()` (`src/hooks/useLogin.ts`)  
**Service:** `login(credentials)` in `src/services/authService.ts`

**Functional Description:**

The Login page delivers a secure, feedback-rich authentication experience. The form implements **real-time regex email validation**: as the user types, the email field evaluates the input pattern against a standard RFC-compliant email regex and renders a green checkmark icon the moment the address becomes syntactically valid — before form submission. This provides immediate visual confidence without an API round-trip.

The **password field** includes a show/hide visibility toggle (eye icon) that switches the input `type` attribute between `"password"` and `"text"`, allowing users to verify their credentials before submitting.

**Session Persistence:** Upon successful authentication, `useLogin()` dispatches the received JWT access and refresh tokens to `useAuthStore`, which writes them to `localStorage` under the `auth-store` key. The `"Remember me"` checkbox modulates session persistence behavior. The user is then navigated to their role-appropriate dashboard via `useNavigate()`.

**Key Behaviors:**
- Live email format validation with inline visual feedback
- Password visibility toggle
- "Forgot password?" link → `/forgot-password`
- "Remember me" checkbox for session duration control
- `handleSubmit` triggers `login()` service call and Zustand store update on success

![Login Page](Screenshots/Auth/Login.png)

---

#### 3A.3 — Registration Page

**Route:** `/register` → `src/pages/register/Register.tsx`  
**Hook:** `useRegisterForm()` (`src/hooks/useRegisterForm.ts`)  
**Services:** `registerStudent()`, `registerMentor()`, `sendOtp()` from `src/services/authService.ts`

**Functional Description:**

The Registration page serves both Student and Mentor onboarding through a **single shared form screen**, with the `JoinAsToggle` component acting as the critical role-differentiation mechanism. When the user selects a role, `joinAs` state updates within `useRegisterForm()`, which then routes the submission to the appropriate service function.

**The `JoinAsToggle` Mechanic:**

```
User clicks toggle
        │
        ▼
  useRegisterForm() updates joinAs state
        │
   ┌────┴────┐
   │         │
"student" "mentor"
   │         │
   ▼         ▼
registerStudent() registerMentor()
  (API call)       (API call)
```

**Post-Registration Flow:**

Upon a successful API response, the form executes a three-step context persistence and navigation sequence:

1. `localStorage.setItem("registrationEmail", form.formData.email)` — persists email for the OTP page to consume
2. `localStorage.setItem("registrationType", form.joinAs)` — persists role context for post-verification routing
3. `sendOtp(form.formData.email)` — triggers OTP delivery to the registered address
4. `navigate("/verify")` — transitions to the OTP verification screen

**Unverified Account Handling:** If the backend returns an "unverified account" error (e.g., a previous incomplete registration), the hook transparently re-invokes `sendOtp()` and still navigates to `/verify`, providing a seamless recovery path.

![Registration Page](Screenshots/Auth/Register.png)

---

#### 3A.4 — OTP Verification Page

**Route:** `/verify` → `src/pages/verifiy/Verify.tsx`  
**Hook:** `useVerifyForm()` (`src/hooks/useVerifyForm.ts`)  
**Service:** `verifyOTP(code)` in `src/services/authService.ts`

**Functional Description:**

The OTP Verification page presents a **6-digit code input system** where each digit occupies a discrete, focused input field. The page enforces input integrity and rate-limiting through a built-in countdown timer.

**Email Recovery Guard:** On mount, the page reads `registrationEmail` from `localStorage`. If the key is absent (direct navigation without registering), the user is immediately redirected to `/register`, preventing orphaned verification sessions.

**120-Second Countdown Timer:**
- Timer begins immediately on page mount.
- The "Resend OTP" action (`ResendLink` component) is **disabled** for the full 120-second window.
- Upon expiry, the resend action becomes available. Triggering it calls the OTP service, resets the countdown, and clears existing inputs.
- This anti-abuse mechanism prevents OTP flooding while remaining within standard UX tolerance thresholds.

**Submission Flow:**
- `handleSubmit()` from `useVerifyForm()` assembles the 6-digit code and calls `verifyOTP(code)`.
- On success: navigates to `/success` (role-aware onboarding completion screen).
- On failure: displays an error toast via `react-hot-toast` and clears the inputs.

**UI Component Breakdown:**
- `CodeInput` — 6 discrete controlled inputs with auto-focus advancement
- `ConfirmButton` — submits assembled OTP string
- `ResendLink` — timer-gated resend action

![OTP Verification Page](Screenshots/Auth/VerifyOtp.png)

---

#### 3A.5 — Password Recovery Flow

**Routes:**
- Step 1 — Request Reset: `/forgot-password` → `src/pages/forgetPass/ForgetPass.tsx`
- Step 2 — OTP Verification: `/check-email` → `src/pages/forgetPass/CheckEmail.tsx`
- Step 3 — New Password: `/reset-password` → `src/pages/forgetPass/ResetPassword.tsx`
- Step 4 — Success: `/reset-success` → `src/pages/forgetPass/ResetSuccess.tsx`

**Hooks:** `useForgetPassForm()` · `useResetPassForm()`  
**Services:** `forgetPassword(email)` · `forgetPasswordVerifyOtp(email, otp)` · `forgetResetPassword(email, password)`

**Functional Description:**

The password recovery flow is a **four-step linear pipeline**, each screen owning a discrete responsibility:

**Step 1 — Email Request (`ForgetPass.tsx`):**
The user enters their registered email address. `useForgetPassForm()` calls `forgetPassword(email)`. On success, the flow advances to the OTP check screen.

**Step 2 — OTP Input with Enhanced UX (`CheckEmail.tsx`):**
This screen presents 6 discrete OTP input fields with two critical UX enhancements:

- **Automatic forward focus:** After a digit is entered, focus automatically shifts to the next input field — no manual tabbing required.
- **Backspace navigation:** Pressing `Backspace` on an empty field moves focus to the previous field, enabling seamless correction without mouse interaction.

A **60-second countdown** gates the resend action. Upon resend, the timer resets and all OTP inputs are cleared. `forgetPasswordVerifyOtp(email, otp)` validates the code. The email is also persisted to `localStorage.setItem("resetEmail", email)` as a fallback for the next step.

**Step 3 — New Password Entry (`ResetPassword.tsx`):**
`useResetPassForm()` reads the verified email from `location.state?.email` (passed via router state). If router state is unavailable (e.g., direct navigation), it falls back to `localStorage.getItem("resetEmail")`. `form.validate()` enforces password strength rules before calling `forgetResetPassword(email, newPassword)`. On success, navigates to `/reset-success`.

**Step 4 — Success CTA (`ResetSuccess.tsx`):**
Displays a `"Reset successful!!"` confirmation message with a single CTA button (`navigate("/login")`), cleanly closing the recovery loop.

![Forgot Password — Email Step](Screenshots/Auth/ForgotPassword.png)
![Forgot Password — OTP Check](Screenshots/Auth/CheckEmailOtp.png)
![Reset Password — New Password Form](Screenshots/Auth/ResetPassword.png)
![Reset Password — Success Screen](Screenshots/Auth/ResetSuccess.png)

---

### 3B. Advanced Features & Mentor Workspace

---

#### 3B.1 — Explore Mentorships Engine

**Route:** `/explore-mentorships` (student-protected)  
**Hook:** Uses React Query via `useMentorships.ts`  
**API Endpoint:** `GET /api/v1/mentorship/explore`

**Functional Description:**

The Explore Mentorships page is a **high-fidelity discovery interface** engineered to deliver responsive, multi-dimensional search over the full mentorship catalog without degrading backend performance.

**500ms Debounce on Text Search:**
Every keystroke in the keyword search input is captured, but the API call is deferred by a custom 500ms debounce window. Only after the user pauses typing for half a second does the request fire. This eliminates redundant API calls for intermediate keystrokes, reducing server query load by an estimated 80–90% during active typing.

**Multi-Tier Filtering Matrix:**
The filter system supports four simultaneous, combinable query dimensions:

```
Active Filters:
 ┌──────────────┬──────────────────┬─────────────┬─────────────┐
 │ Keyword      │ Category         │ Min Price   │ Max Price   │
 │ (debounced)  │ (enum select)    │ (numeric)   │ (numeric)   │
 └──────────────┴──────────────────┴─────────────┴─────────────┘
         │               │               │              │
         └───────────────┴───────────────┴──────────────┘
                                 │
                    GET /api/v1/mentorship/explore
                    ?keyword=X&category=Y&minPrice=A&maxPrice=B&page=0&size=10
```

An **Instant Reset** action clears all active filters simultaneously and resets to the default empty-state query.

**URL State Synchronization:**
The current search configuration (keyword, category, price range, current page) is serialized into `useSearchParams()` and reflected live in the browser URL bar. This means users can **bookmark** a specific filtered view or **share** a URL with a colleague and they will land on the identical filtered, paginated result set — a critical usability feature for professional users.

**Predictive UI States:**
- **Loading:** Skeleton card placeholders render during pending API requests, preventing layout shift (CLS).
- **Error:** A fail-safe error component renders with a retry CTA on network or server failures.
- **Empty:** An expressive empty-state illustration renders when no results match the active filters.

**Pagination:**
State-aware pagination renders visible bounds (e.g., "Showing 1–10 of 47 results") alongside a dynamic page-count navigator.

**Supported Query Parameters:**
```
?page=0&size=10&keyword=typescript&category=development&minPrice=10&maxPrice=150
```

![Explore Mentorships Engine](Screenshots/Student/ExploreMentorships.png)

---

#### 3B.2 — Mentor Dashboard

**Route:** `/mentor/dashboard` → `src/pages/mentor-pages/mentordash/MentorDash.tsx`  
**Hook:** `useDashboardData()` (`src/pages/mentor-pages/mentordash/hooks/useDashboardData.ts`)  
**Services:** `getMentorDashboard()`, `getDashboardReviews(page)`, `getDashboardSessions(page)` from `src/services/mentorDashboardService/dashboard.ts`

**Functional Description:**

The Mentor Dashboard is the **primary operational command center**, providing mentors with a real-time overview of their platform performance across four key dimensions.

**Analytic KPI Cards:**
Four top-level stat cards display: Total Students, Active Mentorships, Average Rating, and Total Revenue. These values are fetched on mount via `getMentorDashboard()` and served from the initial dashboard payload.

**Revenue Chart:**
A dynamic revenue visualization (powered by a charting library isolated in the `vendor-charts` bundle chunk) renders historical earnings over time. The chart updates reactively when `useDashboardData()` resolves new data.

**Paginated Data Tables:**
Two independently paginated sections exist within the dashboard:
- **Reviews Table:** Paginated via `getDashboardReviews(page)`. Each page navigation triggers a discrete React Query cache key, fetching only the requested page.
- **Scheduled Sessions Table:** Paginated via `getDashboardSessions(page)`. Displays upcoming session metadata (student, time, mentorship name).

**WebSocket Notification Stream Integration:**
The dashboard subscribes to `useNotificationsSocket` from `WebSocketContext`. When a new notification event arrives over the STOMP channel (e.g., a new enrollment, a student message), the dashboard's recent activity section refreshes, providing a **live, push-driven activity feed** without polling.

**Loading Strategy:**
`useDashboardData()` exposes a unified `isLoading` flag. During initial hydration, the entire dashboard renders **skeleton placeholder widgets** — matching the structural layout of the real content — preventing cumulative layout shift and communicating activity to the user.

![Mentor Dashboard — Overview](Screenshots/MentorDashboard.png)

---

#### 3B.3 — Mentor Profile Page

**Route:** `/mentor/profile` → `src/pages/mentor-pages/mentorProfile/ProfilePage.tsx`  
**Hook:** `useMentorProfile()` (`src/hooks/Usementorprofile.ts`)  
**Service:** `src/services/Mentorprofileservice.ts`

**Functional Description:**

The Mentor Profile page presents a comprehensive view of the mentor's personal and professional identity, with inline editing capabilities surfaced through a **localized modal system**.

**Profile Display Sections:**
- Personal information (name, headline, bio)
- Professional links (LinkedIn, GitHub)
- Profile picture with last-updated timestamp

**Edit Workflow — Modal-Based Architecture:**
Rather than converting the profile view into a full edit form (which degrades context), editing is surfaced through discrete `EditModal` dialogs local to `ProfilePage.tsx`. Each editable section (Personal Info, Bio, Links) has its own modal trigger. The `useMentorProfile()` hook exposes `updateProfile(data)` methods for each section, and on success, the React Query cache is invalidated to trigger a fresh re-fetch.

**Profile Picture Upload:**
The `uploadImage(file)` method exposed by `useMentorProfile()` handles the file upload pipeline: the mentor selects a file via a hidden `<input type="file" />`, the hook sends it as a `multipart/form-data` request, and on success, the profile image URL in the view is updated.

**LinkedIn / GitHub Links Editing:**
Handled through the links-specific modal. Both fields are validated for URL format before the update API call is dispatched.

![Mentor Profile Page](Screenshots/MentorProfile.png)

---

#### 3B.4 — Mentor Messaging Center

**Route:** `/mentor/messages` → `src/pages/mentor-pages/mentorMessages/Messages.tsx`  
**Hooks:** `useDirectChat()` (`src/hooks/Usedirectchat.ts`), `useRoomChat()` (`src/hooks/Useroomchat.ts`)

**Functional Description:**

The Messaging Center is a **split-screen chat interface** supporting both one-to-one direct messaging and multi-member group room conversations, with full CRUD capabilities for message content.

**Architectural Layout:**
```
┌─────────────────────┬────────────────────────────────────┐
│   Conversation List │        Active Chat View            │
│   (Sidebar)         │                                    │
│                     │  Message thread (scrollable)       │
│  ● Direct Chats     │  ┌──────────────────────────────┐  │
│  ● Room Chats       │  │ Message bubble (sent)        │  │
│                     │  │ Message bubble (received)    │  │
│  [+ Create Room]    │  │ Edit / Delete context menu   │  │
│                     │  └──────────────────────────────┘  │
│                     │  [ Message input + Send button  ]  │
└─────────────────────┴────────────────────────────────────┘
```

**Direct Messages (`useDirectChat()`):**
Manages the list of direct conversation partners, active conversation message thread, and the send/edit/delete operations for individual messages.

**Group/Room Messages (`useRoomChat()`):**
Handles the list of joined rooms, room metadata (image, members), and supports a **Create Room** modal for initiating new group conversations. A **Room Image** modal allows updating the room's display picture.

**Message State Mutations:**
- **Edit:** Replaces message content in-place in the conversation thread via a service call. The UI shows an edit indicator on the modified message.
- **Delete:** Removes the message from the thread. The UI collapses the removed message immediately (optimistic update).

**Virtual Conversation Resolution:**
A sophisticated edge case is handled for scenarios where the mentor navigates to the messages page with an email parameter (e.g., from a student's profile) before any conversation exists. The hook creates a **virtual conversation placeholder** keyed as `direct-new-${email}` and renders it as a real conversation in the sidebar. When the mentor sends the **first message**, the virtual item is resolved and replaced by the real conversation object returned from the API — a seamless experience that hides backend conversation initialization from the user.

![Mentor Messaging Center](Screenshots/MentorMessages.png)

---

#### 3B.5 — Mentor Notifications

**Route:** `/mentor/notifications` → `src/pages/mentor-pages/mentorNotifications/NotificationsList.tsx`  
**Context:** `useNotificationsContext()` from `src/context/NotificationsContext.tsx`

**Functional Description:**

The Notifications page provides a **tab-filtered, paginated view** of all system-generated activity events for the mentor, tightly integrated with the real-time WebSocket notification stream.

**Tab-Based Filtering:**
Two tabs segment the notification list:
- **All** — displays the complete notification history
- **Unread** — filters to only unread items using client-side array filtering

Tab switching is instant (no API call) as the full notification list is held in `NotificationsContext` and filtered locally.

**Mark as Read / Dismiss — Context Propagation:**
Read and dismiss actions are dispatched through `useNotificationsContext()`, which holds the canonical notification state for the entire application. This propagation architecture ensures that:
- The **notification badge count** in the sidebar nav updates immediately when an item is marked read on this page
- The **dashboard activity feed** reflects the same read state without a refresh
- **No prop drilling** is required between the notifications page and the nav badge

**Client-Side Pagination Slicing:**
Rather than fetching a paginated API endpoint for each page of notifications, the component receives the full notifications array from context and applies `Array.slice(startIndex, endIndex)` to derive the current visible page. This eliminates network latency on page changes and is appropriate for notification lists (which are finite and already in memory).

**UI Component Breakdown:**
- `NotificationTabs` — renders the All/Unread tab switcher with live badge counts
- `NotificationCard` — renders individual notification items with timestamp, type icon, and action buttons

![Mentor Notifications](Screenshots/MentorNotifications.png)

---

---

## 4. Build, Deployment & Performance Optimizations

### 4.1 Production Build Configuration — `vite.config.ts`

EduNest's production build is meticulously configured to maximize **cache efficiency**, **parallel loading**, and **initial parse time** by splitting the application bundle into purpose-specific vendor chunks.

#### Manual Chunk Splitting Strategy

The `manualChunks` function intercepts Rollup's module bundling process and routes vendor dependencies into dedicated output files based on package identity:

```typescript
// vite.config.ts — build.rollupOptions
manualChunks(id: string) {
  if (id.includes('node_modules')) {
    if (id.includes('react'))               return 'vendor-react';    // ~45KB gzip
    if (id.includes('charts'))              return 'vendor-charts';   // ~120KB gzip
    if (id.includes('icons'))               return 'vendor-icons';    // ~30KB gzip
    if (id.includes('@jitsi'))              return 'vendor-jitsi';    // ~800KB+ gzip
    if (id.includes('alert') ||
        id.includes('toast'))               return 'vendor-alerts';   // ~8KB gzip
    return 'vendor-misc';                                              // all other deps
  }
}
```

**Why This Matters — Cache Efficiency:**

Without chunk splitting, every production deployment invalidates the entire application bundle (even if only a single line of application code changed), forcing users to re-download megabytes of unchanged vendor libraries. With deterministic vendor chunks:

```
Deployment scenario: Bug fix in MentorDash.tsx

WITHOUT manualChunks:
  → Entire bundle invalidated (1.8MB re-download for all users)

WITH manualChunks:
  → Only app-chunk invalidated (~200KB re-download)
  → vendor-react, vendor-charts, vendor-jitsi: CACHE HIT (zero bytes)
  → 89% reduction in re-download size per deployment
```

**`vendor-jitsi` Isolation Rationale:**
The Jitsi conferencing SDK is the largest single dependency in the application. By isolating it into its own chunk, it is only downloaded by users who actually navigate to a live session page — all other users never load this chunk at all.

**Additional Build Settings:**

| Configuration | Value | Effect |
|---|---|---|
| `minify` | `'esbuild'` | 10–20× faster minification vs. Terser with comparable output size |
| `cssCodeSplit` | `true` | Route-specific CSS is bundled with its JS chunk; CSS for unvisited pages is never loaded |
| `sourcemap` | `false` (production) | Eliminates `.map` file generation overhead; reduces deploy artifact size |

---

### 4.2 Asset Optimization Pipeline — `vite-plugin-image-optimizer`

All static image assets pass through an **automated compression pipeline** at build time via `vite-plugin-image-optimizer`. Compression is applied with zero runtime overhead — images are optimized once during the build and served pre-compressed.

#### Compression Quality Targets

| Format | Compression Target | Rationale |
|---|---|---|
| **PNG** | 75% quality index | Lossless-origin format; 75% strikes optimal balance between visual fidelity and file weight for UI assets (icons, logos) |
| **JPEG** | 75% quality index | Photographic content; 75% is the professional publishing standard — imperceptible quality loss with ~60% file size reduction |
| **WebP** | 70% quality index | Modern format with superior compression algorithms; 70% with WebP typically outperforms 85% JPEG at a smaller file size |
| **AVIF** | 70% quality index | Next-generation format with AV1-based compression; 70% delivers near-lossless visual quality at up to 50% smaller files than WebP |

#### Pipeline Architecture

```
Build Trigger (npm run build)
        │
        ▼
Vite processes assets
        │
        ▼
vite-plugin-image-optimizer intercepts image assets
        │
   ┌────┴────────────────────────────────────────────┐
   │        Per-file format detection                │
   └────┬──────────┬──────────┬───────────┬──────────┘
        │          │          │           │
       PNG        JPEG       WebP        AVIF
      q:75%      q:75%      q:70%       q:70%
        │          │          │           │
        └──────────┴──────────┴───────────┘
                        │
                        ▼
            Compressed files written to /dist
            (originals are NOT deployed)
```

**Build-Time vs. Runtime Rationale:**
Processing images at build time (rather than via a CDN transform or server-side resize) eliminates any per-request latency for image optimization and ensures that local development environments and CI pipelines always produce identically optimized production assets, regardless of CDN configuration.

---

### 4.3 Local Development Proxy Configuration

To resolve **CORS (Cross-Origin Resource Sharing)** restrictions during local development, `vite.config.ts` defines a proxy rule that intercepts outbound API traffic:

```typescript
// vite.config.ts
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:8080',
      changeOrigin: true,
      secure: false,
    }
  }
}
```

Any request from the Vite dev server to `/api/**` is transparently forwarded to the Spring Boot backend running on port 8080. The browser sees all requests as same-origin (`localhost:5173`), eliminating preflight CORS errors without modifying backend CORS configuration.

---

### 4.4 SEO & Accessibility Configuration

**Crawling Controls (`public/robots.txt`):**
A standardized `robots.txt` is deployed to manage search engine crawler access. Role-protected routes (`/mentor/`, `/student/`, `/admin/`) are disallowed from indexing, preventing private workspace pages from appearing in search results.

**Semantic Accessibility (`aria-label`):**
All interactive elements — icon buttons, toggle controls, and navigation landmarks — carry explicit `aria-label` attributes. This ensures screen readers can interpret the interface correctly, aligning with **WCAG 2.1 AA** accessibility standards. This is particularly important for the icon-only action buttons prevalent in the Mentor Dashboard and Messaging Center.

---

*— End of EduNest Frontend System Documentation —*

> **Document Version:** 1.0.0  
> **Last Updated:** June 2026  
> **Maintained By:** EduNest Engineering Team
